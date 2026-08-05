// Generates data/mine/players.ts and data/mine/titles.ts from the raw data3/ dataset.
// Re-run this whenever data3/players_summary.json is refreshed:
//   node scripts/build-mine-dataset.js

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const summary = JSON.parse(fs.readFileSync(path.join(ROOT, "data3", "players_summary.json"), "utf8"));
const rawStats = JSON.parse(fs.readFileSync(path.join(ROOT, "data3", "players_stat.json"), "utf8"));
const teamsSummary = JSON.parse(fs.readFileSync(path.join(ROOT, "data3", "teams_summary.json"), "utf8"));

// Team name uses the Title Case form already used by components/Optimizer.tsx's teamByPlayerId
// (the CSS in app/team-logos.css also accepts the Rosters.tsx ALL-CAPS variants, but this is the
// primary spelling). Player order per team follows components/Rosters.tsx exactly:
// [core_1, mid, core_2, support_1, support_2].
const ROSTER = [
  ["Aurora Gaming", ["Nightfall", "Mikoto", "Ws", "Mira", "kaori"]],
  ["BoomBoys", ["Kiritych~", "gpk~", "MieRo", "Save-", "Kataomi"]],
  ["Iron Wing", ["Pure", "bzm", "33", "Ari", "Whitemon"]],
  ["Team Falcons", ["skiter", "Malr1ne", "ATF", "Cr1t-", "Sneyking"]],
  ["Team Liquid", ["m1CKe", "Nisha", "Ace", "Boxi", "tOfu"]],
  ["Team Yandex", ["watson", "CHIRA_JUNIOR", "DM", "Saksa", "Malady"]],
  ["Xtreme Gaming", ["Ame", "NothingToSay", "Xxs", "fy", "xNova"]],
  ["GamerLegion", ["Ghost", "RCY", "Fayde", "Bignum", "Speeed"]],
  ["HULIGANI", ["ssnovv1", "Mirage`", "Corrupted", "sayuw", "RESPECT"]],
  ["LGD Gaming", ["Yuma", "TaiLung", "Wisper", "Thiolicor", "KJ"]],
  ["Nigma Galaxy", ["SumaiL", "lorenof", "Davai", "OmaR", "GH"]],
  ["OG", ["Natsumi", "Yopaj-", "Raven", "TIMS", "skem"]],
  ["Team Vision", ["Satanic", "No[o]ne-", "Noticed", "9Class", "Dukalis"]],
  ["Team Resilience", ["YSR-04E", "Echozz", "niu", "planet", "zzq"]],
  ["Team Spirit", ["Yatoro", "Larl", "Collapse", "not me", "rue"]],
  ["Vici Gaming", ["shiro", "Xm", "Bach", "XinQ", "y`"]]
];

// Nicknames whose data3 key doesn't survive normalized matching (verified by hand):
//   ATF -> full handle AMMAR_THE_F, Malady -> Maladych, KJ -> full handle KingJungles
const OVERRIDES = { ATF: "AMMAR_THE_F", Malady: "Maladych", KJ: "KingJungles" };

// Field-name mapping: data3 stat-group field -> this app's StatKey. The red/blue/green split
// in data3 already matches app/data/rules.ts bannerSlotColors/statColors exactly.
const FIELD_MAP = {
  red: { kills: "kills", deaths: "deaths", creep_score: "creeps", gpm: "gpm", madstone_collected: "madstones", tower_kills: "towers" },
  blue: { obs_placed: "wards", camps_stacked: "stacks", runes_grabbed: "runes", watchers_taken: "watchers", smokes_used: "smokes", lotuses: "lotuses" },
  green: { roshan_kills: "roshan", teamfight_participation: "teamfight", stuns: "stuns", courier_kills: "courier", tormentor_kills: "tormentor", firstblood: "firstBlood" }
};

// Same official Fantasy scoring constants as data/rules.ts scoringRules, extracted as numbers so
// they can be applied programmatically. Deaths uses the affine form (fewer deaths = more points).
const CONSTANTS = {
  kills: 107, creeps: 3, gpm: 2, madstones: 13, towers: 352,
  wards: 117, stacks: 234, runes: 141, watchers: 147, lotuses: 176, smokes: 293,
  teamfight: 2124, stuns: 10, firstBlood: 1934, tormentor: 879, roshan: 1172, courier: 703
};
const DEATH_BASE = 1950;
const DEATH_SLOPE = 195;

const PREFIX_KEYS = ["crimson", "cerulean", "emerald", "royal", "golden", "elemental", "otherworldly", "heroic"];

// data3/teams_summary.json's `rates` field -> SuffixKey. These are team-wide event rates (any of
// the team's ~5 players triggers it), which is exactly how these suffixes are defined in-game -
// not something to compute per individual fantasy pick.
const TEAM_SUFFIX_FIELD_MAP = {
  total_deaths_from_torm: "tormented",
  firstblood_before_horn: "flayedTwins",
  no_firstblood_before_10min: "patient",
  "games<25min": "decisive",
  games_ended_min8: "lucky"
};

// Stats rare enough that "% of games with a non-zero value" is more informative than the mean
// alone. Computed from the raw per-game arrays in data3/players_stat.json.
const RARE_STATS = ["roshan", "courier", "tormentor", "firstBlood"];

// Reverse of FIELD_MAP: StatKey -> { group, rawField }, used to look up raw per-game arrays.
const RAW_FIELD_FOR_STAT = {};
for (const [group, fields] of Object.entries(FIELD_MAP)) {
  for (const [rawField, statKey] of Object.entries(fields)) {
    RAW_FIELD_FOR_STAT[statKey] = { group, rawField };
  }
}

// Some raw counters don't map 1:1 onto the official Fantasy scoring unit - apply a correction
// factor to the raw value before the formula constant. Madstones: the raw "collected" count
// undercounts the real scoring unit, which typically bundles ~2 from a neutral camp + ~3 from an
// ancient camp + 1-2 handed over by teammates - averaging out to roughly x2.75 per raw pickup.
const RAW_VALUE_CORRECTIONS = { madstones: 2.75 };

function applyFormula(stat, rawValue) {
  const corrected = rawValue * (RAW_VALUE_CORRECTIONS[stat] ?? 1);
  if (stat === "deaths") return DEATH_BASE - DEATH_SLOPE * corrected;
  return CONSTANTS[stat] * corrected;
}

function computeProbability(key, statKey) {
  const { group, rawField } = RAW_FIELD_FOR_STAT[statKey];
  const tournaments = rawStats[key] || {};
  let total = 0;
  let nonZero = 0;
  for (const tournament of Object.values(tournaments)) {
    const arr = (tournament.stats && tournament.stats[group] && tournament.stats[group][rawField]) || [];
    total += arr.length;
    nonZero += arr.filter((v) => v > 0).length;
  }
  return total > 0 ? Math.round((1000 * nonZero) / total) / 10 : undefined;
}

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slug(nicknames) {
  return nicknames.map(norm).join("-");
}

const summaryByNorm = new Map();
for (const key of Object.keys(summary)) {
  summaryByNorm.set(norm(key), key);
}

function resolveKey(nickname) {
  if (OVERRIDES[nickname]) return OVERRIDES[nickname];
  const key = summaryByNorm.get(norm(nickname));
  if (!key) throw new Error(`Could not resolve nickname "${nickname}" to a data3 player key`);
  return key;
}

function roleForPos(pos) {
  if (pos === 0) return "core";
  if (pos === 1) return "mid";
  if (pos === 2) return "support";
  throw new Error(`Unknown pos ${pos}`);
}

function buildTitleProbability(entry) {
  const shrunk = entry.general.title_distribution_shrunk || {};
  const total = PREFIX_KEYS.reduce((sum, k) => sum + (shrunk[k] || 0), 0);
  const out = {};
  for (const k of PREFIX_KEYS) {
    out[k] = total > 0 ? Math.round((100 * (shrunk[k] || 0)) / total * 10) / 10 : 0;
  }
  return out;
}

function buildMember(nickname) {
  const key = resolveKey(nickname);
  const entry = summary[key];
  const role = roleForPos(entry.general.pos);

  const stats = {};
  const statRange = {};
  for (const group of ["red", "blue", "green"]) {
    const groupStats = (entry.stats && entry.stats[group]) || {};
    const fields = FIELD_MAP[group];
    for (const [rawField, statKey] of Object.entries(fields)) {
      const s = groupStats[rawField];
      if (!s) continue;
      stats[statKey] = applyFormula(statKey, s.mean);
      const a = applyFormula(statKey, s.min);
      const b = applyFormula(statKey, s.max);
      statRange[statKey] = {
        min: Math.min(a, b),
        max: Math.max(a, b),
        median: applyFormula(statKey, s.median)
      };
    }
  }

  const probability = {};
  for (const statKey of RARE_STATS) {
    if (stats[statKey] === undefined) continue;
    const p = computeProbability(key, statKey);
    if (p !== undefined) probability[statKey] = p;
  }

  return {
    nickname,
    key,
    role,
    stats,
    statRange,
    titleProbability: buildTitleProbability(entry),
    probability
  };
}

// Dota's Fantasy system averages the two players of a Core/Support pair, it does not sum them.
// Mid (a single-length "pair") is unaffected: averaging one value returns that value.
function averageStats(members) {
  const out = {};
  for (const member of members) {
    for (const [statKey, value] of Object.entries(member.stats)) {
      out[statKey] = (out[statKey] || 0) + value / members.length;
    }
  }
  for (const statKey of Object.keys(out)) {
    out[statKey] = Math.round(out[statKey] * 100) / 100;
  }
  return out;
}

function roundMember(member) {
  const stats = {};
  for (const [k, v] of Object.entries(member.stats)) stats[k] = Math.round(v * 100) / 100;
  const statRange = {};
  for (const [k, v] of Object.entries(member.statRange)) {
    statRange[k] = { min: Math.round(v.min * 100) / 100, max: Math.round(v.max * 100) / 100, median: Math.round(v.median * 100) / 100 };
  }
  const result = { name: member.nickname, stats, statRange, titleProbability: member.titleProbability };
  if (Object.keys(member.probability).length) result.probability = member.probability;
  return result;
}

const players = [];
const prefixStatsByPlayerId = {};
let resolvedCount = 0;
const usedKeys = new Set();

for (const [team, nicknames] of ROSTER) {
  if (nicknames.length !== 5) throw new Error(`Team ${team} does not have exactly 5 players`);
  const members = nicknames.map(buildMember);
  resolvedCount += members.length;
  for (const m of members) {
    if (usedKeys.has(m.key)) throw new Error(`data3 key ${m.key} used twice`);
    usedKeys.add(m.key);
  }

  const [core1, mid, core2, support1, support2] = members;
  if (core1.role !== "core" || core2.role !== "core") throw new Error(`${team}: expected core at slots 1 & 3`);
  if (mid.role !== "mid") throw new Error(`${team}: expected mid at slot 2`);
  if (support1.role !== "support" || support2.role !== "support") throw new Error(`${team}: expected support at slots 4 & 5`);

  const groups = [
    { role: "core", pair: [core1, core2] },
    { role: "mid", pair: [mid] },
    { role: "support", pair: [support1, support2] }
  ];

  for (const group of groups) {
    const id = slug(group.pair.map((m) => m.nickname));
    const name = group.pair.map((m) => m.nickname).join(" & ");
    players.push({
      id,
      name,
      team,
      role: group.role,
      stats: averageStats(group.pair),
      members: group.pair.map(roundMember)
    });
    prefixStatsByPlayerId[id] = group.pair.map((m) => ({ name: m.nickname, values: m.titleProbability }));
  }
}

if (resolvedCount !== 80) throw new Error(`Resolved ${resolvedCount} players, expected 80`);
if (usedKeys.size !== 80) throw new Error(`Used ${usedKeys.size} unique data3 keys, expected 80`);
if (players.length !== 48) throw new Error(`Built ${players.length} player entries, expected 48 (16 * 3)`);

console.log(`Resolved ${resolvedCount}/80 players across ${ROSTER.length} teams -> ${players.length} roster entries (no unresolved names).`);

// ---- Emit data/mine/players.ts ----

function tsNumber(n) {
  return Number.isInteger(n) ? String(n) : String(n);
}

function tsStats(stats) {
  const parts = Object.entries(stats).map(([k, v]) => `${k}: ${tsNumber(v)}`);
  return `{ ${parts.join(", ")} }`;
}

function tsStatRange(range) {
  const parts = Object.entries(range).map(([k, v]) => `${k}: { min: ${tsNumber(v.min)}, max: ${tsNumber(v.max)}, median: ${tsNumber(v.median)} }`);
  return `{ ${parts.join(", ")} }`;
}

function tsTitleProbability(values) {
  const parts = PREFIX_KEYS.filter((k) => values[k] !== undefined).map((k) => `${k}: ${tsNumber(values[k])}`);
  return `{ ${parts.join(", ")} }`;
}

function tsMembers(members) {
  const lines = members.map((m) => {
    const probabilityField = m.probability ? `, probability: ${tsStats(m.probability)}` : "";
    return `    { name: ${JSON.stringify(m.name)}, stats: ${tsStats(m.stats)}, statRange: ${tsStatRange(m.statRange)}, titleProbability: ${tsTitleProbability(m.titleProbability)}${probabilityField} }`;
  });
  return `[\n${lines.join(",\n")}\n  ]`;
}

const playersTs = `// GENERATED FILE - do not edit by hand. Run \`node scripts/build-mine-dataset.js\` to regenerate.
// Source: data3/players_summary.json (27 tournaments, 2,750+ matches, community-collected by the project owner).
import { Player } from "../players";

export const minePlayers: Player[] = [
${players
  .map(
    (p) => `  { id: ${JSON.stringify(p.id)}, name: ${JSON.stringify(p.name)}, team: ${JSON.stringify(p.team)}, role: ${JSON.stringify(p.role)}, stats: ${tsStats(p.stats)}, members: ${tsMembers(p.members)} }`
  )
  .join(",\n")}
];
`;

// ---- Emit data/mine/titles.ts ----

const titlesTs = `// GENERATED FILE - do not edit by hand. Run \`node scripts/build-mine-dataset.js\` to regenerate.
// Per-player Prefix probabilities from data3's shrinkage-adjusted title distribution
// (general.title_distribution_shrunk), normalized to a probability distribution over the 8
// Prefix keys per player (sums to ~100).
import { PrefixKey } from "../titles";

export type MinePlayerPrefixStats = { name: string; values: Partial<Record<PrefixKey, number>> };

export const minePrefixStatsByPlayerId: Record<string, MinePlayerPrefixStats[]> = {
${Object.entries(prefixStatsByPlayerId)
  .map(([id, entries]) => `  ${JSON.stringify(id)}: [${entries.map((e) => `{ name: ${JSON.stringify(e.name)}, values: ${tsTitleProbability(e.values)} }`).join(", ")}]`)
  .join(",\n")}
};
`;

// ---- Emit data/mine/teamSuffixRates.ts ----

const teamSuffixRates = {};
for (const entry of Object.values(teamsSummary)) {
  const rates = entry.rates || {};
  const out = {};
  for (const [rawField, suffixKey] of Object.entries(TEAM_SUFFIX_FIELD_MAP)) {
    if (rates[rawField] !== undefined) out[suffixKey] = rates[rawField];
  }
  teamSuffixRates[entry.name] = out;
}

const teamNamesInRoster = new Set(ROSTER.map(([team]) => team));
for (const team of teamNamesInRoster) {
  if (!teamSuffixRates[team]) throw new Error(`No teams_summary.json entry for roster team "${team}"`);
}

const teamMatches = {};
for (const entry of Object.values(teamsSummary)) {
  teamMatches[entry.name] = (entry.totals && entry.totals.total_matches_parsed) || 0;
}

const teamSuffixRatesTs = `// GENERATED FILE - do not edit by hand. Run \`node scripts/build-mine-dataset.js\` to regenerate.
// Team-wide suffix trigger rates (% of that team's games) from data3/teams_summary.json's
// \`rates\` field. Suffixes are team-wide events (any of the team's players can trigger them),
// so these are keyed by team name rather than by individual player/pair.
import { SuffixKey } from "../titles";

export const mineTeamSuffixRates: Record<string, Partial<Record<SuffixKey, number>>> = {
${Object.entries(teamSuffixRates)
  .map(([team, rates]) => `  ${JSON.stringify(team)}: ${tsStats(rates)}`)
  .join(",\n")}
};

// Recorded match count per team, from data3/teams_summary.json's totals.total_matches_parsed.
export const mineTeamMatches: Record<string, number> = {
${Object.entries(teamMatches)
  .map(([team, count]) => `  ${JSON.stringify(team)}: ${count}`)
  .join(",\n")}
};
`;

const mineDir = path.join(ROOT, "data", "mine");
fs.mkdirSync(mineDir, { recursive: true });
fs.writeFileSync(path.join(mineDir, "players.ts"), playersTs);
fs.writeFileSync(path.join(mineDir, "titles.ts"), titlesTs);
fs.writeFileSync(path.join(mineDir, "teamSuffixRates.ts"), teamSuffixRatesTs);

console.log(`Wrote ${path.join("data", "mine", "players.ts")}, ${path.join("data", "mine", "titles.ts")} and ${path.join("data", "mine", "teamSuffixRates.ts")}.`);

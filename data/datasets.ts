import { Player, players as legacyPlayers } from "./players";
import { prefixStatsByPlayerId as legacyPrefixStats, SuffixKey } from "./titles";
import { minePlayers } from "./mine/players";
import { minePrefixStatsByPlayerId } from "./mine/titles";
import { mineTeamSuffixRates, mineTeamMatches } from "./mine/teamSuffixRates";

export type DatasetKey = "mine" | "legacy";

type Localized = { en: string; ru: string };
type PrefixStatsByPlayerId = Record<string, { name: string; values: Partial<Record<string, number>> }[]>;

export type Dataset = {
  players: Player[];
  prefixStatsByPlayerId: PrefixStatsByPlayerId;
  label: Localized;
  sourceLabel: Localized;
  matches: string;
  // Team-wide suffix trigger rates (% of that team's games), keyed by team name. Empty for
  // datasets with no such data (legacy has none at any granularity).
  teamSuffixRates: Record<string, Partial<Record<SuffixKey, number>>>;
  // Recorded match count per team, keyed by team name. Empty for datasets with no such data.
  teamMatches: Record<string, number>;
  // Suffixes this dataset can compute a real probability for, and therefore can recommend a
  // "best" one from. The rest stay manually selectable everywhere, just not suggested.
  computableSuffixes: SuffixKey[];
};

export const datasets: Record<DatasetKey, Dataset> = {
  mine: {
    players: minePlayers,
    prefixStatsByPlayerId: minePrefixStatsByPlayerId,
    label: { en: "My Dataset", ru: "Мой датасет" },
    sourceLabel: { en: "My dataset · 27 tournaments", ru: "Мой датасет · 27 турниров" },
    matches: "2,796",
    teamSuffixRates: mineTeamSuffixRates,
    teamMatches: mineTeamMatches,
    // data3's teams_summary.json tracks team-wide rates for these 5; Underdog (win/loss), Clutch
    // (series position) and Cruel (fountain kill) have no basis in either dataset.
    computableSuffixes: ["tormented", "flayedTwins", "patient", "decisive", "lucky"]
  },
  legacy: {
    players: legacyPlayers,
    prefixStatsByPlayerId: legacyPrefixStats,
    label: { en: "Community Dataset", ru: "Датасет сообщества" },
    sourceLabel: { en: "Professional match statistics · 13 Tier 1 tournaments", ru: "Статистика профессиональных матчей · 13 турниров Tier 1" },
    matches: "1,601",
    teamSuffixRates: {},
    teamMatches: {},
    computableSuffixes: []
  }
};

// GENERATED FILE - do not edit by hand. Run `node scripts/build-mine-dataset.js` to regenerate.
// Team-wide suffix trigger rates (% of that team's games) from data3/teams_summary.json's
// `rates` field. Suffixes are team-wide events (any of the team's players can trigger them),
// so these are keyed by team name rather than by individual player/pair.
import { SuffixKey } from "../titles";

export const mineTeamSuffixRates: Record<string, Partial<Record<SuffixKey, number>>> = {
  "Team Liquid": { tormented: 0.8, flayedTwins: 4, patient: 0.8, decisive: 2.8, lucky: 7.5 },
  "Vici Gaming": { tormented: 0.8, flayedTwins: 3.1, patient: 0.8, decisive: 4.7, lucky: 9.4 },
  "OG": { tormented: 0.7, flayedTwins: 6, patient: 0, decisive: 4, lucky: 6 },
  "Team Resilience": { tormented: 0, flayedTwins: 0, patient: 0, decisive: 10.3, lucky: 12.8 },
  "Team Spirit": { tormented: 0.9, flayedTwins: 2.6, patient: 0, decisive: 3, lucky: 8.6 },
  "BoomBoys": { tormented: 0.4, flayedTwins: 4.1, patient: 0.8, decisive: 2, lucky: 13.8 },
  "Xtreme Gaming": { tormented: 3.5, flayedTwins: 2.7, patient: 0, decisive: 4.9, lucky: 8 },
  "Team Falcons": { tormented: 2.2, flayedTwins: 2.7, patient: 0, decisive: 3.1, lucky: 7.5 },
  "Aurora Gaming": { tormented: 5.4, flayedTwins: 5, patient: 0, decisive: 3.2, lucky: 8.1 },
  "Team Vision": { tormented: 1.3, flayedTwins: 4.7, patient: 0, decisive: 3.9, lucky: 9 },
  "Team Yandex": { tormented: 1.5, flayedTwins: 7.4, patient: 0, decisive: 5, lucky: 11.9 },
  "GamerLegion": { tormented: 0.7, flayedTwins: 5.3, patient: 0, decisive: 4, lucky: 11.9 },
  "Nigma Galaxy": { tormented: 2, flayedTwins: 12.4, patient: 0.7, decisive: 2.6, lucky: 10.5 },
  "HULIGANI": { tormented: 0, flayedTwins: 0, patient: 0.9, decisive: 2.7, lucky: 10.6 },
  "Iron Wing": { tormented: 1.6, flayedTwins: 8.2, patient: 0, decisive: 1.9, lucky: 13.2 },
  "LGD Gaming": { tormented: 1.3, flayedTwins: 0.9, patient: 0.4, decisive: 2.7, lucky: 9.8 }
};

// Recorded match count per team, from data3/teams_summary.json's totals.total_matches_parsed.
export const mineTeamMatches: Record<string, number> = {
  "Team Liquid": 252,
  "Vici Gaming": 127,
  "OG": 149,
  "Team Resilience": 39,
  "Team Spirit": 232,
  "BoomBoys": 246,
  "Xtreme Gaming": 226,
  "Team Falcons": 226,
  "Aurora Gaming": 222,
  "Team Vision": 233,
  "Team Yandex": 202,
  "GamerLegion": 151,
  "Nigma Galaxy": 153,
  "HULIGANI": 113,
  "Iron Wing": 257,
  "LGD Gaming": 225
};

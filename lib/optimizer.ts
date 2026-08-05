import { Player, Role, StatKey } from "../data/players";
import { Tier, Trait, tierBonuses } from "../data/rules";

export type EmblemInput = {
  stat: StatKey;
  tier: Tier;
  trait: Trait;
  // When set, completely overrides the Tier+Trait derived factor with customPercent/100 - a
  // direct "% of base value" input (100 = unmodified, 250 = same as Tier V with no trait) for
  // users who just want to type a total percentage rather than pick Tier + Trait.
  customPercent?: number;
};

export type ScoreContribution = {
  stat: StatKey;
  tier: Tier;
  trait: Trait;
  baseValue: number;
  tierBonus: number;
  traitDelta: number;
  factor: number;
  weightedValue: number;
};

function isAdjacent(a: number, b: number): boolean {
  return Math.abs(a - b) === 1;
}

function normalizeTier(tier: Tier): Tier {
  const key = String(tier).trim().split(/\s+/)[0] as Tier;
  return Object.prototype.hasOwnProperty.call(tierBonuses, key) ? key : "I";
}

// Trait bonuses/penalties are percentage points added directly onto the tier bonus (base 100% +
// tierBonus% + traitDelta%), not a further multiplication of the tier-adjusted total - e.g. Tier
// IV (+100%) next to a Vampiric emblem lands on 100+100-10 = 190%, not 200%*0.9 = 180%.
export function getTraitDeltas(emblems: EmblemInput[]): number[] {
  const deltas = emblems.map(() => 0);
  const allTiersDifferent = new Set(emblems.map((item) => normalizeTier(item.tier))).size === emblems.length;
  const uniqueCount = emblems.filter((item) => item.trait === "unique").length;
  const friendlyCount = emblems.filter((item) => item.trait === "friendly").length;

  emblems.forEach((emblem, index) => {
    if (emblem.trait === "fractal" && allTiersDifferent) deltas[index] += 60;
    if (emblem.trait === "unique" && uniqueCount === 1) deltas[index] += 30;
    if (emblem.trait === "friendly" && friendlyCount >= 3) deltas[index] += 50;

    if (emblem.trait === "benevolent") {
      emblems.forEach((_, targetIndex) => {
        if (isAdjacent(index, targetIndex)) deltas[targetIndex] += 20;
      });
    }

    if (emblem.trait === "vampiric") {
      deltas[index] += 50;
      emblems.forEach((_, targetIndex) => {
        if (isAdjacent(index, targetIndex)) deltas[targetIndex] -= 10;
      });
    }
  });

  return deltas;
}

export function getScoreContributions(player: Player, emblems: EmblemInput[]): ScoreContribution[] {
  const traitDeltas = getTraitDeltas(emblems);

  return emblems.map((emblem, index) => {
    const normalizedTier = normalizeTier(emblem.tier);
    const rawBaseValue = player.stats[emblem.stat];
    const baseValue = Number.isFinite(rawBaseValue) ? Number(rawBaseValue) : 0;
    const tierBonus = tierBonuses[normalizedTier];
    const traitDelta = Number.isFinite(traitDeltas[index]) ? traitDeltas[index] : 0;
    const hasCustomPercent = Number.isFinite(emblem.customPercent);
    const factor = hasCustomPercent ? (emblem.customPercent as number) / 100 : 1 + (tierBonus + traitDelta) / 100;
    const weightedValue = baseValue * factor;

    return {
      stat: emblem.stat,
      tier: normalizedTier,
      trait: emblem.trait,
      baseValue,
      tierBonus,
      traitDelta,
      factor,
      weightedValue: Number.isFinite(weightedValue) ? weightedValue : 0
    };
  });
}

export function calculatePlayerScore(player: Player, emblems: EmblemInput[]): number {
  return getScoreContributions(player, emblems).reduce((sum, item) => sum + item.weightedValue, 0);
}

export function rankPlayers(players: Player[], role: Role, emblems: EmblemInput[]) {
  return players
    .filter((player) => player.role === role)
    .map((player) => ({
      player,
      score: calculatePlayerScore(player, emblems),
      contributions: getScoreContributions(player, emblems)
    }))
    .sort((a, b) => b.score - a.score);
}

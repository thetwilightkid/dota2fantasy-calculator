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
  traitFactor: number;
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

export function getTraitFactors(emblems: EmblemInput[]): number[] {
  const factors = emblems.map(() => 1);
  const allTiersDifferent = new Set(emblems.map((item) => normalizeTier(item.tier))).size === emblems.length;
  const uniqueCount = emblems.filter((item) => item.trait === "unique").length;
  const friendlyCount = emblems.filter((item) => item.trait === "friendly").length;

  emblems.forEach((emblem, index) => {
    if (emblem.trait === "fractal" && allTiersDifferent) factors[index] *= 1.6;
    if (emblem.trait === "unique" && uniqueCount === 1) factors[index] *= 1.3;
    if (emblem.trait === "friendly" && friendlyCount >= 3) factors[index] *= 1.5;

    if (emblem.trait === "benevolent") {
      emblems.forEach((_, targetIndex) => {
        if (isAdjacent(index, targetIndex)) factors[targetIndex] *= 1.2;
      });
    }

    if (emblem.trait === "vampiric") {
      factors[index] *= 1.5;
      emblems.forEach((_, targetIndex) => {
        if (isAdjacent(index, targetIndex)) factors[targetIndex] *= 0.9;
      });
    }
  });

  return factors;
}

export function getScoreContributions(player: Player, emblems: EmblemInput[]): ScoreContribution[] {
  const traitFactors = getTraitFactors(emblems);

  return emblems.map((emblem, index) => {
    const normalizedTier = normalizeTier(emblem.tier);
    const rawBaseValue = player.stats[emblem.stat];
    const baseValue = Number.isFinite(rawBaseValue) ? Number(rawBaseValue) : 0;
    const tierBonus = tierBonuses[normalizedTier];
    const tierFactor = 1 + tierBonus / 100;
    const traitFactor = Number.isFinite(traitFactors[index]) ? traitFactors[index] : 1;
    const hasCustomPercent = Number.isFinite(emblem.customPercent);
    const factor = hasCustomPercent ? (emblem.customPercent as number) / 100 : tierFactor * traitFactor;
    const weightedValue = baseValue * factor;

    return {
      stat: emblem.stat,
      tier: normalizedTier,
      trait: emblem.trait,
      baseValue,
      tierBonus,
      traitFactor,
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

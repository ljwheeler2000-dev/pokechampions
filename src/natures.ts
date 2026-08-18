import type { NatureName, StatKey } from './types.js';

type Boosted = Exclude<StatKey, 'hp'>;

/** [boosted stat, hindered stat]. Neutral natures map to null. */
const NATURES: Record<NatureName, [Boosted, Boosted] | null> = {
  Hardy: null, Docile: null, Serious: null, Bashful: null, Quirky: null,
  Lonely: ['atk', 'def'],
  Brave: ['atk', 'spe'],
  Adamant: ['atk', 'spa'],
  Naughty: ['atk', 'spd'],
  Bold: ['def', 'atk'],
  Relaxed: ['def', 'spe'],
  Impish: ['def', 'spa'],
  Lax: ['def', 'spd'],
  Timid: ['spe', 'atk'],
  Hasty: ['spe', 'def'],
  Jolly: ['spe', 'spa'],
  Naive: ['spe', 'spd'],
  Modest: ['spa', 'atk'],
  Mild: ['spa', 'def'],
  Quiet: ['spa', 'spe'],
  Rash: ['spa', 'spd'],
  Calm: ['spd', 'atk'],
  Gentle: ['spd', 'def'],
  Sassy: ['spd', 'spe'],
  Careful: ['spd', 'spa'],
};

export const NATURE_NAMES = Object.keys(NATURES) as NatureName[];

/**
 * Nature multiplier for a given stat: 1.1 boosted, 0.9 hindered, 1.0 otherwise.
 * HP is never affected by nature.
 */
export function natureMultiplier(nature: NatureName | undefined, stat: StatKey): number {
  if (!nature || stat === 'hp') return 1;
  const entry = NATURES[nature];
  if (!entry) return 1;
  const [up, down] = entry;
  if (stat === up) return 1.1;
  if (stat === down) return 0.9;
  return 1;
}

/** The stat a nature boosts, or null for neutral natures. */
export function boostedStat(nature: NatureName): Boosted | null {
  return NATURES[nature]?.[0] ?? null;
}

/** The stat a nature hinders, or null for neutral natures. */
export function hinderedStat(nature: NatureName): Boosted | null {
  return NATURES[nature]?.[1] ?? null;
}

/** Natures that boost `up` and hinder `down`. Neutral natures match when up === down. */
export function findNature(up: Boosted, down: Boosted): NatureName | null {
  if (up === down) return 'Hardy';
  return NATURE_NAMES.find((n) => boostedStat(n) === up && hinderedStat(n) === down) ?? null;
}

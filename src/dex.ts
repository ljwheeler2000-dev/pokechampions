import type { Species, StatBlock } from './types.js';

/**
 * Seed species data for Champions.
 *
 * Champions has original Mega Evolutions whose stats and abilities do NOT match
 * mainline, so entries here are only added when confirmed against the live
 * Champions calc (calc.pokemonshowdown.com/champions.html). Anything not fully
 * confirmed is marked so it can be double-checked before it drives a spread.
 *
 * This is deliberately small. The engine takes species data as input, so you can
 * pass your own `Species` objects without extending this file.
 */
export interface DexEntry extends Species {
  /**
   * Stats read directly off the live Champions calc. Any stat not listed here
   * is carried over from mainline data and should be verified before relying on it.
   */
  confirmedStats?: Array<keyof StatBlock>;
  notes?: string;
}

export const DEX: Record<string, DexEntry> = {
  'Staraptor-Mega': {
    name: 'Staraptor-Mega',
    types: ['Fighting', 'Flying'],
    baseStats: { hp: 85, atk: 140, def: 100, spa: 60, spd: 90, spe: 110 },
    ability: 'Contrary',
    confirmedStats: ['hp', 'atk', 'def', 'spa', 'spd', 'spe'],
    notes:
      'Champions-original Mega. Fighting/Flying with Contrary -- neither the typing nor the ability matches mainline Staraptor.',
  },
  'Rotom-Wash': {
    name: 'Rotom-Wash',
    types: ['Electric', 'Water'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
    ability: 'Levitate',
    confirmedStats: ['hp', 'atk', 'spa', 'spe'],
    notes: 'Def and SpDef carried over from mainline -- confirm against the Champions calc before use.',
  },
};

/** Look up a species by name. Case-insensitive; returns undefined if unknown. */
export function getSpecies(name: string): DexEntry | undefined {
  const direct = DEX[name];
  if (direct) return direct;
  const key = Object.keys(DEX).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? DEX[key] : undefined;
}

/** Build a Species inline without touching the dex. */
export function defineSpecies(
  name: string,
  types: Species['types'],
  baseStats: StatBlock,
  ability?: string,
): Species {
  return ability ? { name, types, baseStats, ability } : { name, types, baseStats };
}

/** Stats on an entry that have NOT been confirmed against the live Champions calc. */
export function unconfirmedStats(entry: DexEntry): Array<keyof StatBlock> {
  const confirmed = new Set(entry.confirmedStats ?? []);
  return (['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as Array<keyof StatBlock>).filter(
    (s) => !confirmed.has(s),
  );
}

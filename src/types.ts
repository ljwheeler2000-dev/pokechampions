/** Core domain types for the Pokémon Champions damage engine. */

export const TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const;

export type PokemonType = (typeof TYPES)[number];

export const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
export type StatKey = (typeof STATS)[number];

/** A full six-stat block. Used for base stats, SP allocations, and computed stats. */
export type StatBlock = Record<StatKey, number>;

/** Stat stage boosts, -6 through +6. Omitted stats are treated as 0. */
export type BoostBlock = Partial<Record<Exclude<StatKey, 'hp'>, number>>;

export type MoveCategory = 'Physical' | 'Special' | 'Status';

export type Weather = 'Sun' | 'Rain' | 'Sand' | 'Snow' | 'None';
export type Terrain = 'Electric' | 'Grassy' | 'Misty' | 'Psychic' | 'None';

export type Status = 'Healthy' | 'Burn' | 'Poison' | 'Toxic' | 'Paralysis' | 'Sleep' | 'Freeze';

/** A Champions species entry. Base stats are Champions values, which can differ from mainline. */
export interface Species {
  name: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  baseStats: StatBlock;
  /** Default/canonical ability. Individual sets may override. */
  ability?: string;
  /** Weight in kg — reserved for weight-based moves. */
  weightKg?: number;
}

export interface Move {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  basePower: number;
  /** True for moves that hit more than one target in Doubles (Discharge, Earthquake, ...). */
  spread?: boolean;
  /** Number of hits for multi-hit moves. Defaults to 1. */
  hits?: number;
  /** Force the crit branch regardless of the calc option. */
  alwaysCrit?: boolean;
  /** Ignore the defender's stat-stage boosts (e.g. Chip Away style effects). */
  ignoresDefensiveBoosts?: boolean;
}

/** A built Pokémon: species plus its Champions SP spread, nature, item and battle state. */
export interface PokemonSet {
  species: Species;
  /** Champions is a level-50 format; exposed for completeness. */
  level?: number;
  nature?: NatureName;
  ability?: string;
  item?: string;
  status?: Status;
  /** SP allocation. Missing stats default to 0. Budget: 66 total, 32 max per stat. */
  sp?: Partial<StatBlock>;
  boosts?: BoostBlock;
  /** Current HP as a fraction of max, 0–1. Defaults to 1. Drives Multiscale. */
  hpPercent?: number;
}

export interface Field {
  /** Champions calcs for this project default to Doubles. */
  gameType?: 'Singles' | 'Doubles';
  weather?: Weather;
  terrain?: Terrain;
  /** Reflect up on the defender's side (physical). */
  reflect?: boolean;
  /** Light Screen up on the defender's side (special). */
  lightScreen?: boolean;
  /** Aurora Veil covers both. */
  auroraVeil?: boolean;
  /** An ally with Friend Guard is adjacent to the defender. */
  friendGuard?: boolean;
  /** Tailwind on the attacker's side — affects speed order, not damage. */
  attackerTailwind?: boolean;
  defenderTailwind?: boolean;
  trickRoom?: boolean;
}

export interface CalcOptions {
  /** Force a critical hit. */
  crit?: boolean;
  /**
   * Override spread-move detection. When omitted, the x0.75 spread penalty applies
   * if the move is flagged `spread` and the field game type is Doubles.
   */
  spread?: boolean;
}

export type NatureName =
  | 'Hardy' | 'Lonely' | 'Brave' | 'Adamant' | 'Naughty'
  | 'Bold' | 'Docile' | 'Relaxed' | 'Impish' | 'Lax'
  | 'Timid' | 'Hasty' | 'Serious' | 'Jolly' | 'Naive'
  | 'Modest' | 'Mild' | 'Quiet' | 'Bashful' | 'Rash'
  | 'Calm' | 'Gentle' | 'Sassy' | 'Careful' | 'Quirky';

import { TYPES, type PokemonType } from './types.js';

/**
 * Type effectiveness chart. Rows are the attacking type, columns the defending type.
 * Only non-1x entries are listed; anything absent is neutral.
 */
const CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

/** Effectiveness of one attacking type against one defending type. */
export function typeEffectivenessSingle(attacking: PokemonType, defending: PokemonType): number {
  return CHART[attacking][defending] ?? 1;
}

/** Combined effectiveness against a mono- or dual-typed defender (0, 0.25, 0.5, 1, 2, or 4). */
export function typeEffectiveness(
  attacking: PokemonType,
  defending: readonly PokemonType[],
): number {
  return defending.reduce((mult, t) => mult * typeEffectivenessSingle(attacking, t), 1);
}

/**
 * Defensive profile for a typing: every attacking type mapped to its multiplier.
 * Useful for team-level weakness/resistance coverage checks.
 */
export function defensiveProfile(
  defending: readonly PokemonType[],
): Record<PokemonType, number> {
  const out = {} as Record<PokemonType, number>;
  for (const t of TYPES) out[t] = typeEffectiveness(t, defending);
  return out;
}

/** Attacking types that hit this typing for more than neutral damage. */
export function weaknesses(defending: readonly PokemonType[]): PokemonType[] {
  return TYPES.filter((t) => typeEffectiveness(t, defending) > 1);
}

/** Attacking types this typing resists or is immune to. */
export function resistances(defending: readonly PokemonType[]): PokemonType[] {
  return TYPES.filter((t) => typeEffectiveness(t, defending) < 1);
}

/** Attacking types this typing takes no damage from. */
export function immunities(defending: readonly PokemonType[]): PokemonType[] {
  return TYPES.filter((t) => typeEffectiveness(t, defending) === 0);
}

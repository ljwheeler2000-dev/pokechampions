/**
 * Team-level type coverage.
 *
 * Two questions matter when filling out a core: what does the whole team fold to
 * (shared weaknesses), and what can nothing on the team hit hard (offensive gaps).
 */
import { Pokemon } from '@smogon/calc';
import { GEN } from './adapter.js';

export const TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const;
export type PokeType = (typeof TYPES)[number];

const CHART: Record<PokeType, Partial<Record<PokeType, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

export const effectiveness = (atk: PokeType, def: PokeType): number => CHART[atk][def] ?? 1;

export function effectivenessAgainst(atk: PokeType, defTypes: readonly string[]): number {
  return defTypes.reduce((m, t) => m * effectiveness(atk, t as PokeType), 1);
}

export function typesOf(species: string): PokeType[] {
  return [...new Pokemon(GEN, species, { level: 50 }).types] as PokeType[];
}

export interface TeamCoverage {
  /** Per attacking type: how each team member takes it. */
  matrix: Array<{ type: PokeType; perMember: number[]; weakCount: number; resistCount: number; immuneCount: number }>;
  /** Types that hit 2 or more members super effectively - the real liabilities. */
  sharedWeaknesses: Array<{ type: PokeType; members: string[] }>;
  /** Types nothing on the team resists. */
  unresisted: PokeType[];
  members: string[];
}

/** Defensive profile of a whole team. */
export function teamCoverage(species: readonly string[]): TeamCoverage {
  const members = species.filter(Boolean);
  const memberTypes = members.map(typesOf);
  const matrix = TYPES.map((type) => {
    const perMember = memberTypes.map((t) => effectivenessAgainst(type, t));
    return {
      type,
      perMember,
      weakCount: perMember.filter((v) => v > 1).length,
      resistCount: perMember.filter((v) => v < 1 && v > 0).length,
      immuneCount: perMember.filter((v) => v === 0).length,
    };
  });
  return {
    members,
    matrix,
    sharedWeaknesses: matrix
      .filter((r) => r.weakCount >= 2)
      .map((r) => ({ type: r.type, members: members.filter((_, i) => r.perMember[i]! > 1) }))
      .sort((a, b) => b.members.length - a.members.length),
    unresisted: matrix.filter((r) => r.resistCount + r.immuneCount === 0).map((r) => r.type),
  };
}

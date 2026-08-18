import { describe, expect, it } from 'vitest';
import { ROLLS, calculateDamage } from '../src/damage.js';
import { chainMods, mod, pokeRound } from '../src/modifiers.js';
import { DEX, defineSpecies } from '../src/dex.js';
import type { Move, PokemonSet } from '../src/types.js';

const discharge: Move = {
  name: 'Discharge', type: 'Electric', category: 'Special', basePower: 80, spread: true,
};
const closeCombat: Move = {
  name: 'Close Combat', type: 'Fighting', category: 'Physical', basePower: 120,
};
const bravebird: Move = {
  name: 'Brave Bird', type: 'Flying', category: 'Physical', basePower: 120,
};

const rotom: PokemonSet = {
  species: DEX['Rotom-Wash']!,
  nature: 'Timid',
  ability: 'Levitate',
  sp: { hp: 24, spa: 32, spe: 10 },
};

const staraptor: PokemonSet = {
  species: DEX['Staraptor-Mega']!,
  nature: 'Hardy',
  ability: 'Contrary',
  sp: { atk: 32, hp: 32, spd: 2 },
};

describe('pokeRound (round half down)', () => {
  it('rounds .5 down and >.5 up', () => {
    expect(pokeRound(2.5)).toBe(2);
    expect(pokeRound(2.51)).toBe(3);
    expect(pokeRound(3.5)).toBe(3);
    expect(pokeRound(3.49)).toBe(3);
    expect(pokeRound(4)).toBe(4);
  });
});

describe('modifier chaining', () => {
  it('converts decimals to 4096ths', () => {
    expect(mod(1)).toBe(4096);
    expect(mod(1.5)).toBe(6144);
    expect(mod(0.75)).toBe(3072);
  });

  it('chains to neutral when given nothing', () => {
    expect(chainMods([])).toBe(4096);
  });

  it('chains two modifiers', () => {
    // 0.5 * 0.75 = 0.375 -> 1536
    expect(chainMods([2048, 3072])).toBe(1536);
  });
});

describe('calculateDamage', () => {
  it('returns exactly 16 rolls, ascending', () => {
    const r = calculateDamage(rotom, staraptor, discharge);
    expect(r.damage).toHaveLength(ROLLS.length);
    for (let i = 1; i < r.damage.length; i++) {
      expect(r.damage[i]!).toBeGreaterThanOrEqual(r.damage[i - 1]!);
    }
    expect(r.minDamage).toBe(r.damage[0]);
    expect(r.maxDamage).toBe(r.damage[15]);
  });

  it('reports the defender max HP it used', () => {
    const r = calculateDamage(rotom, staraptor, discharge);
    // Staraptor-Mega: 85 base HP + 75 + 32 SP
    expect(r.defenderHP).toBe(192);
  });

  it('applies type effectiveness -- Electric hits Fighting/Flying for 2x', () => {
    const r = calculateDamage(rotom, staraptor, discharge);
    expect(r.typeEffectiveness).toBe(2);
  });

  it('deals zero through an immunity and says so', () => {
    const ground = defineSpecies('TestGround', ['Ground'], {
      hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100,
    });
    const r = calculateDamage(rotom, { species: ground }, discharge);
    expect(r.maxDamage).toBe(0);
    expect(r.typeEffectiveness).toBe(0);
    expect(r.description).toContain('immune');
    expect(r.hitsToKO).toBeNull();
  });

  it('applies the 0.75x spread penalty in Doubles but not Singles', () => {
    const dbl = calculateDamage(rotom, staraptor, discharge, { gameType: 'Doubles' });
    const sgl = calculateDamage(rotom, staraptor, discharge, { gameType: 'Singles' });
    expect(dbl.maxDamage).toBeLessThan(sgl.maxDamage);
  });

  it('does not apply the spread penalty to single-target moves', () => {
    const single: Move = { ...discharge, name: 'Thunderbolt', spread: false, basePower: 80 };
    const a = calculateDamage(rotom, staraptor, single, { gameType: 'Doubles' });
    const b = calculateDamage(rotom, staraptor, single, { gameType: 'Singles' });
    expect(a.maxDamage).toBe(b.maxDamage);
  });

  it('applies STAB', () => {
    const nonStab: Move = { ...discharge, type: 'Ice', spread: false };
    const stab: Move = { ...discharge, type: 'Electric', spread: false };
    const withStab = calculateDamage(rotom, staraptor, stab);
    const withoutStab = calculateDamage(rotom, staraptor, nonStab);
    // Both are 2x on Fighting/Flying, so the gap is STAB alone.
    expect(withoutStab.typeEffectiveness).toBe(2);
    expect(withStab.maxDamage).toBeGreaterThan(withoutStab.maxDamage);
  });

  it('crits increase damage and ignore screens', () => {
    const normal = calculateDamage(rotom, staraptor, discharge);
    const crit = calculateDamage(rotom, staraptor, discharge, {}, { crit: true });
    expect(crit.maxDamage).toBeGreaterThan(normal.maxDamage);

    const screened = calculateDamage(rotom, staraptor, discharge, { lightScreen: true });
    const screenedCrit = calculateDamage(
      rotom, staraptor, discharge, { lightScreen: true }, { crit: true },
    );
    expect(screened.maxDamage).toBeLessThan(normal.maxDamage);
    expect(screenedCrit.maxDamage).toBe(crit.maxDamage);
  });

  it('Light Screen only affects special moves, Reflect only physical', () => {
    const spScreen = calculateDamage(rotom, staraptor, discharge, { lightScreen: true });
    const spReflect = calculateDamage(rotom, staraptor, discharge, { reflect: true });
    const base = calculateDamage(rotom, staraptor, discharge);
    expect(spScreen.maxDamage).toBeLessThan(base.maxDamage);
    expect(spReflect.maxDamage).toBe(base.maxDamage);

    const phBase = calculateDamage(staraptor, rotom, closeCombat);
    const phReflect = calculateDamage(staraptor, rotom, closeCombat, { reflect: true });
    expect(phReflect.maxDamage).toBeLessThan(phBase.maxDamage);
  });

  it('Aurora Veil covers both categories', () => {
    const veil = calculateDamage(rotom, staraptor, discharge, { auroraVeil: true });
    const base = calculateDamage(rotom, staraptor, discharge);
    expect(veil.maxDamage).toBeLessThan(base.maxDamage);
  });

  it('burn halves physical damage only', () => {
    const burned: PokemonSet = { ...staraptor, status: 'Burn' };
    const phys = calculateDamage(staraptor, rotom, closeCombat);
    const physBurned = calculateDamage(burned, rotom, closeCombat);
    expect(physBurned.maxDamage).toBeLessThan(phys.maxDamage);

    const burnedRotom: PokemonSet = { ...rotom, status: 'Burn' };
    const spec = calculateDamage(rotom, staraptor, discharge);
    const specBurned = calculateDamage(burnedRotom, staraptor, discharge);
    expect(specBurned.maxDamage).toBe(spec.maxDamage);
  });

  it('Guts ignores the burn drop', () => {
    const burnedGuts: PokemonSet = { ...staraptor, status: 'Burn', ability: 'Guts' };
    const clean: PokemonSet = { ...staraptor, ability: 'Guts' };
    expect(calculateDamage(burnedGuts, rotom, closeCombat).maxDamage).toBe(
      calculateDamage(clean, rotom, closeCombat).maxDamage,
    );
  });

  it('Life Orb raises damage; Assault Vest and Eviolite lower it', () => {
    const base = calculateDamage(rotom, staraptor, discharge);
    const orb = calculateDamage({ ...rotom, item: 'Life Orb' }, staraptor, discharge);
    expect(orb.maxDamage).toBeGreaterThan(base.maxDamage);

    const vest = calculateDamage(rotom, { ...staraptor, item: 'Assault Vest' }, discharge);
    expect(vest.maxDamage).toBeLessThan(base.maxDamage);

    const evio = calculateDamage(rotom, { ...staraptor, item: 'Eviolite' }, discharge);
    expect(evio.maxDamage).toBeLessThan(base.maxDamage);
  });

  it('Choice Specs boosts special, Choice Band boosts physical', () => {
    const base = calculateDamage(rotom, staraptor, discharge);
    const specs = calculateDamage({ ...rotom, item: 'Choice Specs' }, staraptor, discharge);
    expect(specs.maxDamage).toBeGreaterThan(base.maxDamage);

    const physBase = calculateDamage(staraptor, rotom, closeCombat);
    const band = calculateDamage({ ...staraptor, item: 'Choice Band' }, rotom, closeCombat);
    expect(band.maxDamage).toBeGreaterThan(physBase.maxDamage);
  });

  it('Multiscale only applies at full HP', () => {
    const full = calculateDamage(
      rotom, { ...staraptor, ability: 'Multiscale', hpPercent: 1 }, discharge,
    );
    const chipped = calculateDamage(
      rotom, { ...staraptor, ability: 'Multiscale', hpPercent: 0.99 }, discharge,
    );
    expect(full.maxDamage).toBeLessThan(chipped.maxDamage);
  });

  it('Friend Guard, Filter and Resist Berry reduce damage', () => {
    const base = calculateDamage(rotom, staraptor, discharge);
    expect(
      calculateDamage(rotom, staraptor, discharge, { friendGuard: true }).maxDamage,
    ).toBeLessThan(base.maxDamage);
    expect(
      calculateDamage(rotom, { ...staraptor, ability: 'Solid Rock' }, discharge).maxDamage,
    ).toBeLessThan(base.maxDamage);
    expect(
      calculateDamage(rotom, { ...staraptor, item: 'Resist Berry' }, discharge).maxDamage,
    ).toBeLessThan(base.maxDamage);
  });

  it('weather boosts and reduces the matching move types', () => {
    const fire: Move = { name: 'Flamethrower', type: 'Fire', category: 'Special', basePower: 90 };
    const neutral = calculateDamage(rotom, staraptor, fire, { weather: 'None' });
    const sun = calculateDamage(rotom, staraptor, fire, { weather: 'Sun' });
    const rain = calculateDamage(rotom, staraptor, fire, { weather: 'Rain' });
    expect(sun.maxDamage).toBeGreaterThan(neutral.maxDamage);
    expect(rain.maxDamage).toBeLessThan(neutral.maxDamage);
  });

  it('stat boosts on either side move damage the right way', () => {
    const base = calculateDamage(staraptor, rotom, bravebird);
    const boostedAtk = calculateDamage({ ...staraptor, boosts: { atk: 2 } }, rotom, bravebird);
    const boostedDef = calculateDamage(staraptor, { ...rotom, boosts: { def: 2 } }, bravebird);
    expect(boostedAtk.maxDamage).toBeGreaterThan(base.maxDamage);
    expect(boostedDef.maxDamage).toBeLessThan(base.maxDamage);
  });

  it('a crit ignores the defender positive boosts', () => {
    const boostedDef = calculateDamage(staraptor, { ...rotom, boosts: { def: 2 } }, bravebird, {}, { crit: true });
    const noBoost = calculateDamage(staraptor, rotom, bravebird, {}, { crit: true });
    expect(boostedDef.maxDamage).toBe(noBoost.maxDamage);
  });

  it('multi-hit moves multiply the per-hit damage', () => {
    const one: Move = { ...closeCombat, name: 'Single', hits: 1 };
    const three: Move = { ...closeCombat, name: 'Triple', hits: 3 };
    const a = calculateDamage(staraptor, rotom, one);
    const b = calculateDamage(staraptor, rotom, three);
    expect(b.maxDamage).toBe(a.maxDamage * 3);
  });

  it('status moves deal no damage', () => {
    const willo: Move = { name: 'Will-O-Wisp', type: 'Fire', category: 'Status', basePower: 0 };
    expect(calculateDamage(rotom, staraptor, willo).maxDamage).toBe(0);
  });

  it('describes KO odds sensibly', () => {
    const r = calculateDamage(rotom, staraptor, discharge);
    expect(r.description).toMatch(/%/);
    expect(r.ohkoChance).toBeGreaterThanOrEqual(0);
    expect(r.ohkoChance).toBeLessThanOrEqual(1);
    if (r.ohkoChance === 1) expect(r.description).toContain('guaranteed OHKO');
  });

  it('flags a guaranteed OHKO when the minimum roll exceeds max HP', () => {
    const glass: PokemonSet = {
      species: defineSpecies('Glass', ['Grass'], {
        hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1,
      }),
    };
    const r = calculateDamage(rotom, glass, discharge);
    expect(r.ohkoChance).toBe(1);
    expect(r.hitsToKO).toBe(1);
    expect(r.description).toContain('guaranteed OHKO');
  });

  it('never reports less than 1 damage on a connecting hit', () => {
    const wall: PokemonSet = {
      species: defineSpecies('Wall', ['Steel'], {
        hp: 255, atk: 1, def: 255, spa: 1, spd: 255, spe: 1,
      }),
      sp: { def: 32, spd: 32 },
    };
    const weak: Move = { name: 'Poke', type: 'Bug', category: 'Special', basePower: 1 };
    const r = calculateDamage(rotom, wall, weak);
    expect(r.minDamage).toBeGreaterThanOrEqual(1);
  });
});

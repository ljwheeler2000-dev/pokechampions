import { describe, expect, it } from 'vitest';
import { simulateTurn, type TurnField } from '../src/sim/turn.js';
import { statsOf, baseStatsOf } from '../src/champions/adapter.js';
import { validateSP } from '../src/champions/sp.js';
import type { ChampionsSet } from '../src/champions/adapter.js';

const field: TurnField = { weather: '', terrain: '', trickRoom: false, sideA: {}, sideB: {} };

/** 10 Spe SP + Scarf = 190 Speed, which the team doc treats as the target. */
const rotomDocSpread: ChampionsSet = {
  species: 'Rotom-Wash', label: 'Rotom-Wash (190)', nature: 'Timid',
  sp: { hp: 24, spa: 32, spe: 10 }, ability: 'Levitate', item: 'Choice Scarf',
};
/** 32 Spe SP + Scarf = 226 Speed, the only spread that outspeeds Mega Sceptile. */
const rotom: ChampionsSet = {
  species: 'Rotom-Wash', label: 'Rotom-Wash (226)', nature: 'Timid',
  sp: { spa: 32, spe: 32, hp: 2 }, ability: 'Levitate', item: 'Choice Scarf',
};
const sceptile: ChampionsSet = {
  species: 'Sceptile-Mega', label: 'Mega Sceptile', nature: 'Timid',
  sp: { spa: 32, spe: 32, hp: 2 }, ability: 'Lightning Rod',
};
const charY: ChampionsSet = {
  species: 'Charizard-Mega-Y', label: 'Charizard-Y', nature: 'Modest',
  sp: { hp: 32, spd: 20, spa: 14 }, ability: 'Drought',
};
const gambit: ChampionsSet = {
  species: 'Kingambit', label: 'Kingambit', nature: 'Adamant',
  sp: { hp: 32, atk: 32, def: 2 }, ability: 'Defiant',
};

describe('Champions data via Smogon dex', () => {
  it('has the Champions-original Megas with the calc-verified stat line', () => {
    expect(baseStatsOf('Staraptor-Mega')).toEqual({ hp: 85, atk: 140, def: 100, spa: 60, spd: 90, spe: 110 });
  });

  it('gives Mega Sceptile base 145 Speed and Lightning Rod', () => {
    expect(baseStatsOf('Sceptile-Mega').spe).toBe(145);
  });

  it('computes Champions stats, not mainline ones', () => {
    // Rotom-Wash 50 base HP + 75 + 24 SP
    expect(statsOf(rotomDocSpread).hp).toBe(149);
    // 105 base SpA + 20 + 32 SP, Timid is neutral on SpA
    expect(statsOf(rotomDocSpread).spa).toBe(157);
    // 86 base Spe + 20 + 10 SP, x1.1 Timid
    expect(statsOf(rotomDocSpread).spe).toBe(127);
  });
});

describe('SP legality of the tested spreads', () => {
  it('every set in this suite is a legal 66/32 spread', () => {
    for (const s of [rotom, rotomDocSpread, sceptile, charY, gambit]) {
      expect(validateSP(s.sp).errors).toEqual([]);
    }
  });
});

describe('Discharge + Mega Sceptile core', () => {
  it('Lightning Rod absorbs the ally Discharge and banks +1 SpA', () => {
    const r = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }],
      field, 'max',
    );
    const ev = r.events.find((e) => e.actor === 'A1')!;
    const onSceptile = ev.targets.find((t) => t.slot === 'A2')!;
    expect(onSceptile.outcome).toBe('absorbed');
    expect(r.final.A2.boosts.spa).toBe(1);
    expect(r.final.A2.hp).toBe(r.final.A2.maxHP);
  });

  it('the same Discharge still hits both opponents', () => {
    const r = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }],
      field, 'max',
    );
    const ev = r.events.find((e) => e.actor === 'A1')!;
    expect(ev.targets.find((t) => t.slot === 'B1')!.outcome).toBe('damage');
    expect(ev.targets.find((t) => t.slot === 'B2')!.outcome).toBe('damage');
  });

  it('Charizard-Y takes super effective damage from Discharge (Flying)', () => {
    const r = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }],
      field, 'max',
    );
    const z = r.events[0]!.targets.find((t) => t.slot === 'B1')!;
    const k = r.events[0]!.targets.find((t) => t.slot === 'B2')!;
    expect(z.maxPercent!).toBeGreaterThan(k.maxPercent!);
  });

  it('Sceptile moving after Rotom attacks with the boost already applied', () => {
    const boosted = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'A2', move: 'Dragon Pulse', target: 'B1' }],
      field, 'max',
    );
    const unboosted = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A2', move: 'Dragon Pulse', target: 'B1' }],
      field, 'max',
    );
    const withBoost = boosted.events.find((e) => e.actor === 'A2')!.targets[0]!;
    const without = unboosted.events.find((e) => e.actor === 'A2')!.targets[0]!;
    expect(withBoost.maxDamage!).toBeGreaterThan(without.maxDamage!);
  });

  it('Rotom only outspeeds Mega Sceptile at max Speed SP + Scarf (226 vs 216)', () => {
    const fast = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'A2', move: 'Dragon Pulse', target: 'B1' }],
      field, 'max',
    );
    expect(fast.order[0]).toBe('A1');
  });

  it("the doc's 190 Speed Rotom moves AFTER Sceptile, so the boost lands too late", () => {
    const slowRotom = simulateTurn(
      { A1: rotomDocSpread, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'A2', move: 'Dragon Pulse', target: 'B1' }],
      field, 'max',
    );
    expect(slowRotom.order[0]).toBe('A2');
    // Sceptile still ends the turn boosted -- it just attacked before banking it.
    expect(slowRotom.final.A2.boosts.spa).toBe(1);
  });
});

describe('doubles mechanics', () => {
  it('Discharge does nothing to a Ground type (Garchomp immunity)', () => {
    const chomp: ChampionsSet = { species: 'Garchomp', nature: 'Jolly', sp: { atk: 32, spe: 32, hp: 2 }, ability: 'Rough Skin' };
    const r = simulateTurn(
      { A1: rotom, A2: sceptile, B1: chomp, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }], field, 'max',
    );
    expect(r.events[0]!.targets.find((t) => t.slot === 'B1')!.outcome).toBe('immune');
  });

  it('spread moves hit for less than the same move single-target', () => {
    const spreadRun = simulateTurn(
      { A1: rotom, A2: null, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }], field, 'max',
    );
    const singleRun = simulateTurn(
      { A1: rotom, A2: null, B1: charY, B2: null },
      [{ slot: 'A1', move: 'Discharge' }], field, 'max',
    );
    const two = spreadRun.events[0]!.targets.find((t) => t.slot === 'B1')!.maxDamage!;
    const one = singleRun.events[0]!.targets.find((t) => t.slot === 'B1')!.maxDamage!;
    expect(two).toBeLessThan(one);
  });

  it('Protect blanks incoming damage', () => {
    const r = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'B1', move: 'Protect' }, { slot: 'A1', move: 'Discharge' }],
      field, 'max',
    );
    expect(r.events.find((e) => e.actor === 'A1')!.targets.find((t) => t.slot === 'B1')!.outcome).toBe('protected');
  });

  it('Trick Room reverses the speed order', () => {
    const normal = simulateTurn(
      { A1: rotom, A2: null, B1: gambit, B2: null },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'B1', move: 'Sucker Punch', target: 'A1' }],
      { ...field, trickRoom: false }, 'max',
    );
    const tr = simulateTurn(
      { A1: rotom, A2: null, B1: gambit, B2: null },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'B1', move: 'Iron Head', target: 'A1' }],
      { ...field, trickRoom: true }, 'max',
    );
    expect(normal.order[0]).toBe('B1'); // Sucker Punch has +1 priority
    expect(tr.order[0]).toBe('B1');     // slow Kingambit goes first under Trick Room
  });

  it('Tailwind flips a speed order', () => {
    // Kingambit 70 -> 140 under Tailwind; this Rotom sits at 116, between the two.
    const slow: ChampionsSet = { species: 'Kingambit', nature: 'Adamant', sp: { atk: 32, hp: 32 }, ability: 'Defiant' };
    const fast: ChampionsSet = { species: 'Rotom-Wash', nature: 'Timid', sp: {}, ability: 'Levitate' };
    const withTW = simulateTurn(
      { A1: slow, A2: null, B1: fast, B2: null },
      [{ slot: 'A1', move: 'Iron Head', target: 'B1' }, { slot: 'B1', move: 'Hydro Pump', target: 'A1' }],
      { ...field, sideA: { tailwind: true } }, 'max',
    );
    const withoutTW = simulateTurn(
      { A1: slow, A2: null, B1: fast, B2: null },
      [{ slot: 'A1', move: 'Iron Head', target: 'B1' }, { slot: 'B1', move: 'Hydro Pump', target: 'A1' }],
      field, 'max',
    );
    expect(withoutTW.order[0]).toBe('B1');
    expect(withTW.order[0]).toBe('A1');
  });

  it('a KO stops that Pokemon from acting later in the turn', () => {
    const glass: ChampionsSet = { species: 'Rotom-Wash', label: 'Frail', nature: 'Timid', sp: {}, hpPercent: 0.05 };
    const r = simulateTurn(
      { A1: rotom, A2: null, B1: glass, B2: null },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'B1', move: 'Hydro Pump', target: 'A1' }],
      field, 'max',
    );
    const second = r.events.find((e) => e.actor === 'B1')!;
    expect(second.text).toContain('already fainted');
  });

  it('reports no warnings on a normal turn', () => {
    const r = simulateTurn(
      { A1: rotom, A2: sceptile, B1: charY, B2: gambit },
      [{ slot: 'A1', move: 'Discharge' }, { slot: 'A2', move: 'Dragon Pulse', target: 'B1' }],
      field, 'max',
    );
    expect(r.warnings).toEqual([]);
  });
});

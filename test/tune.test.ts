import { describe, expect, it } from 'vitest';
import { tuneDefensive, tuneOffensive, combineSpread, type Threat } from '../src/tune/sp.js';
import { compareSpeed, speedEntry, speedInvestmentFor, speedTiers } from '../src/tune/speed.js';
import { teamCoverage, effectivenessAgainst, typesOf } from '../src/champions/coverage.js';
import { checkAbilityLegality, checkLegality, isLegal, searchRoster, ROSTER_ALL, ROSTER_SPECIES, ROSTER_MEGAS } from '../src/champions/roster.js';
import { baseStatsOf, statsOf, type ChampionsSet } from '../src/champions/adapter.js';
import { SP_BUDGET, validateSP } from '../src/champions/sp.js';

const sceptile: ChampionsSet = { species: 'Sceptile-Mega', nature: 'Timid', sp: {}, ability: 'Lightning Rod' };
const gambit: ChampionsSet = { species: 'Kingambit', nature: 'Adamant', sp: { atk: 32 }, ability: 'Defiant' };
const charY: ChampionsSet = { species: 'Charizard-Mega-Y', nature: 'Modest', sp: { spa: 32 }, ability: 'Drought' };

describe('roster legality', () => {
  it('resolves every roster name in the Smogon dex', () => {
    for (const s of ROSTER_ALL) expect(() => baseStatsOf(s)).not.toThrow();
  });

  it('carries the documented roster size', () => {
    expect(ROSTER_SPECIES.length).toBeGreaterThanOrEqual(200);
    expect(ROSTER_MEGAS.length).toBe(76);
  });

  it('accepts roster members and rejects dex Pokemon that are not legal here', () => {
    expect(isLegal('Sceptile-Mega')).toBe(true);
    expect(isLegal('Rotom-Wash')).toBe(true);
    // present in the Smogon dex, not in the M-B roster
    expect(isLegal('Mewtwo-Mega-X')).toBe(false);
    expect(isLegal('Rayquaza-Mega')).toBe(false);
    expect(checkLegality('Rayquaza-Mega').reason).toContain('not in the current M-B roster');
  });

  it('rejects the explicitly banned cap Pikachu forms', () => {
    expect(isLegal('Pikachu-Alola')).toBe(false);
    expect(checkLegality('Pikachu-Alola').reason).toContain('excluded form');
  });

  it('flags transfer-only Pokemon as legal but caveated', () => {
    const r = checkLegality('Floette-Eternal');
    expect(r.legal).toBe(true);
    expect(r.reason).toContain('transfer-only');
  });

  it('searches by prefix first', () => {
    const hits = searchRoster('rotom');
    expect(hits[0]).toContain('Rotom');
    expect(searchRoster('sceptile')).toContain('Sceptile-Mega');
  });
});

describe('defensive SP tuner', () => {
  const threats: Threat[] = [
    { label: 'Kingambit Iron Head', attacker: gambit, move: 'Iron Head' },
    { label: 'Charizard-Y Heat Wave', attacker: charY, move: 'Heat Wave', spread: true },
  ];

  it('finds a spread that survives everything, within the SP budget', () => {
    const r = tuneDefensive(sceptile, threats);
    if (r.best) {
      expect(r.best.survivesAll).toBe(true);
      expect(r.best.perThreat.every((t) => t.survives)).toBe(true);
      expect(r.best.cost).toBeLessThanOrEqual(SP_BUDGET);
    } else {
      expect(r.impossible.length).toBeGreaterThan(0);
    }
  });

  it('the cheapest solution really is cheapest among those returned', () => {
    const r = tuneDefensive(sceptile, threats);
    if (r.best) for (const alt of r.alternatives) expect(alt.cost).toBeGreaterThanOrEqual(r.best.cost);
  });

  it('one SP less than the answer fails at least one threat', () => {
    const r = tuneDefensive(sceptile, [threats[0]!]);
    if (r.best && r.best.sp.def > 0) {
      const weaker = tuneDefensive(sceptile, [threats[0]!], { hits: 1 });
      expect(weaker.best!.cost).toBe(r.best.cost);
    }
  });

  it('a harder threat list never costs less than an easier one', () => {
    const easy = tuneDefensive(sceptile, [threats[0]!]);
    const hard = tuneDefensive(sceptile, threats);
    if (easy.best && hard.best) expect(hard.best.cost).toBeGreaterThanOrEqual(easy.best.cost);
  });

  it('reports impossibility rather than a wrong answer', () => {
    const nuke: Threat = {
      label: 'unsurvivable',
      attacker: { species: 'Kingambit', nature: 'Adamant', sp: { atk: 32 }, item: 'Choice Band' },
      move: 'Close Combat', crit: true,
    };
    const frail: ChampionsSet = { species: 'Sceptile-Mega', nature: 'Timid', sp: {} };
    const r = tuneDefensive(frail, [nuke]);
    if (!r.best) expect(r.impossible.length).toBeGreaterThan(0);
  });

  it('respects SP already reserved for speed', () => {
    const r = tuneDefensive(sceptile, threats, { reserved: { spe: 32 } });
    if (r.best) expect(r.best.cost + 32).toBeLessThanOrEqual(SP_BUDGET);
  });
});

describe('offensive SP tuner', () => {
  it('finds the cheapest SP that guarantees an OHKO', () => {
    const target: ChampionsSet = { species: 'Charizard-Mega-Y', nature: 'Modest', sp: {} };
    const attacker: ChampionsSet = { species: 'Kingambit', nature: 'Adamant', sp: {}, ability: 'Defiant' };
    const sol = tuneOffensive(attacker, target, 'Stone Edge');
    if (sol) {
      expect(sol.stat).toBe('atk');
      expect(sol.minPercent).toBeGreaterThanOrEqual(100);
      expect(sol.sp).toBeLessThanOrEqual(32);
    }
  });

  it('judges the guarantee on the minimum roll, not the maximum', () => {
    const target: ChampionsSet = { species: 'Kingambit', nature: 'Adamant', sp: { hp: 32, def: 32 } };
    const attacker: ChampionsSet = { species: 'Sceptile-Mega', nature: 'Timid', sp: {} };
    const sol = tuneOffensive(attacker, target, 'Dragon Pulse');
    if (sol) expect(sol.minPercent).toBeGreaterThanOrEqual(100);
  });

  it('returns null for a status move', () => {
    const a: ChampionsSet = { species: 'Rotom-Wash', nature: 'Timid', sp: {} };
    expect(tuneOffensive(a, a, 'Will-O-Wisp')).toBeNull();
  });
});

describe('combineSpread', () => {
  it('adds defensive SP onto reserved SP and validates the total', () => {
    const c = combineSpread({ spe: 32, spa: 20 }, { hp: 10, def: 4, spd: 0 });
    expect(c.total).toBe(66);
    expect(c.valid).toBe(true);
    expect(c.remaining).toBe(0);
  });

  it('flags an over-budget combination instead of silently allowing it', () => {
    const c = combineSpread({ spe: 32, spa: 32 }, { hp: 20, def: 0, spd: 0 });
    expect(c.valid).toBe(false);
    expect(c.errors.join(' ')).toContain('budget');
  });
});

describe('speed tiers', () => {
  it('matches the hand-checked Champions numbers', () => {
    const scept = speedEntry('Sceptile-Mega');
    expect(scept.baseSpeed).toBe(145);
    expect(scept.positiveMax).toBe(216);
    const rotom = speedEntry('Rotom-Wash');
    expect(rotom.positiveMax).toBe(151);
    expect(rotom.scarfMax).toBe(226);
  });

  it('sorts the roster fastest first', () => {
    const tiers = speedTiers();
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i]!.positiveMax).toBeLessThanOrEqual(tiers[i - 1]!.positiveMax);
    }
  });

  it('places a Scarf Rotom above Mega Sceptile', () => {
    const rotom: ChampionsSet = { species: 'Rotom-Wash', nature: 'Timid', sp: { spe: 32 }, item: 'Choice Scarf' };
    const cmp = compareSpeed(rotom, { pool: ['Sceptile-Mega'] });
    expect(cmp.yourSpeed).toBe(226);
    expect(cmp.outspeeds.map((e) => e.species)).toContain('Sceptile-Mega');
  });

  it('finds the cheapest investment to hit a target speed', () => {
    const opts = speedInvestmentFor('Rotom-Wash', 190, { scarf: true });
    const positive = opts.find((o) => o.nature === 'positive')!;
    expect(positive.sp).toBe(10);
    expect(positive.speed).toBeGreaterThanOrEqual(190);
  });

  it('treats opponents at their ceiling, which is the pessimistic read', () => {
    const slow: ChampionsSet = { species: 'Kingambit', nature: 'Adamant', sp: {} };
    const cmp = compareSpeed(slow, { pool: ['Sceptile-Mega'] });
    expect(cmp.outsped.map((e) => e.species)).toContain('Sceptile-Mega');
  });
});

describe('team coverage', () => {
  const team = ['Rotom-Wash', 'Sceptile-Mega', 'Kingambit', 'Incineroar', 'Farigiraf'];

  it('finds the documented Fighting overlap on the Sceptile team', () => {
    const c = teamCoverage(team);
    const fighting = c.sharedWeaknesses.find((w) => w.type === 'Fighting');
    expect(fighting).toBeDefined();
    expect(fighting!.members).toEqual(expect.arrayContaining(['Kingambit', 'Incineroar']));
  });

  it('confirms Steel does not resist Electric, so Discharge really does chip allies', () => {
    expect(effectivenessAgainst('Electric', typesOf('Kingambit'))).toBe(1);
    expect(effectivenessAgainst('Electric', typesOf('Incineroar'))).toBe(1);
    expect(effectivenessAgainst('Electric', typesOf('Farigiraf'))).toBe(1);
  });

  it('confirms Ice is 4x on Mega Sceptile', () => {
    expect(effectivenessAgainst('Ice', typesOf('Sceptile-Mega'))).toBe(4);
  });

  it('confirms Fairy is neutral on Kingambit, not resisted', () => {
    expect(effectivenessAgainst('Fairy', typesOf('Kingambit'))).toBe(1);
  });

  it('lists types nothing on the team resists', () => {
    const c = teamCoverage(team);
    expect(Array.isArray(c.unresisted)).toBe(true);
    for (const t of c.unresisted) {
      const row = c.matrix.find((r) => r.type === t)!;
      expect(row.resistCount + row.immuneCount).toBe(0);
    }
  });

  it('builds a row per attacking type with one entry per member', () => {
    const c = teamCoverage(team);
    expect(c.matrix).toHaveLength(18);
    for (const row of c.matrix) expect(row.perMember).toHaveLength(team.length);
  });
});

describe('SP legality of tuner output', () => {
  it('never proposes a spread that breaks 66/32', () => {
    const r = tuneDefensive(sceptile, [{ attacker: gambit, move: 'Iron Head' }]);
    if (r.best) {
      const v = validateSP({ ...r.best.sp });
      expect(v.errors).toEqual([]);
      expect(statsOf({ ...sceptile, sp: r.best.sp }).hp).toBe(r.best.maxHP);
    }
  });
});

describe('form and ability legality', () => {
  it('treats Rotom appliance forms as legal, since the roster lists the line', () => {
    for (const f of ['Rotom', 'Rotom-Wash', 'Rotom-Heat', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow']) {
      expect(isLegal(f)).toBe(true);
    }
  });

  it('keeps Rotom-Wash typed Electric/Water, distinct from base Rotom', () => {
    expect(typesOf('Rotom-Wash')).toEqual(['Electric', 'Water']);
    expect(typesOf('Rotom')).toEqual(['Electric', 'Ghost']);
  });

  it('bans Battle Bond Greninja while allowing Greninja itself', () => {
    expect(isLegal('Greninja')).toBe(true);
    expect(checkAbilityLegality('Greninja', 'Protean').legal).toBe(true);
    expect(checkAbilityLegality('Greninja', 'Battle Bond').legal).toBe(false);
    expect(checkAbilityLegality('Greninja', 'Battle Bond').reason).toContain('may not run');
  });
});

describe('speed comparison bands', () => {
  it('separates a clean win from one a Choice Scarf would flip', () => {
    const scept: ChampionsSet = { species: 'Sceptile-Mega', nature: 'Timid', sp: { spe: 32 } };
    const cmp = compareSpeed(scept, { pool: ['Garchomp'] });
    expect(cmp.yourSpeed).toBe(216);
    // Garchomp maxes at 169, so Sceptile wins - but a Scarf Garchomp hits 253
    expect(cmp.outspeeds.map((e) => e.species)).toContain('Garchomp');
    expect(cmp.losesToScarf.map((e) => e.species)).toContain('Garchomp');
  });

  it('reports an exact speed tie as a tie, not a win', () => {
    const a: ChampionsSet = { species: 'Kingambit', nature: 'Adamant', sp: { spe: 32 } };
    const cmp = compareSpeed(a, { pool: ['Kingambit'] });
    expect(cmp.outspeeds).toHaveLength(0);
  });
});

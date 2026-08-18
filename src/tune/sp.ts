/**
 * SP tuner.
 *
 * Answers the two questions that actually drive a Champions spread:
 *   "what is the cheapest investment that survives these attacks?"
 *   "what is the cheapest investment that guarantees these knockouts?"
 *
 * Both searches exploit monotonicity - extra bulk never increases the damage you
 * take, extra offence never decreases the damage you deal - so each is a linear
 * scan rather than a brute force over every legal spread.
 *
 * Defensive results are reported worst-case: the attacker is assumed to roll
 * maximum. "Survives" therefore means survives every time, not usually.
 */
import { calculate, Field, Move, Side } from '@smogon/calc';
import { GEN, statsOf, toCalcPokemon, type ChampionsSet } from '../champions/adapter.js';
import {
  SP_BUDGET, SP_MAX_PER_STAT, STATS, validateSP,
  type SpSpread, type StatKey,
} from '../champions/sp.js';

export interface Threat {
  label?: string;
  attacker: ChampionsSet;
  move: string;
  /** Multi-target move sharing damage across two targets. */
  spread?: boolean;
  /** Assume this hit crits. */
  crit?: boolean;
  field?: { weather?: string; terrain?: string; reflect?: boolean; lightScreen?: boolean; friendGuard?: boolean };
}

function fieldFor(t: Threat): Field {
  return new Field({
    gameType: 'Doubles',
    weather: (t.field?.weather || undefined) as never,
    terrain: (t.field?.terrain || undefined) as never,
    attackerSide: new Side({} as never),
    defenderSide: new Side({
      isReflect: !!t.field?.reflect,
      isLightScreen: !!t.field?.lightScreen,
      isFriendGuard: !!t.field?.friendGuard,
    } as never),
  } as never);
}

function moveFor(t: Threat): Move {
  const opts: Record<string, unknown> = { isCrit: !!t.crit };
  if (!t.spread) opts.overrides = { target: 'normal' };
  return new Move(GEN, t.move, opts as never);
}

/** Max damage a threat deals to a defender built with `sp`. */
function maxDamageAgainst(defender: ChampionsSet, sp: SpSpread, threat: Threat): number {
  const def = toCalcPokemon({ ...defender, sp });
  const res = calculate(GEN, toCalcPokemon(threat.attacker), def, moveFor(threat), fieldFor(threat));
  const d = res.damage as unknown;
  const flat = typeof d === 'number' ? [d]
    : (d as Array<number | number[]>).map((x) => (typeof x === 'number' ? x : x.reduce((a, b) => a + b, 0)));
  return flat.length ? Math.max(...flat) : 0;
}

/** Which defensive stat a threat attacks. */
function defensiveStatFor(threat: Threat): 'def' | 'spd' | null {
  const m = new Move(GEN, threat.move);
  if (m.category === 'Physical') return 'def';
  if (m.category === 'Special') return 'spd';
  return null;
}

export interface DefensiveSolution {
  /** SP in hp / def / spd only; offensive stats are left to you. */
  sp: { hp: number; def: number; spd: number };
  /** Total SP consumed by the defensive half. */
  cost: number;
  /** SP still free for offence and speed. */
  freeSP: number;
  survivesAll: boolean;
  perThreat: Array<{ label: string; maxDamage: number; maxPercent: number; survives: boolean }>;
  maxHP: number;
}

export interface TuneOptions {
  /** SP already committed elsewhere (speed, offence). Defaults to none. */
  reserved?: SpSpread;
  /** Survive this many hits, not just one. Defaults to 1. */
  hits?: number;
  /** Keep at least this fraction of HP after the hits. Defaults to 0 (survive at 1 HP). */
  hpFloor?: number;
}

/**
 * Cheapest HP/Def/SpD investment that survives every threat.
 *
 * Returns the cheapest solution plus the next few alternatives, because the
 * cheapest total is often not the one you want - trading 2 SP of HP for 4 of
 * Def can matter if the threat list later grows on one side.
 */
export function tuneDefensive(
  defender: ChampionsSet,
  threats: Threat[],
  options: TuneOptions = {},
): { best: DefensiveSolution | null; alternatives: DefensiveSolution[]; impossible: string[] } {
  const hits = Math.max(1, options.hits ?? 1);
  const floor = options.hpFloor ?? 0;
  const reservedTotal = STATS.reduce(
    (n, s) => n + (s === 'hp' || s === 'def' || s === 'spd' ? 0 : options.reserved?.[s] ?? 0), 0,
  );

  const physical = threats.filter((t) => defensiveStatFor(t) === 'def');
  const special = threats.filter((t) => defensiveStatFor(t) === 'spd');

  const solutions: DefensiveSolution[] = [];
  const impossible: string[] = [];

  const survives = (sp: SpSpread, list: Threat[]): { ok: boolean; rows: DefensiveSolution['perThreat'] } => {
    const maxHP = statsOf({ ...defender, sp }).hp;
    const need = Math.ceil(maxHP * floor) + 1;
    const rows: DefensiveSolution['perThreat'] = [];
    let ok = true;
    for (const t of list) {
      const dmg = maxDamageAgainst(defender, sp, t) * hits;
      const left = maxHP - dmg;
      const survived = left >= need - 1 && left > 0;
      rows.push({
        label: t.label ?? `${t.attacker.label ?? t.attacker.species} ${t.move}`,
        maxDamage: dmg,
        maxPercent: Math.round((dmg / maxHP) * 1000) / 10,
        survives: survived,
      });
      if (!survived) ok = false;
    }
    return { ok, rows };
  };

  for (let hp = 0; hp <= SP_MAX_PER_STAT; hp++) {
    // Cheapest Def that handles the physical list at this HP.
    let defSP: number | null = physical.length ? null : 0;
    if (physical.length) {
      for (let d = 0; d <= SP_MAX_PER_STAT; d++) {
        if (survives({ ...options.reserved, hp, def: d }, physical).ok) { defSP = d; break; }
      }
    }
    let spdSP: number | null = special.length ? null : 0;
    if (special.length) {
      for (let s = 0; s <= SP_MAX_PER_STAT; s++) {
        if (survives({ ...options.reserved, hp, spd: s }, special).ok) { spdSP = s; break; }
      }
    }
    if (defSP === null || spdSP === null) continue;

    const sp = { hp, def: defSP, spd: spdSP };
    const cost = hp + defSP + spdSP;
    if (cost + reservedTotal > SP_BUDGET) continue;

    const full: SpSpread = { ...options.reserved, ...sp };
    const check = survives(full, threats);
    solutions.push({
      sp, cost,
      freeSP: SP_BUDGET - cost - reservedTotal,
      survivesAll: check.ok,
      perThreat: check.rows,
      maxHP: statsOf({ ...defender, sp: full }).hp,
    });
  }

  const viable = solutions.filter((s) => s.survivesAll).sort((a, b) => a.cost - b.cost);
  if (!viable.length) {
    for (const t of threats) {
      const maxSpread: SpSpread = { hp: 32, def: 32, spd: 2 };
      const stat = defensiveStatFor(t);
      const spread: SpSpread = stat === 'spd' ? { hp: 32, spd: 32, def: 2 } : maxSpread;
      const dmg = maxDamageAgainst(defender, spread, t) * hits;
      const hp = statsOf({ ...defender, sp: spread }).hp;
      if (dmg >= hp) impossible.push(`${t.label ?? t.move}: ${dmg} vs ${hp} max HP even at full investment`);
    }
  }

  return { best: viable[0] ?? null, alternatives: viable.slice(1, 5), impossible };
}

export interface OffensiveSolution {
  stat: 'atk' | 'spa';
  sp: number;
  /** Guaranteed KO in this many hits at the minimum roll. */
  hitsToKO: number;
  minPercent: number;
  maxPercent: number;
}

/**
 * Cheapest offensive SP that guarantees a KO in `hitsWanted` hits, judged on the
 * minimum roll so the answer is a guarantee rather than a coin flip.
 */
export function tuneOffensive(
  attacker: ChampionsSet,
  target: ChampionsSet,
  move: string,
  opts: { spread?: boolean; hitsWanted?: number; field?: Threat['field'] } = {},
): OffensiveSolution | null {
  const wanted = opts.hitsWanted ?? 1;
  const m = new Move(GEN, move);
  const stat: 'atk' | 'spa' = m.category === 'Physical' ? 'atk' : 'spa';
  if (m.category === 'Status') return null;

  const targetHP = statsOf(target).hp;
  const threat: Threat = { attacker, move, spread: opts.spread, field: opts.field };

  for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
    const atk = toCalcPokemon({ ...attacker, sp: { ...attacker.sp, [stat]: sp } });
    const res = calculate(GEN, atk, toCalcPokemon(target), moveFor(threat), fieldFor(threat));
    const d = res.damage as unknown;
    const flat = typeof d === 'number' ? [d]
      : (d as Array<number | number[]>).map((x) => (typeof x === 'number' ? x : x.reduce((a, b) => a + b, 0)));
    const min = Math.min(...flat), max = Math.max(...flat);
    if (min * wanted >= targetHP) {
      return {
        stat, sp, hitsToKO: wanted,
        minPercent: Math.round((min / targetHP) * 1000) / 10,
        maxPercent: Math.round((max / targetHP) * 1000) / 10,
      };
    }
  }
  return null;
}

/** Merge a defensive solution with reserved SP and report legality. */
export function combineSpread(
  reserved: SpSpread,
  defensive: DefensiveSolution['sp'],
): { sp: SpSpread; valid: boolean; errors: string[]; total: number; remaining: number } {
  const sp: SpSpread = { ...reserved };
  for (const k of ['hp', 'def', 'spd'] as StatKey[]) {
    sp[k] = (sp[k] ?? 0) + (defensive[k as 'hp' | 'def' | 'spd'] ?? 0);
  }
  const v = validateSP(sp);
  return { sp, valid: v.valid, errors: v.errors, total: v.total, remaining: v.remaining };
}

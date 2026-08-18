/**
 * One full turn of Champions doubles (2v2).
 *
 * Resolves speed order, spread targeting, redirection and absorbing abilities,
 * then applies damage slot by slot so that effects created earlier in the turn
 * (a Lightning Rod boost, a KO, a stat drop) are visible to later actions.
 *
 * Damage itself is delegated to @smogon/calc through the Champions adapter, so
 * ability/item/field interactions stay consistent with the real calculator.
 */
import { calculate, Field, Move, Side } from '@smogon/calc';
import { GEN, effectiveSpeed, statsOf, toCalcPokemon, type ChampionsSet } from '../champions/adapter.js';
import type { StatKey } from '../champions/sp.js';

export type SlotId = 'A1' | 'A2' | 'B1' | 'B2';
export const SLOTS: SlotId[] = ['A1', 'A2', 'B1', 'B2'];
export const sideOf = (s: SlotId): 'A' | 'B' => (s[0] === 'A' ? 'A' : 'B');
export const allyOf = (s: SlotId): SlotId =>
  ({ A1: 'A2', A2: 'A1', B1: 'B2', B2: 'B1' } as Record<SlotId, SlotId>)[s];
export const foesOf = (s: SlotId): SlotId[] => (sideOf(s) === 'A' ? ['B1', 'B2'] : ['A1', 'A2']);

export type Roll = 'min' | 'avg' | 'max';

export interface SideField {
  tailwind?: boolean;
  reflect?: boolean;
  lightScreen?: boolean;
  auroraVeil?: boolean;
  friendGuard?: boolean;
  helpingHand?: boolean;
}

export interface TurnField {
  weather?: '' | 'Sun' | 'Rain' | 'Sand' | 'Snow';
  terrain?: '' | 'Electric' | 'Grassy' | 'Misty' | 'Psychic';
  trickRoom?: boolean;
  gravity?: boolean;
  sideA: SideField;
  sideB: SideField;
}

export interface TurnAction {
  slot: SlotId;
  /** Move name as @smogon/calc knows it, or '' / 'Protect' etc. */
  move: string;
  /** Chosen target for single-target moves. Ignored for spread moves. */
  target?: SlotId;
}

export interface SlotState {
  set: ChampionsSet;
  maxHP: number;
  hp: number;
  boosts: Partial<Record<Exclude<StatKey, 'hp'>, number>>;
  fainted: boolean;
  protected: boolean;
  redirecting: boolean;
}

export interface TurnEvent {
  order: number;
  actor: SlotId;
  actorName: string;
  move: string;
  /** What actually happened, in plain language. */
  text: string;
  targets: Array<{
    slot: SlotId;
    name: string;
    outcome: 'damage' | 'absorbed' | 'immune' | 'redirected-away' | 'protected' | 'fainted-already' | 'no-damage';
    minDamage?: number;
    maxDamage?: number;
    applied?: number;
    minPercent?: number;
    maxPercent?: number;
    hpBefore?: number;
    hpAfter?: number;
    ko?: boolean;
    desc?: string;
    note?: string;
  }>;
}

export interface TurnResult {
  order: SlotId[];
  events: TurnEvent[];
  final: Record<SlotId, { name: string; hp: number; maxHP: number; percent: number; fainted: boolean; boosts: SlotState['boosts'] }>;
  warnings: string[];
}

/* ---------- ability tables ---------- */

interface AbsorbSpec {
  type: string;
  boost?: { stat: Exclude<StatKey, 'hp'>; stages: number };
  healFraction?: number;
  note: string;
}

const ABSORB: Record<string, AbsorbSpec> = {
  'Lightning Rod': { type: 'Electric', boost: { stat: 'spa', stages: 1 }, note: 'absorbed the Electric hit and rose +1 SpA' },
  'Storm Drain': { type: 'Water', boost: { stat: 'spa', stages: 1 }, note: 'absorbed the Water hit and rose +1 SpA' },
  'Motor Drive': { type: 'Electric', boost: { stat: 'spe', stages: 1 }, note: 'absorbed the Electric hit and rose +1 Spe' },
  'Sap Sipper': { type: 'Grass', boost: { stat: 'atk', stages: 1 }, note: 'absorbed the Grass hit and rose +1 Atk' },
  'Well-Baked Body': { type: 'Fire', boost: { stat: 'def', stages: 2 }, note: 'absorbed the Fire hit and rose +2 Def' },
  'Volt Absorb': { type: 'Electric', healFraction: 0.25, note: 'absorbed the Electric hit and healed' },
  'Water Absorb': { type: 'Water', healFraction: 0.25, note: 'absorbed the Water hit and healed' },
  'Dry Skin': { type: 'Water', healFraction: 0.25, note: 'absorbed the Water hit and healed' },
  'Earth Eater': { type: 'Ground', healFraction: 0.25, note: 'absorbed the Ground hit and healed' },
  'Flash Fire': { type: 'Fire', note: 'absorbed the Fire hit (Flash Fire active)' },
};

/** Abilities that pull single-target moves of a type toward themselves in doubles. */
const REDIRECT: Record<string, string> = {
  'Lightning Rod': 'Electric',
  'Storm Drain': 'Water',
};

const REDIRECT_MOVES = new Set(['Follow Me', 'Rage Powder']);
const PROTECT_MOVES = new Set(['Protect', 'Detect', 'Spiky Shield', 'Baneful Bunker', 'Burning Bulwark', 'Silk Trap']);

/* ---------- helpers ---------- */

function moveData(name: string) {
  try {
    return new Move(GEN, name);
  } catch {
    return null;
  }
}

function pickRoll(damage: readonly number[], roll: Roll): number {
  if (!damage.length) return 0;
  if (roll === 'min') return damage[0]!;
  if (roll === 'max') return damage[damage.length - 1]!;
  return damage[Math.floor(damage.length / 2)]!;
}

/** Flatten @smogon/calc's damage output (can be nested for multi-hit) to a sorted list. */
function flatDamage(d: number | number[] | number[][]): number[] {
  if (typeof d === 'number') return [d];
  const flat: number[] = [];
  for (const x of d as Array<number | number[]>) {
    if (typeof x === 'number') flat.push(x);
    else flat.push(x.reduce((a, b) => a + b, 0));
  }
  return flat.sort((a, b) => a - b);
}

function buildField(f: TurnField, attackerSide: 'A' | 'B'): Field {
  const mk = (s: SideField) =>
    new Side({
      isTailwind: !!s.tailwind,
      isReflect: !!s.reflect,
      isLightScreen: !!s.lightScreen,
      isAuroraVeil: !!s.auroraVeil,
      isFriendGuard: !!s.friendGuard,
      isHelpingHand: !!s.helpingHand,
    } as never);
  const atk = attackerSide === 'A' ? f.sideA : f.sideB;
  const def = attackerSide === 'A' ? f.sideB : f.sideA;
  return new Field({
    gameType: 'Doubles',
    weather: (f.weather || undefined) as never,
    terrain: (f.terrain || undefined) as never,
    isGravity: !!f.gravity,
    attackerSide: mk(atk),
    defenderSide: mk(def),
  } as never);
}

/* ---------- the simulator ---------- */

export function simulateTurn(
  sets: Record<SlotId, ChampionsSet | null>,
  actions: TurnAction[],
  field: TurnField,
  roll: Roll = 'max',
): TurnResult {
  const warnings: string[] = [];
  const state = {} as Record<SlotId, SlotState | null>;

  for (const id of SLOTS) {
    const set = sets[id];
    if (!set) { state[id] = null; continue; }
    const max = statsOf(set).hp;
    state[id] = {
      set,
      maxHP: max,
      hp: Math.max(1, Math.round(max * (set.hpPercent ?? 1))),
      boosts: { ...(set.boosts ?? {}) },
      fainted: false,
      protected: false,
      redirecting: false,
    };
  }

  const live = (id: SlotId) => state[id];
  const nameOf = (id: SlotId) => live(id)?.set.label || live(id)?.set.species || id;

  // --- speed / priority order ---
  const acting = actions.filter((a) => live(a.slot) && a.move);
  const ordered = [...acting].sort((x, y) => {
    const mx = moveData(x.move), my = moveData(y.move);
    const px = mx?.priority ?? 0, py = my?.priority ?? 0;
    if (px !== py) return py - px;
    const sx = effectiveSpeed(live(x.slot)!.set, {
      tailwind: sideOf(x.slot) === 'A' ? field.sideA.tailwind : field.sideB.tailwind,
      weather: field.weather,
    });
    const sy = effectiveSpeed(live(y.slot)!.set, {
      tailwind: sideOf(y.slot) === 'A' ? field.sideA.tailwind : field.sideB.tailwind,
      weather: field.weather,
    });
    if (sx !== sy) return field.trickRoom ? sx - sy : sy - sx;
    return SLOTS.indexOf(x.slot) - SLOTS.indexOf(y.slot);
  });

  // --- pre-pass: protect and redirection are set before damage resolves ---
  for (const a of ordered) {
    const st = live(a.slot);
    if (!st) continue;
    if (PROTECT_MOVES.has(a.move)) st.protected = true;
    if (REDIRECT_MOVES.has(a.move)) st.redirecting = true;
  }

  const events: TurnEvent[] = [];
  let order = 0;

  for (const action of ordered) {
    order += 1;
    const actor = live(action.slot);
    if (!actor) continue;

    const ev: TurnEvent = {
      order, actor: action.slot, actorName: nameOf(action.slot), move: action.move, text: '', targets: [],
    };

    if (actor.fainted) {
      ev.text = `${ev.actorName} already fainted and does not act.`;
      events.push(ev);
      continue;
    }

    const md = moveData(action.move);
    if (!md) {
      ev.text = `Unknown move "${action.move}" - skipped.`;
      warnings.push(`Unknown move: ${action.move}`);
      events.push(ev);
      continue;
    }

    if (PROTECT_MOVES.has(action.move)) {
      ev.text = `${ev.actorName} protected itself.`;
      events.push(ev);
      continue;
    }
    if (REDIRECT_MOVES.has(action.move)) {
      ev.text = `${ev.actorName} drew single-target attacks with ${action.move}.`;
      events.push(ev);
      continue;
    }
    if (md.category === 'Status' || (md.bp ?? 0) === 0) {
      ev.text = `${ev.actorName} used ${action.move} (status move - no damage modelled).`;
      events.push(ev);
      continue;
    }

    // --- targeting ---
    const tgt = (md as unknown as { target?: string }).target ?? 'normal';
    let targets: SlotId[] = [];
    if (tgt === 'allAdjacent') {
      targets = [...foesOf(action.slot), allyOf(action.slot)];
    } else if (tgt === 'allAdjacentFoes') {
      targets = foesOf(action.slot);
    } else {
      let chosen = action.target ?? foesOf(action.slot)[0]!;
      // redirection only applies to single-target moves
      const pool = foesOf(action.slot);
      const drawn = pool.find((id) => live(id) && !live(id)!.fainted && live(id)!.redirecting);
      const rod = pool.find((id) => {
        const s = live(id);
        if (!s || s.fainted) return false;
        const ab = s.set.ability ?? '';
        return REDIRECT[ab] === md.type;
      });
      if (rod && rod !== chosen) {
        ev.targets.push({ slot: chosen, name: nameOf(chosen), outcome: 'redirected-away',
          note: `pulled to ${nameOf(rod)} by ${live(rod)!.set.ability}` });
        chosen = rod;
      } else if (drawn && drawn !== chosen) {
        ev.targets.push({ slot: chosen, name: nameOf(chosen), outcome: 'redirected-away',
          note: `pulled to ${nameOf(drawn)}` });
        chosen = drawn;
      }
      targets = [chosen];
    }

    // The 0.75 spread reduction applies only when the move actually hits more than
    // one Pokemon. With a single live target the move resolves as single-target, so
    // the move's target is overridden rather than leaving the calc to assume a spread.
    const liveTargets = targets.filter((id) => live(id) && !live(id)!.fainted);
    const spread = liveTargets.length > 1;
    const atkPoke = toCalcPokemon({ ...actor.set, boosts: actor.boosts, hpPercent: actor.hp / actor.maxHP });

    for (const tid of targets) {
      const t = live(tid);
      if (!t) continue;
      if (t.fainted) {
        ev.targets.push({ slot: tid, name: nameOf(tid), outcome: 'fainted-already' });
        continue;
      }
      if (t.protected) {
        ev.targets.push({ slot: tid, name: nameOf(tid), outcome: 'protected' });
        continue;
      }

      // absorbing abilities fire whether the move was single-target or spread
      const ab = t.set.ability ?? '';
      const spec = ABSORB[ab];
      if (spec && spec.type === md.type) {
        let note = spec.note;
        if (spec.boost) {
          const cur = t.boosts[spec.boost.stat] ?? 0;
          const next = Math.max(-6, Math.min(6, cur + spec.boost.stages));
          t.boosts[spec.boost.stat] = next;
          note = `${spec.note} (now ${next >= 0 ? '+' : ''}${next})`;
        }
        if (spec.healFraction) {
          const before = t.hp;
          t.hp = Math.min(t.maxHP, t.hp + Math.floor(t.maxHP * spec.healFraction));
          note = `${spec.note} ${before} -> ${t.hp}`;
        }
        ev.targets.push({ slot: tid, name: nameOf(tid), outcome: 'absorbed', note, hpBefore: t.hp, hpAfter: t.hp });
        continue;
      }

      const defPoke = toCalcPokemon({ ...t.set, boosts: t.boosts, hpPercent: t.hp / t.maxHP });
      const f = buildField(field, sideOf(action.slot));
      const move = spread
        ? new Move(GEN, action.move)
        : new Move(GEN, action.move, { overrides: { target: 'normal' } } as never);

      let result;
      try {
        result = calculate(GEN, atkPoke, defPoke, move, f);
      } catch (e) {
        warnings.push(`calc failed for ${action.move} -> ${nameOf(tid)}: ${(e as Error).message}`);
        continue;
      }

      const dmg = flatDamage(result.damage as never);
      const min = dmg[0] ?? 0;
      const max = dmg[dmg.length - 1] ?? 0;
      if (max === 0) {
        ev.targets.push({ slot: tid, name: nameOf(tid), outcome: 'immune',
          note: 'no damage (immunity or non-damaging)' });
        continue;
      }

      const applied = Math.min(t.hp, pickRoll(dmg, roll));
      const before = t.hp;
      t.hp = Math.max(0, t.hp - applied);
      const ko = t.hp === 0;
      if (ko) t.fainted = true;

      let desc = '';
      try { desc = result.desc(); } catch { /* desc is cosmetic */ }

      ev.targets.push({
        slot: tid, name: nameOf(tid), outcome: 'damage',
        minDamage: min, maxDamage: max, applied,
        minPercent: Math.round((min / t.maxHP) * 1000) / 10,
        maxPercent: Math.round((max / t.maxHP) * 1000) / 10,
        hpBefore: before, hpAfter: t.hp, ko, desc,
      });
    }

    const hitNames = ev.targets.filter((x) => x.outcome === 'damage').map((x) => x.name);
    ev.text = `${ev.actorName} used ${action.move}${spread ? ' (spread)' : ''}${
      hitNames.length ? ` - hit ${hitNames.join(', ')}` : ''}.`;
    events.push(ev);
  }

  const final = {} as TurnResult['final'];
  for (const id of SLOTS) {
    const s = live(id);
    if (!s) continue;
    final[id] = {
      name: nameOf(id), hp: s.hp, maxHP: s.maxHP,
      percent: Math.round((s.hp / s.maxHP) * 1000) / 10,
      fainted: s.fainted, boosts: s.boosts,
    };
  }

  return { order: ordered.map((a) => a.slot), events, final, warnings };
}

import { useMemo, useState } from 'react';
import { MonEditor } from './MonEditor.js';
import { EMPTY_SET } from './store.js';
import type { ChampionsSet } from '../champions/adapter.js';
import {
  simulateTurn, SLOTS, type RollPolicy, type SlotId, type TurnAction, type TurnField,
} from '../sim/turn.js';

const SLOT_NAME: Record<SlotId, string> = {
  A1: 'Your slot 1', A2: 'Your slot 2', B1: 'Their slot 1', B2: 'Their slot 2',
};

const DEFAULTS: Record<SlotId, ChampionsSet> = {
  A1: { ...EMPTY_SET, species: 'Rotom-Wash', nature: 'Timid', ability: 'Levitate',
    item: 'Choice Scarf', sp: { spa: 32, spe: 32, hp: 2 }, moves: ['Discharge'] },
  A2: { ...EMPTY_SET, species: 'Sceptile-Mega', nature: 'Timid', ability: 'Lightning Rod',
    sp: { spa: 32, spe: 32, hp: 2 }, moves: ['Dragon Pulse'] },
  B1: { ...EMPTY_SET, species: 'Charizard-Mega-Y', nature: 'Modest', ability: 'Drought',
    sp: { hp: 32, spd: 24, spa: 10 }, moves: ['Heat Wave'] },
  B2: { ...EMPTY_SET, species: 'Kingambit', nature: 'Adamant', ability: 'Defiant',
    sp: { hp: 32, atk: 32, def: 2 }, moves: ['Sucker Punch'] },
};

export function TurnSim({ team }: { team: (ChampionsSet | null)[] }) {
  const [sets, setSets] = useState<Record<SlotId, ChampionsSet | null>>({ ...DEFAULTS });
  const [actions, setActions] = useState<Record<SlotId, TurnAction>>({
    A1: { slot: 'A1', move: 'Discharge' },
    A2: { slot: 'A2', move: 'Dragon Pulse', target: 'B1' },
    B1: { slot: 'B1', move: '' },
    B2: { slot: 'B2', move: '' },
  });
  const [field, setField] = useState<TurnField>({
    weather: '', terrain: '', trickRoom: false, sideA: {}, sideB: {},
  });
  const [policy, setPolicy] = useState<RollPolicy>('pessimistic');
  const [editing, setEditing] = useState<SlotId | null>('A1');

  const result = useMemo(
    () => simulateTurn(sets, Object.values(actions).filter((a) => a.move), field, policy),
    [sets, actions, field, policy],
  );

  const loadFromTeam = (slot: SlotId, idx: number) => {
    const s = team[idx];
    if (s) setSets((p) => ({ ...p, [slot]: { ...s } }));
  };

  return (
    <>
      <div className="card">
        <h2>Field</h2>
        <div className="row">
          <div>
            <label className="f">Weather</label>
            <select value={field.weather} onChange={(e) => setField({ ...field, weather: e.target.value as TurnField['weather'] })}>
              <option value="">None</option><option>Sun</option><option>Rain</option><option>Sand</option><option>Snow</option>
            </select>
          </div>
          <div>
            <label className="f">Terrain</label>
            <select value={field.terrain} onChange={(e) => setField({ ...field, terrain: e.target.value as TurnField['terrain'] })}>
              <option value="">None</option><option>Electric</option><option>Grassy</option><option>Misty</option><option>Psychic</option>
            </select>
          </div>
          <div>
            <label className="f">Rolls</label>
            <select value={policy} onChange={(e) => setPolicy(e.target.value as RollPolicy)}>
              <option value="pessimistic">Worst case (you min, them max)</option>
              <option value="min">All minimum</option>
              <option value="avg">All average</option>
              <option value="max">All maximum</option>
            </select>
          </div>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <div className="small">
            <label><input type="checkbox" style={{ width: 'auto' }} checked={!!field.trickRoom}
              onChange={(e) => setField({ ...field, trickRoom: e.target.checked })} /> Trick Room</label>
          </div>
          <div className="small">
            <label><input type="checkbox" style={{ width: 'auto' }} checked={!!field.sideA.tailwind}
              onChange={(e) => setField({ ...field, sideA: { ...field.sideA, tailwind: e.target.checked } })} /> Your Tailwind</label>
          </div>
          <div className="small">
            <label><input type="checkbox" style={{ width: 'auto' }} checked={!!field.sideB.tailwind}
              onChange={(e) => setField({ ...field, sideB: { ...field.sideB, tailwind: e.target.checked } })} /> Their Tailwind</label>
          </div>
          <div className="small">
            <label><input type="checkbox" style={{ width: 'auto' }} checked={!!field.sideB.reflect}
              onChange={(e) => setField({ ...field, sideB: { ...field.sideB, reflect: e.target.checked } })} /> Their Reflect</label>
          </div>
          <div className="small">
            <label><input type="checkbox" style={{ width: 'auto' }} checked={!!field.sideB.lightScreen}
              onChange={(e) => setField({ ...field, sideB: { ...field.sideB, lightScreen: e.target.checked } })} /> Their Light Screen</label>
          </div>
          <div className="small">
            <label><input type="checkbox" style={{ width: 'auto' }} checked={!!field.sideB.friendGuard}
              onChange={(e) => setField({ ...field, sideB: { ...field.sideB, friendGuard: e.target.checked } })} /> Their Friend Guard</label>
          </div>
        </div>
      </div>

      <div className="grid4">
        {SLOTS.map((id) => {
          const s = sets[id];
          const f = result.final[id];
          const pct = f ? f.percent : 100;
          return (
            <div className="slot" key={id}>
              <div className="row" style={{ marginBottom: 6 }}>
                <div className="small" style={{ fontWeight: 600 }}>{SLOT_NAME[id]}</div>
              </div>
              {s ? (
                <>
                  <div style={{ fontWeight: 600 }}>{s.label || s.species}</div>
                  <div className={`hp${pct <= 25 ? ' crit' : pct <= 50 ? ' low' : ''}`}>
                    <i style={{ width: `${Math.max(0, pct)}%` }} />
                  </div>
                  <div className="muted">
                    {f ? `${f.hp}/${f.maxHP} (${f.percent}%)` : '—'}
                    {f?.fainted && <span className="pill ko" style={{ marginLeft: 6 }}>KO</span>}
                  </div>
                  {f && Object.entries(f.boosts).filter(([, n]) => n).length > 0 && (
                    <div className="muted">
                      {Object.entries(f.boosts).filter(([, n]) => n)
                        .map(([k, n]) => `${n! > 0 ? '+' : ''}${n} ${k}`).join(', ')}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <label className="f">Move</label>
                    <input
                      value={actions[id].move}
                      placeholder="none"
                      onChange={(e) => setActions({ ...actions, [id]: { ...actions[id], move: e.target.value } })}
                    />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <label className="f">Target</label>
                    <select
                      value={actions[id].target ?? ''}
                      onChange={(e) => setActions({ ...actions, [id]: { ...actions[id], target: (e.target.value || undefined) as SlotId } })}
                    >
                      <option value="">auto</option>
                      {SLOTS.filter((x) => x !== id).map((x) => <option key={x} value={x}>{SLOT_NAME[x]}</option>)}
                    </select>
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="btn ghost" onClick={() => setEditing(editing === id ? null : id)}>
                      {editing === id ? 'Close' : 'Edit'}
                    </button>
                    {id.startsWith('A') && (
                      <select className="small" value="" onChange={(e) => loadFromTeam(id, Number(e.target.value))}>
                        <option value="">From team…</option>
                        {team.map((t, i) => t && <option key={i} value={i}>{t.label || t.species}</option>)}
                      </select>
                    )}
                  </div>
                </>
              ) : (
                <div className="slot empty" onClick={() => setSets({ ...sets, [id]: { ...DEFAULTS[id] } })}>
                  Empty — click to fill
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && sets[editing] && (
        <div className="card">
          <h2>{SLOT_NAME[editing]}</h2>
          <MonEditor set={sets[editing]!} onChange={(s) => setSets({ ...sets, [editing]: s })} />
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn ghost" onClick={() => setSets({ ...sets, [editing]: null })}>Clear slot</button>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Turn result <span className="tag">{result.policy === 'pessimistic' ? 'worst case' : result.policy}</span></h2>
        <div className="muted" style={{ marginBottom: 10 }}>
          Order: {result.order.map((s) => SLOT_NAME[s]).join(' → ') || 'nobody is acting'}
        </div>
        {result.events.map((e) => (
          <div className="evt" key={`${e.order}-${e.actor}`}>
            <b>{e.actorName}</b> — {e.text}
            <ul>
              {e.targets.map((t, i) => (
                <li key={i}>
                  {t.name}:{' '}
                  {t.outcome === 'damage' && (
                    <>
                      {t.minDamage}–{t.maxDamage} ({t.minPercent}–{t.maxPercent}%) · applied {t.applied} on the{' '}
                      {t.rollUsed} roll · {t.hpBefore} → {t.hpAfter} HP
                      {t.ko && <span className="pill ko" style={{ marginLeft: 6 }}>KO</span>}
                    </>
                  )}
                  {t.outcome === 'absorbed' && <span className="pill abs">{t.note}</span>}
                  {t.outcome === 'immune' && <span className="pill imm">no effect</span>}
                  {t.outcome === 'protected' && <span className="pill imm">protected</span>}
                  {t.outcome === 'redirected-away' && <span className="pill abs">{t.note}</span>}
                  {t.outcome === 'fainted-already' && <span className="pill imm">already down</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {result.warnings.map((w) => <div className="err" key={w}>{w}</div>)}
        {result.events.length === 0 && <div className="muted">Give at least one Pokémon a move.</div>}
      </div>
    </>
  );
}

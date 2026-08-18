import { useMemo, useState } from 'react';
import { MonEditor } from './MonEditor.js';
import { EMPTY_SET } from './store.js';
import type { ChampionsSet } from '../champions/adapter.js';
import { effectiveSpeed, statsOf } from '../champions/adapter.js';
import { checkAbilityLegality } from '../champions/roster.js';
import { effectivenessAgainst, teamCoverage, typesOf, type PokeType } from '../champions/coverage.js';
import { SP_BUDGET, validateSP } from '../champions/sp.js';

/** The seven-step framework, used as a checklist rather than prose. */
const STEPS = [
  { n: 1, title: 'Know your format', ask: 'What is strong in Reg M-B right now?' },
  { n: 2, title: 'Have an idea', ask: 'What am I using, and what does it counter?' },
  { n: 3, title: 'The core', ask: 'What are my 2–3 core Pokémon, and what beats them?' },
  { n: 4, title: 'Fill out the core', ask: 'What offensive and defensive synergy helps?' },
  { n: 5, title: 'Weaknesses and expansion', ask: 'How much speed control? Which matchups hurt?' },
  { n: 6, title: 'Find the details', ask: 'Which moves, items and SP spreads?' },
  { n: 7, title: 'Playtest and adjust', ask: 'What am I losing to? What never gets brought?' },
];

const S_TIER = [
  ['Kingambit', '52.4%'], ['Charizard-Mega-Y', '52.6%'], ['Basculegion', '52.0%'],
  ['Staraptor-Mega', '51.0%'], ['Farigiraf', '50.1%'], ['Pelipper', '51.1%'],
  ['Sylveon', '51.3%'], ['Garchomp', '49.4%'],
];

/** The in-progress Lightning Rod core, for a one-click starting point. */
const SCEPTILE_CORE: ChampionsSet[] = [
  { species: 'Rotom-Wash', label: 'Rotom-Wash', nature: 'Timid', ability: 'Levitate',
    item: 'Choice Scarf', sp: { spa: 32, spe: 32, hp: 2 },
    moves: ['Discharge', 'Hydro Pump', 'Volt Switch', 'Will-O-Wisp'] },
  { species: 'Sceptile-Mega', label: 'Mega Sceptile', nature: 'Timid', ability: 'Lightning Rod',
    sp: { spa: 32, spe: 32, hp: 2 },
    moves: ['Dragon Pulse', 'Energy Ball', 'Earth Power', 'Protect'] },
  { species: 'Kingambit', label: 'Kingambit', nature: 'Adamant', ability: 'Defiant',
    sp: { atk: 32, hp: 32, def: 2 },
    moves: ['Sucker Punch', 'Kowtow Cleave', 'Iron Head', 'Protect'] },
  { species: 'Incineroar', label: 'Incineroar', nature: 'Careful', ability: 'Intimidate',
    sp: { hp: 32, spd: 32, atk: 2 },
    moves: ['Fake Out', 'Knock Off', 'Flare Blitz', 'U-turn'] },
  { species: 'Farigiraf', label: 'Farigiraf', nature: 'Modest', ability: 'Armor Tail',
    sp: { hp: 32, spa: 32, spd: 2 },
    moves: ['Thunderbolt', 'Psychic', 'Trick Room', 'Helping Hand'] },
];

/** How hard an opposing Pokemon's own typing hits this team. */
function threatPressure(attacker: string, team: ChampionsSet[]): { count: number; worst: number } {
  const stabs = typesOf(attacker);
  let count = 0, worst = 1;
  for (const mon of team) {
    const d = typesOf(mon.species);
    const best = Math.max(...stabs.map((t) => effectivenessAgainst(t as PokeType, d)));
    if (best > 1) count += 1;
    if (best > worst) worst = best;
  }
  return { count, worst };
}

function effClass(v: number): string {
  if (v === 0) return 'eff0';
  if (v === 4) return 'eff4';
  if (v === 2) return 'eff2';
  if (v < 1) return 'effh';
  return '';
}
function effLabel(v: number): string {
  if (v === 0) return '0';
  if (v === 0.25) return '¼';
  if (v === 0.5) return '½';
  if (v === 1) return '·';
  return `${v}`;
}

export function TeamBuilder({
  team, setSlot,
}: { team: (ChampionsSet | null)[]; setSlot: (i: number, s: ChampionsSet | null) => void }) {
  const [editing, setEditing] = useState<number | null>(null);
  const filled = team.filter(Boolean) as ChampionsSet[];
  const coverage = useMemo(() => teamCoverage(filled.map((s) => s.species)), [filled]);

  return (
    <>
      {filled.length === 0 && (
        <div className="card">
          <h2>Start from something</h2>
          <div className="row">
            <button className="btn ghost" onClick={() => SCEPTILE_CORE.forEach((m, i) => setSlot(i, { ...m }))}>
              Load the Lightning Rod core (5 of 6)
            </button>
            <div className="muted" style={{ flex: 2 }}>
              Rotom-Wash + Mega Sceptile + Kingambit + Incineroar + Farigiraf, with the sixth slot
              still open.
            </div>
          </div>
        </div>
      )}

      <div className="grid3">
        {team.map((s, i) => {
          if (!s) {
            return (
              <div className="slot empty" key={i} onClick={() => { setSlot(i, { ...EMPTY_SET }); setEditing(i); }}>
                + Add Pokémon
              </div>
            );
          }
          const v = validateSP(s.sp);
          const legal = checkAbilityLegality(s.species, s.ability);
          const st = statsOf(s);
          return (
            <div className="slot" key={i}>
              <div style={{ fontWeight: 650 }}>{s.label || s.species}</div>
              <div className="muted">{s.nature} · {s.item || 'no item'} · {s.ability || 'default ability'}</div>
              <div className="small" style={{ marginTop: 6 }}>
                {st.hp} HP · {st.atk} Atk · {st.def} Def · {st.spa} SpA · {st.spd} SpD · {st.spe} Spe
              </div>
              <div className="muted">Effective Speed {effectiveSpeed(s)}</div>
              <div className={`meter${v.total > SP_BUDGET ? ' over' : ''}`}>
                <i style={{ width: `${Math.min(100, (v.total / SP_BUDGET) * 100)}%` }} />
              </div>
              <div className="muted">{v.total}/{SP_BUDGET} SP</div>
              {!legal.legal && <div className="err small">{legal.reason}</div>}
              {v.errors.map((e) => <div className="err small" key={e}>{e}</div>)}
              <div className="small" style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                {(s.moves ?? []).filter(Boolean).join(' · ') || 'no moves set'}
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn ghost" onClick={() => setEditing(editing === i ? null : i)}>
                  {editing === i ? 'Close' : 'Edit'}
                </button>
                <button className="btn ghost" onClick={() => { setSlot(i, null); setEditing(null); }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {editing !== null && team[editing] && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Slot {editing + 1}</h2>
          <div className="row" style={{ marginBottom: 10 }}>
            <div>
              <label className="f">Nickname (optional)</label>
              <input value={team[editing]!.label ?? ''}
                onChange={(e) => setSlot(editing, { ...team[editing]!, label: e.target.value })} />
            </div>
          </div>
          <MonEditor set={team[editing]!} onChange={(s) => setSlot(editing, s)} />
        </div>
      )}

      <div className="card">
        <h2>Defensive coverage</h2>
        {filled.length === 0 ? (
          <div className="muted">Add a Pokémon to see the coverage matrix.</div>
        ) : (
          <>
            <div className="legend">
              <span className="eff4">4× weak</span><span className="eff2">2× weak</span>
              <span>· neutral</span><span className="effh">resisted</span><span className="eff0">immune</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="cov">
                <thead>
                  <tr>
                    <th>Type</th>
                    {filled.map((s) => <th key={s.species}>{(s.label || s.species).slice(0, 9)}</th>)}
                    <th>weak</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.matrix.map((row) => (
                    <tr key={row.type}>
                      <td>{row.type}</td>
                      {row.perMember.map((v, i) => (
                        <td key={i} className={effClass(v)}>{effLabel(v)}</td>
                      ))}
                      <td className={row.weakCount >= 2 ? 'eff2' : ''}>{row.weakCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid2" style={{ marginTop: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 4 }}>Shared weaknesses (2+ members)</div>
                {coverage.sharedWeaknesses.length === 0
                  ? <div className="small ok">None — no type hits two of your team super effectively.</div>
                  : coverage.sharedWeaknesses.map((w) => (
                    <div className="small" key={w.type}>
                      <b className="eff2">{w.type}</b> — {w.members.join(', ')}
                    </div>
                  ))}
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 4 }}>Types nothing resists</div>
                {coverage.unresisted.length === 0
                  ? <div className="small ok">Every type is resisted by someone.</div>
                  : <div className="small">{coverage.unresisted.join(', ')}</div>}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <h2>S-tier checklist <span className="tag">Reg M-B wk 8</span></h2>
          <div className="muted" style={{ marginBottom: 8 }}>
            The eight Pokémon most likely to be across the table. Check each in the turn simulator.
          </div>
          <table>
            <thead>
              <tr><th>Pokémon</th><th>Win rate</th><th>Its STAB</th><th>Hits how many of yours SE</th></tr>
            </thead>
            <tbody>
              {S_TIER.map(([name, wr]) => {
                const p = filled.length ? threatPressure(name!, filled) : null;
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{wr}</td>
                    <td className="muted">{typesOf(name!).join('/')}</td>
                    <td className={p && p.count >= 2 ? 'eff2' : p && p.count === 1 ? 'warn' : 'ok'}>
                      {p ? `${p.count} of ${filled.length}${p.worst >= 4 ? ' (one at 4×)' : ''}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="muted" style={{ marginTop: 8 }}>
            Measured on the attacker's own typing, so it reflects STAB pressure rather than a full
            moveset — coverage moves will not show up here.
          </div>
        </div>

        <div className="card">
          <h2>Seven-step check</h2>
          {STEPS.map((s) => (
            <div key={s.n} style={{ marginBottom: 8 }}>
              <div className="small"><b>{s.n}. {s.title}</b></div>
              <div className="muted">{s.ask}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

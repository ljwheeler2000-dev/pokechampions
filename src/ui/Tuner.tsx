import { useMemo, useState } from 'react';
import { MonEditor, SpeciesSearch } from './MonEditor.js';
import { EMPTY_SET } from './store.js';
import type { ChampionsSet } from '../champions/adapter.js';
import { statsOf } from '../champions/adapter.js';
import { combineSpread, tuneDefensive, tuneOffensive, type Threat } from '../tune/sp.js';
import { SP_BUDGET, STAT_LABEL } from '../champions/sp.js';

const S_TIER = [
  'Kingambit', 'Charizard-Mega-Y', 'Basculegion', 'Staraptor-Mega',
  'Farigiraf', 'Pelipper', 'Sylveon', 'Garchomp',
];

/** A threat built from a species + move, with a sensible offensive spread assumed. */
function makeThreat(species: string, move: string, spread: boolean): Threat {
  const isPhysical = ['Iron Head', 'Sucker Punch', 'Close Combat', 'Brave Bird', 'Wave Crash',
    'Earthquake', 'Stone Edge', 'Aqua Jet', 'Kowtow Cleave'].includes(move);
  return {
    label: `${species} ${move}`,
    attacker: {
      species, nature: isPhysical ? 'Adamant' : 'Modest',
      sp: isPhysical ? { atk: 32, hp: 32, spe: 2 } : { spa: 32, hp: 32, spe: 2 },
    },
    move,
    spread,
  };
}

export function Tuner({ team }: { team: (ChampionsSet | null)[] }) {
  const [defender, setDefender] = useState<ChampionsSet>({
    ...EMPTY_SET, species: 'Sceptile-Mega', nature: 'Timid', ability: 'Lightning Rod', sp: {},
  });
  const [threats, setThreats] = useState<Array<{ species: string; move: string; spread: boolean }>>([
    { species: 'Kingambit', move: 'Iron Head', spread: false },
    { species: 'Charizard-Mega-Y', move: 'Heat Wave', spread: true },
  ]);
  const [newSpecies, setNewSpecies] = useState('Garchomp');
  const [newMove, setNewMove] = useState('Earthquake');

  const built = useMemo(() => threats.map((t) => makeThreat(t.species, t.move, t.spread)), [threats]);
  // Whatever you have put into Speed and offence in the editor is treated as
  // committed; the tuner only solves the HP/Def/SpD half.
  const reserved = useMemo(
    () => ({ spe: defender.sp.spe ?? 0, spa: defender.sp.spa ?? 0, atk: defender.sp.atk ?? 0 }),
    [defender.sp.spe, defender.sp.spa, defender.sp.atk],
  );
  const reservedTotal = reserved.spe + reserved.spa + reserved.atk;
  const result = useMemo(
    () => tuneDefensive(defender, built, { reserved }),
    [defender, built, reserved],
  );

  const [koTarget, setKoTarget] = useState('Kingambit');
  const [koMove, setKoMove] = useState('Dragon Pulse');
  const ko = useMemo(() => {
    const target: ChampionsSet = { species: koTarget, nature: 'Adamant', sp: { hp: 32, def: 16, spd: 16 } };
    try { return tuneOffensive(defender, target, koMove); } catch { return null; }
  }, [defender, koTarget, koMove]);

  return (
    <>
      <div className="grid2">
        <div className="card">
          <h2>Pokémon being tuned</h2>
          <MonEditor set={defender} onChange={setDefender} compact />
          <div className="muted" style={{ marginTop: 10 }}>
            Set Speed and offence above — the tuner treats those as committed and solves only
            HP / Def / SpD. {SP_BUDGET - reservedTotal} SP available for bulk.
            {(defender.sp.hp || defender.sp.def || defender.sp.spd) ? (
              <span className="warn"> HP/Def/SpD in the editor are ignored here; the answer below replaces them.</span>
            ) : null}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <select value="" onChange={(e) => { const s = team[Number(e.target.value)]; if (s) setDefender({ ...s }); }}>
              <option value="">Load from team…</option>
              {team.map((t, i) => t && <option key={i} value={i}>{t.label || t.species}</option>)}
            </select>
          </div>
        </div>

        <div className="card">
          <h2>Threats it must survive</h2>
          <table>
            <thead><tr><th>Attacker</th><th>Move</th><th>Spread</th><th /></tr></thead>
            <tbody>
              {threats.map((t, i) => (
                <tr key={i}>
                  <td>{t.species}</td>
                  <td>{t.move}</td>
                  <td>{t.spread ? 'yes' : 'no'}</td>
                  <td>
                    <button className="btn ghost" onClick={() => setThreats(threats.filter((_, j) => j !== i))}>×</button>
                  </td>
                </tr>
              ))}
              {threats.length === 0 && <tr><td colSpan={4} className="muted">No threats yet.</td></tr>}
            </tbody>
          </table>
          <div className="row" style={{ marginTop: 10 }}>
            <div style={{ flex: 2 }}>
              <label className="f">Attacker</label>
              <SpeciesSearch value={newSpecies} onPick={setNewSpecies} />
            </div>
            <div>
              <label className="f">Move</label>
              <input value={newMove} onChange={(e) => setNewMove(e.target.value)} />
            </div>
            <div style={{ flex: 0 }}>
              <button className="btn primary" style={{ whiteSpace: 'nowrap' }}
                onClick={() => setThreats([...threats, { species: newSpecies, move: newMove, spread: false }])}>
                Add
              </button>
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn ghost" onClick={() => setThreats(
              S_TIER.slice(0, 4).map((s) => ({
                species: s,
                move: s === 'Kingambit' ? 'Iron Head' : s === 'Charizard-Mega-Y' ? 'Heat Wave'
                  : s === 'Basculegion' ? 'Wave Crash' : 'Brave Bird',
                spread: s === 'Charizard-Mega-Y',
              })),
            )}>Load S-tier threats</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Cheapest bulk that survives everything</h2>
        {result.best ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 650, marginBottom: 4 }}>
              {(['hp', 'def', 'spd'] as const).filter((k) => result.best!.sp[k] > 0)
                .map((k) => `${result.best!.sp[k]} ${STAT_LABEL[k]}`).join(' / ') || 'no investment needed'}
            </div>
            <div className="small">
              Costs {result.best.cost} SP, leaving {result.best.freeSP} free. Max HP {result.best.maxHP}.
            </div>
            {(() => {
              const c = combineSpread(reserved, result.best!.sp);
              return c.valid
                ? <div className="ok small" style={{ marginTop: 6 }}>Full spread is legal: {c.total}/{SP_BUDGET} SP.</div>
                : <div className="err small" style={{ marginTop: 6 }}>{c.errors.join('; ')}</div>;
            })()}
            <table style={{ marginTop: 12 }}>
              <thead><tr><th>Threat</th><th>Max damage</th><th>% of HP</th><th>Survives</th></tr></thead>
              <tbody>
                {result.best.perThreat.map((t) => (
                  <tr key={t.label}>
                    <td>{t.label}</td><td>{t.maxDamage}</td><td>{t.maxPercent}%</td>
                    <td className={t.survives ? 'ok' : 'err'}>{t.survives ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.best.cost > 0 && result.alternatives.length > 0 && (
              <>
                <div className="muted" style={{ marginTop: 14, marginBottom: 4 }}>
                  Alternatives, in case the threat list grows on one side:
                </div>
                <table>
                  <thead><tr><th>Spread</th><th>Cost</th><th>Free SP</th><th>Max HP</th></tr></thead>
                  <tbody>
                    {result.alternatives.map((a, i) => (
                      <tr key={i}>
                        <td>{a.sp.hp} HP / {a.sp.def} Def / {a.sp.spd} SpD</td>
                        <td>{a.cost}</td><td>{a.freeSP}</td><td>{a.maxHP}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        ) : (
          <>
            <div className="err" style={{ fontSize: 15, marginBottom: 8 }}>
              No legal spread survives this list.
            </div>
            {result.impossible.map((m) => <div className="small" key={m}>{m}</div>)}
            {result.impossible.length === 0 && (
              <div className="small">
                Every combination that survives would break the 66 SP budget once Speed and offence are reserved.
                Try freeing SP above, or accept losing one of these matchups.
              </div>
            )}
          </>
        )}
        <div className="muted" style={{ marginTop: 10 }}>
          Attackers are assumed to roll maximum, so &ldquo;survives&rdquo; means every time, not usually.
          Their spreads are assumed max offensive investment.
        </div>
      </div>

      <div className="card">
        <h2>Cheapest offence for a guaranteed KO</h2>
        <div className="row">
          <div style={{ flex: 2 }}>
            <label className="f">Target</label>
            <SpeciesSearch value={koTarget} onPick={setKoTarget} />
          </div>
          <div>
            <label className="f">Move</label>
            <input value={koMove} onChange={(e) => setKoMove(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {ko ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 650 }}>
                {ko.sp} SP in {STAT_LABEL[ko.stat]}
              </div>
              <div className="small">
                {ko.minPercent}–{ko.maxPercent}% — guaranteed on the minimum roll.
              </div>
            </>
          ) : (
            <div className="muted">
              No SP investment up to the 32 cap guarantees the KO with that move, or the move deals no damage.
            </div>
          )}
          <div className="muted" style={{ marginTop: 6 }}>
            Target assumed at {statsOf({ species: koTarget, nature: 'Adamant', sp: { hp: 32, def: 16, spd: 16 } }).hp} HP
            with 32 HP / 16 Def / 16 SpD invested.
          </div>
        </div>
      </div>
    </>
  );
}

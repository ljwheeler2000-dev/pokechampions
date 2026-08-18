import { useMemo, useState } from 'react';
import type { ChampionsSet } from '../champions/adapter.js';
import { effectiveSpeed } from '../champions/adapter.js';
import { compareSpeed, speedInvestmentFor, speedTiers } from '../tune/speed.js';
import { SpeciesSearch } from './MonEditor.js';

export function SpeedTiers({ team }: { team: (ChampionsSet | null)[] }) {
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState<ChampionsSet>({
    species: 'Rotom-Wash', nature: 'Timid', sp: { spe: 32 }, item: 'Choice Scarf',
  });
  const [tailwind, setTailwind] = useState(false);
  const [target, setTarget] = useState(216);

  const tiers = useMemo(() => speedTiers(), []);
  const filtered = useMemo(
    () => (q ? tiers.filter((t) => t.species.toLowerCase().includes(q.toLowerCase())) : tiers),
    [tiers, q],
  );
  const cmp = useMemo(() => compareSpeed(subject, { tailwind }), [subject, tailwind]);
  const invest = useMemo(
    () => speedInvestmentFor(subject.species, target, { scarf: subject.item === 'Choice Scarf' }),
    [subject.species, target, subject.item],
  );
  const yourSpeed = effectiveSpeed(subject, { tailwind });

  return (
    <>
      <div className="grid2">
        <div className="card">
          <h2>Your Pokémon</h2>
          <div className="row">
            <div style={{ flex: 2 }}>
              <label className="f">Pokémon</label>
              <SpeciesSearch value={subject.species} onPick={(s) => setSubject({ ...subject, species: s })} />
            </div>
            <div>
              <label className="f">Speed SP</label>
              <input type="number" min={0} max={32} value={subject.sp.spe ?? 0}
                onChange={(e) => setSubject({ ...subject, sp: { ...subject.sp, spe: Number(e.target.value) } })} />
            </div>
            <div>
              <label className="f">Nature</label>
              <select value={subject.nature} onChange={(e) => setSubject({ ...subject, nature: e.target.value })}>
                <option>Timid</option><option>Jolly</option><option>Hardy</option>
                <option>Modest</option><option>Adamant</option><option>Brave</option><option>Quiet</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <div>
              <label className="f">Item</label>
              <select value={subject.item ?? ''} onChange={(e) => setSubject({ ...subject, item: e.target.value || undefined })}>
                <option value="">(none)</option><option>Choice Scarf</option>
              </select>
            </div>
            <div className="small" style={{ paddingBottom: 6 }}>
              <label><input type="checkbox" style={{ width: 'auto' }} checked={tailwind}
                onChange={(e) => setTailwind(e.target.checked)} /> Tailwind up</label>
            </div>
            <div>
              <select value="" onChange={(e) => { const s = team[Number(e.target.value)]; if (s) setSubject({ ...s }); }}>
                <option value="">From team…</option>
                {team.map((t, i) => t && <option key={i} value={i}>{t.label || t.species}</option>)}
              </select>
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 680, marginTop: 12 }}>{yourSpeed}</div>
          <div className="small">
            Beats {cmp.outspeeds.length} of the roster · loses to {cmp.outsped.length} · ties {cmp.ties.length}
          </div>
          {cmp.losesToScarf.length > 0 && (
            <div className="muted" style={{ marginTop: 6 }}>
              {cmp.losesToScarf.length} of the ones you beat would win with a Choice Scarf, including{' '}
              {cmp.losesToScarf.slice(0, 4).map((e) => e.species).join(', ')}.
            </div>
          )}
        </div>

        <div className="card">
          <h2>Reach a target Speed</h2>
          <div className="row">
            <div>
              <label className="f">Target Speed</label>
              <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            {invest.length === 0 ? (
              <div className="err small">
                {subject.species} cannot reach {target} even at 32 SP with a positive nature
                {subject.item === 'Choice Scarf' ? ' and a Scarf' : ''}.
              </div>
            ) : invest.map((o) => (
              <div className="small" key={o.nature}>
                <b>{o.sp} SP</b> with a {o.nature} nature → {o.speed}
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 10 }}>
            Common benchmarks: Mega Sceptile 216 · Scarf Rotom-Wash 226 · Garchomp 169 · Staraptor-Mega 145
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Roster speed tiers</h2>
        <div className="row" style={{ marginBottom: 10 }}>
          <div><input placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="muted" style={{ marginBottom: 8 }}>
          Opponents are shown at their realistic ceiling — max SP with a positive nature. Beating that
          number beats the spread they actually ran.
        </div>
        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr><th>Pokémon</th><th>Base</th><th>0 SP</th><th>Max neutral</th><th>Max +nature</th><th>+Scarf</th><th>vs you</th></tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((t) => {
                const beat = yourSpeed > t.positiveMax;
                const tie = yourSpeed === t.positiveMax;
                return (
                  <tr key={t.species}>
                    <td>{t.species}</td>
                    <td>{t.baseSpeed}</td>
                    <td>{t.min}</td>
                    <td>{t.neutralMax}</td>
                    <td>{t.positiveMax}</td>
                    <td>{t.scarfMax}</td>
                    <td className={beat ? 'ok' : tie ? 'warn' : 'err'}>
                      {beat ? 'you win' : tie ? 'tie' : 'you lose'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

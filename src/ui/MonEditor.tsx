import { useMemo, useState } from 'react';
import { Pokemon } from '@smogon/calc';
import { GEN, baseStatsOf, effectiveSpeed, statsOf, type ChampionsSet } from '../champions/adapter.js';
import { checkAbilityLegality, searchRoster } from '../champions/roster.js';
import {
  NATURE_NAMES, SP_BUDGET, SP_MAX_PER_STAT, STATS, STAT_LABEL, validateSP, type StatKey,
} from '../champions/sp.js';
import { MOVE_NAMES, ITEMS } from './data.js';

/** Type-ahead over the legal roster only, so an illegal pick is impossible. */
export function SpeciesSearch({ value, onPick }: { value: string; onPick: (s: string) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => searchRoster(q, 40), [q]);
  return (
    <div className="searchbox">
      <input
        value={open ? q : value}
        placeholder="Search the M-B roster…"
        onFocus={() => { setQ(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 140)}
        onChange={(e) => setQ(e.target.value)}
      />
      {open && (
        <div className="results">
          {hits.length === 0 && <div className="muted">No legal Pokémon matches that.</div>}
          {hits.map((h) => (
            <div key={h} onMouseDown={() => { onPick(h); setOpen(false); }}>{h}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoveSearch({ value, onPick }: { value: string; onPick: (m: string) => void }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MOVE_NAMES.slice(0, 40);
    return MOVE_NAMES.filter((m) => m.toLowerCase().includes(s)).slice(0, 40);
  }, [q]);
  return (
    <div className="searchbox">
      <input
        value={open ? q : value}
        placeholder="Move…"
        onFocus={() => { setQ(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 140)}
        onChange={(e) => setQ(e.target.value)}
      />
      {open && (
        <div className="results">
          {hits.map((h) => (
            <div key={h} onMouseDown={() => { onPick(h); setOpen(false); }}>{h}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function abilitiesFor(species: string): string[] {
  try {
    const p = new Pokemon(GEN, species, { level: 50 });
    const list = (p.species as unknown as { abilities?: Record<string, string> }).abilities;
    return list ? [...new Set(Object.values(list))] : [p.ability ?? ''];
  } catch {
    return [];
  }
}

export function MonEditor({
  set, onChange, compact = false,
}: { set: ChampionsSet; onChange: (s: ChampionsSet) => void; compact?: boolean }) {
  const stats = statsOf(set);
  const base = baseStatsOf(set.species);
  const v = validateSP(set.sp);
  const legality = checkAbilityLegality(set.species, set.ability);
  const abilities = useMemo(() => abilitiesFor(set.species), [set.species]);
  const speed = effectiveSpeed(set);

  const setSP = (k: StatKey, n: number) =>
    onChange({ ...set, sp: { ...set.sp, [k]: Math.max(0, Math.min(SP_MAX_PER_STAT, n || 0)) } });

  return (
    <div>
      <div className="row">
        <div style={{ flex: 2 }}>
          <label className="f">Pokémon</label>
          <SpeciesSearch
            value={set.species}
            onPick={(s) => onChange({ ...set, species: s, ability: abilitiesFor(s)[0] })}
          />
        </div>
        <div>
          <label className="f">Nature</label>
          <select value={set.nature} onChange={(e) => onChange({ ...set, nature: e.target.value })}>
            {NATURE_NAMES.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <div>
          <label className="f">Item</label>
          <select value={set.item ?? ''} onChange={(e) => onChange({ ...set, item: e.target.value || undefined })}>
            <option value="">(none)</option>
            {ITEMS.map((i) => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="f">Ability</label>
          <select value={set.ability ?? ''} onChange={(e) => onChange({ ...set, ability: e.target.value || undefined })}>
            <option value="">(default)</option>
            {abilities.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="f">Status</label>
          <select
            value={set.status ?? ''}
            onChange={(e) => onChange({ ...set, status: e.target.value as ChampionsSet['status'] })}
          >
            <option value="">Healthy</option>
            <option value="brn">Burned</option>
            <option value="par">Paralysed</option>
            <option value="psn">Poisoned</option>
          </select>
        </div>
      </div>

      {!legality.legal && <div className="err" style={{ marginTop: 6 }}>{legality.reason}</div>}
      {legality.legal && legality.reason && <div className="warn small" style={{ marginTop: 6 }}>{legality.reason}</div>}

      <div style={{ marginTop: 10 }}>
        <label className="f">SP spread — {v.total}/{SP_BUDGET} used, {Math.max(0, v.remaining)} left</label>
        <div className="statgrid">
          {STATS.map((s) => (
            <div key={s}>
              <div className="muted" style={{ marginBottom: 2 }}>{STAT_LABEL[s]}</div>
              <input
                type="number" min={0} max={SP_MAX_PER_STAT}
                value={set.sp[s] ?? 0}
                onChange={(e) => setSP(s, Number(e.target.value))}
              />
              <div className="muted" style={{ marginTop: 2, textAlign: 'center' }}>
                {stats[s]}<span style={{ opacity: 0.5 }}> / {base[s]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`meter${v.total > SP_BUDGET ? ' over' : ''}`}>
          <i style={{ width: `${Math.min(100, (v.total / SP_BUDGET) * 100)}%` }} />
        </div>
        {v.errors.map((e) => <div className="err" key={e}>{e}</div>)}
        <div className="muted">Effective Speed {speed}{set.item === 'Choice Scarf' ? ' (Scarf)' : ''}</div>
      </div>

      {!compact && (
        <div style={{ marginTop: 10 }}>
          <label className="f">Moves</label>
          <div className="grid4">
            {[0, 1, 2, 3].map((i) => (
              <MoveSearch
                key={i}
                value={set.moves?.[i] ?? ''}
                onPick={(m) => {
                  const moves = [...(set.moves ?? ['', '', '', ''])];
                  moves[i] = m;
                  onChange({ ...set, moves });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

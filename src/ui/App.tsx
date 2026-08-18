import { useState } from 'react';
import { useTeam } from './store.js';
import { TurnSim } from './TurnSim.js';
import { Tuner } from './Tuner.js';
import { TeamBuilder } from './TeamBuilder.js';
import { SpeedTiers } from './SpeedTiers.js';

type Tab = 'turn' | 'tuner' | 'team' | 'speed';

const TABS: Array<{ id: Tab; label: string; blurb: string }> = [
  { id: 'turn', label: 'Turn simulator', blurb: 'Play out one full 2v2 turn' },
  { id: 'tuner', label: 'SP tuner', blurb: 'Cheapest spread that survives a threat list' },
  { id: 'team', label: 'Team builder', blurb: 'Six slots, coverage, legality' },
  { id: 'speed', label: 'Speed tiers', blurb: 'Where you sit in the field' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('turn');
  const { team, setSlot } = useTeam();
  const [light, setLight] = useState(false);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    document.documentElement.setAttribute('data-theme', next ? 'light' : 'dark');
  };

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>PokéChampions</h1>
          <div className="sub">
            Regulation M-B doubles · 66 SP / 32 per stat · worst-case rolls by default
          </div>
        </div>
        <div className="spacer" />
        <button className="btn ghost" onClick={toggleTheme}>{light ? 'Dark' : 'Light'}</button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} aria-selected={tab === t.id} onClick={() => setTab(t.id)} title={t.blurb}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'turn' && <TurnSim team={team} />}
      {tab === 'tuner' && <Tuner team={team} />}
      {tab === 'team' && <TeamBuilder team={team} setSlot={setSlot} />}
      {tab === 'speed' && <SpeedTiers team={team} />}

      <div className="muted" style={{ marginTop: 24, lineHeight: 1.6 }}>
        Damage comes from @smogon/calc with a Champions SP adapter, so ability, item and field
        interactions match the real calculator. The roster snapshot is Regular Roster M-B, valid
        to 2026-09-02 — re-check Bulbapedia after that. Opposing SP spreads are assumptions, not
        scouted data: treat exact percentages as provisional and the direction as sound.
      </div>
    </div>
  );
}

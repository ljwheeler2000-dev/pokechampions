/** Team state, persisted locally so a build survives a refresh. */
import { useEffect, useState } from 'react';
import type { ChampionsSet } from '../champions/adapter.js';

export const EMPTY_SET: ChampionsSet = {
  species: 'Rotom-Wash',
  nature: 'Timid',
  sp: {},
  ability: 'Levitate',
  moves: ['Discharge', 'Hydro Pump', 'Volt Switch', 'Will-O-Wisp'],
  label: '',
};

const KEY = 'pokechampions.team.v1';

export function loadTeam(): (ChampionsSet | null)[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as (ChampionsSet | null)[];
      if (Array.isArray(parsed)) return [...parsed, null, null, null, null, null, null].slice(0, 6);
    }
  } catch { /* corrupt or unavailable storage falls back to a fresh team */ }
  return [null, null, null, null, null, null];
}

export function saveTeam(team: (ChampionsSet | null)[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(team));
  } catch { /* storage may be disabled; the app still works in memory */ }
}

export function useTeam() {
  const [team, setTeam] = useState<(ChampionsSet | null)[]>(loadTeam);
  useEffect(() => { saveTeam(team); }, [team]);

  const setSlot = (i: number, set: ChampionsSet | null) =>
    setTeam((t) => t.map((s, j) => (j === i ? set : s)));

  return { team, setTeam, setSlot };
}

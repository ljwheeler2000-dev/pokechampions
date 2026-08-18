/**
 * Move and item names, derived from the Smogon dex at runtime.
 *
 * Deriving rather than checking in a generated list means the pickers cannot
 * drift from the data the calculator actually uses when @smogon/calc updates.
 */
import { GEN } from '../champions/adapter.js';

function sortedNames(iter: Iterable<{ name: string }>, skip: string[] = []): string[] {
  const out: string[] = [];
  for (const x of iter) if (!skip.includes(x.name)) out.push(x.name);
  return out.sort();
}

export const MOVE_NAMES: string[] = sortedNames(GEN.moves as Iterable<{ name: string }>, ['(No Move)']);
export const ITEMS: string[] = sortedNames(GEN.items as Iterable<{ name: string }>);

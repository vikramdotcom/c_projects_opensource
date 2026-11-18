import { isBlank, normalizeValue } from "./normalize.ts";
import { similarity } from "./similarity.ts";
import type {
  Cell,
  DedupeConfig,
  DedupeResult,
  DuplicateGroup,
  GroupDecision,
  KeepStrategy,
} from "./types.ts";

export type ProgressFn = (done: number, total: number) => void;

class UnionFind {
  parent: Int32Array;
  constructor(size: number) {
    this.parent = new Int32Array(size);
    for (let i = 0; i < size; i++) this.parent[i] = i;
  }
  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }
  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    if (ra < rb) this.parent[rb] = ra;
    else this.parent[ra] = rb;
  }
}

function filledCount(row: Cell[]): number {
  let n = 0;
  for (const c of row) if (!isBlank(c)) n++;
  return n;
}

export function pickKeeper(indexes: number[], rows: Cell[][], strategy: KeepStrategy): number {
  if (strategy === "last") return indexes[indexes.length - 1];
  if (strategy === "mostComplete") {
    let best = indexes[0];
    let bestCount = filledCount(rows[best]);
    for (const i of indexes) {
      const c = filledCount(rows[i]);
      if (c > bestCount) {
        best = i;
        bestCount = c;
      }
    }
    return best;
  }
  return indexes[0];
}

/** Very common trigrams (like " jo") are skipped as candidate sources to keep big files fast. */
const STOP_GRAM_LIMIT = 3000;

/** Distinct trigrams of each word, padded with spaces. Word order does not matter. */
function trigrams(s: string): string[] {
  const set = new Set<string>();
  for (const token of s.split(" ")) {
    if (!token) continue;
    const padded = ` ${token} `;
    for (let i = 0; i + 3 <= padded.length; i++) set.add(padded.slice(i, i + 3));
  }
  return [...set];
}

/**
 * Fuzzy matching inside one block.
 * A trigram index finds candidate pairs that share enough three-letter chunks.
 * Each candidate is then confirmed with an edit-distance similarity check on every fuzzy column.
 */
function fuzzyMatchBlock(
  members: number[],
  fuzzyValues: string[][],
  minSimilarity: number,
  uf: UnionFind,
  advance: (rows: number) => void,
): void {
  // Rows with identical fuzzy values are duplicates without any fuzzy work.
  const byValue = new Map<string, number[]>();
  for (const i of members) {
    const key = fuzzyValues[i].join("\u0001");
    const list = byValue.get(key);
    if (list) list.push(i);
    else byValue.set(key, [i]);
  }
  const reps: number[] = [];
  for (const list of byValue.values()) {
    for (let k = 1; k < list.length; k++) uf.union(list[0], list[k]);
    reps.push(list[0]);
  }
  advance(members.length - reps.length);

  // Candidates come from the first fuzzy column. Every fuzzy column is checked afterwards.
  const keys = reps.map((id) => fuzzyValues[id][0]);
  const grams = keys.map(trigrams);
  const postings = new Map<string, number[]>();
  const counts = new Int32Array(reps.length);
  const touched: number[] = [];

  for (let a = 0; a < reps.length; a++) {
    let stopShared = 0;
    for (const g of grams[a]) {
      const list = postings.get(g);
      if (!list) continue;
      if (list.length > STOP_GRAM_LIMIT) {
        stopShared++;
        continue;
      }
      for (const b of list) if (counts[b]++ === 0) touched.push(b);
    }

    const ka = keys[a];
    for (const b of touched) {
      const shared = counts[b] + stopShared;
      counts[b] = 0;
      const kb = keys[b];
      const maxEdits = Math.floor((1 - minSimilarity) * Math.max(ka.length, kb.length));
      if (Math.abs(ka.length - kb.length) > maxEdits + 1) continue;
      // Each edit breaks at most 3 trigrams. Extra slack covers edits that split words.
      if (shared < Math.max(grams[a].length, grams[b].length) - 3 * maxEdits - 3) continue;
      const va = fuzzyValues[reps[a]];
      const vb = fuzzyValues[reps[b]];
      if (va.every((v, k) => similarity(v, vb[k]) >= minSimilarity)) uf.union(reps[a], reps[b]);
    }
    touched.length = 0;

    for (const g of grams[a]) {
      const list = postings.get(g);
      if (list) list.push(a);
      else postings.set(g, [a]);
    }
    advance(1);
  }
}

export function findDuplicates(
  rows: Cell[][],
  config: DedupeConfig,
  onProgress?: ProgressFn,
): DedupeResult {
  const start = Date.now();
  const exactRules = config.rules.filter((r) => r.mode === "exact");
  const fuzzyRules = config.rules.filter((r) => r.mode === "fuzzy");
  const minSimilarity = config.similarity / 100;

  // 1. Normalize values and put rows into blocks. Only rows in the same block are compared.
  const blocks = new Map<string, number[]>();
  const fuzzyValues: string[][] = new Array(rows.length);
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const exact = exactRules.map((r) => normalizeValue(row[r.index], r.kind, config.normalize));
    const fuzzy = fuzzyRules.map((r) => normalizeValue(row[r.index], r.kind, config.normalize));
    const all = [...exact, ...fuzzy];
    if (all.every((v) => v === "") || (config.skipBlanks && all.some((v) => v === ""))) {
      skipped++;
      continue;
    }
    fuzzyValues[i] = fuzzy;

    // Only rows with the same exact-match values are compared with each other.
    const blockKey = exact.join("\u0001");
    const list = blocks.get(blockKey);
    if (list) list.push(i);
    else blocks.set(blockKey, [i]);
  }

  // 2. Link duplicate rows.
  const uf = new UnionFind(rows.length);
  const total = rows.length - skipped;
  let done = 0;
  let lastReport = 0;

  const advance = (n: number) => {
    done += n;
    if (onProgress && done - lastReport >= 1000) {
      lastReport = done;
      onProgress(done, total);
    }
  };

  for (const members of blocks.values()) {
    if (members.length > 1 && fuzzyRules.length > 0) {
      fuzzyMatchBlock(members, fuzzyValues, minSimilarity, uf, advance);
    } else {
      for (let k = 1; k < members.length; k++) uf.union(members[0], members[k]);
      advance(members.length);
    }
  }
  onProgress?.(total, total);

  // 3. Collect groups with more than one row.
  const byRoot = new Map<number, number[]>();
  for (const members of blocks.values()) {
    for (const i of members) {
      const root = uf.find(i);
      const list = byRoot.get(root);
      if (list) list.push(i);
      else byRoot.set(root, [i]);
    }
  }

  const groups: DuplicateGroup[] = [...byRoot.values()]
    .filter((g) => g.length > 1)
    .map((g) => g.sort((a, b) => a - b))
    .sort((a, b) => a[0] - b[0])
    .map((indexes, id) => ({ id, rows: indexes, keeper: pickKeeper(indexes, rows, config.keep) }));

  return {
    groups,
    comparedRows: total,
    skippedRows: skipped,
    durationMs: Date.now() - start,
  };
}

/** Row indexes that will be removed, after applying the user's decisions. */
export function rowsToRemove(
  groups: DuplicateGroup[],
  decisions: Record<number, GroupDecision>,
): Set<number> {
  const removed = new Set<number>();
  for (const g of groups) {
    const d = decisions[g.id];
    if (d?.ignored) continue;
    const keeper = d?.keeper ?? g.keeper;
    for (const r of g.rows) if (r !== keeper) removed.add(r);
  }
  return removed;
}

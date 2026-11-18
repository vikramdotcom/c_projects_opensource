/** A single spreadsheet cell value as read by SheetJS. */
export type Cell = string | number | boolean | Date | null;

export interface Dataset {
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rows: Cell[][];
}

/** How a column's values are cleaned before comparing. */
export type ColumnKind = "text" | "email" | "phone";

/** Exact: normalized values must be identical. Fuzzy: values must be similar enough. */
export type MatchMode = "exact" | "fuzzy";

export interface ColumnRule {
  index: number;
  kind: ColumnKind;
  mode: MatchMode;
}

export interface NormalizeOptions {
  trim: boolean;
  ignoreCase: boolean;
  collapseSpaces: boolean;
  stripPunctuation: boolean;
}

export type KeepStrategy = "first" | "last" | "mostComplete";

export interface DedupeConfig {
  rules: ColumnRule[];
  normalize: NormalizeOptions;
  /** Minimum similarity (50-100) for fuzzy columns. */
  similarity: number;
  keep: KeepStrategy;
  /** Ignore rows where any compared column is blank. */
  skipBlanks: boolean;
}

export interface DuplicateGroup {
  id: number;
  /** Row indexes into Dataset.rows, ascending. */
  rows: number[];
  /** Row index suggested to keep. */
  keeper: number;
}

export interface DedupeResult {
  groups: DuplicateGroup[];
  comparedRows: number;
  skippedRows: number;
  durationMs: number;
}

/** A user's decision about one duplicate group. */
export interface GroupDecision {
  keeper?: number;
  /** True when the user says the rows are not really duplicates. */
  ignored?: boolean;
}

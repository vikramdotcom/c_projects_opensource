import type { Cell, ColumnKind, NormalizeOptions } from "./types.ts";

export function cellToString(cell: Cell | undefined): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) {
    return Number.isNaN(cell.getTime()) ? "" : cell.toISOString().slice(0, 10);
  }
  return String(cell);
}

export function isBlank(cell: Cell | undefined): boolean {
  return cellToString(cell).trim() === "";
}

/** Clean a value so that formatting differences do not hide duplicates. */
export function normalizeValue(
  cell: Cell | undefined,
  kind: ColumnKind,
  opts: NormalizeOptions,
): string {
  let s = cellToString(cell);

  if (kind === "phone") {
    // Keep digits only and compare the last 10, so "+91 98765-43210" equals "09876543210".
    const digits = s.replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  if (kind === "email") {
    return s.trim().toLowerCase();
  }

  if (opts.trim) s = s.trim();
  if (opts.collapseSpaces) s = s.replace(/\s+/g, " ");
  if (opts.ignoreCase) s = s.toLowerCase();
  if (opts.stripPunctuation) {
    s = s.replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
  }
  return s;
}

/** Guess a column's kind from its header name. */
export function guessKind(header: string): ColumnKind {
  if (/e-?mail/i.test(header)) return "email";
  if (/phone|mobile|cell|tel|whatsapp|contact\s*no/i.test(header)) return "phone";
  return "text";
}

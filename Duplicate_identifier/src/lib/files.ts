import * as XLSX from "xlsx";
import type { Cell, Dataset } from "./types.ts";

export const ACCEPTED_EXTENSIONS = [
  ".xlsx",
  ".xls",
  ".xlsm",
  ".xlsb",
  ".ods",
  ".csv",
  ".tsv",
  ".txt",
  ".json",
];

const TEXT_FORMATS = [".csv", ".tsv", ".txt"];

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Flatten nested JSON values so they fit in one cell. */
function flattenValue(v: unknown): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && !(v instanceof Date)) return JSON.stringify(v);
  return v as Cell;
}

function jsonToWorkbook(text: string): XLSX.WorkBook {
  const data: unknown = JSON.parse(text);
  let records: unknown[] | undefined;
  if (Array.isArray(data)) {
    records = data;
  } else if (data && typeof data === "object") {
    // Accept shapes like { "users": [ ... ] } by using the first array property.
    records = Object.values(data).find((v): v is unknown[] => Array.isArray(v));
  }
  if (!records) throw new Error("JSON file must contain an array of records.");

  const sheet = records.every((r) => Array.isArray(r))
    ? XLSX.utils.aoa_to_sheet((records as unknown[][]).map((r) => r.map(flattenValue)))
    : XLSX.utils.json_to_sheet(
        records.map((r) =>
          Object.fromEntries(
            Object.entries((r ?? {}) as Record<string, unknown>).map(([k, v]) => [
              k,
              flattenValue(v),
            ]),
          ),
        ),
      );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "data");
  return wb;
}

export async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const ext = extensionOf(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type "${ext || file.name}".`);
  }
  if (ext === ".json") return jsonToWorkbook(await file.text());
  if (TEXT_FORMATS.includes(ext)) {
    // raw keeps text as-is, so phone numbers keep their leading zeros.
    return XLSX.read(await file.text(), { type: "string", raw: true });
  }
  // UTC keeps dates on the right day in time zones ahead of UTC, such as India.
  return XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true, UTC: true });
}

export function sheetToDataset(wb: XLSX.WorkBook, sheetName: string, fileName: string): Dataset {
  const sheet = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<Cell[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
    blankrows: false,
    UTC: true,
  });

  const width = aoa.reduce((max, r) => Math.max(max, r.length), 0);
  const headerRow = aoa[0] ?? [];
  const seen = new Map<string, number>();
  const headers = Array.from({ length: width }, (_, i) => {
    const raw = headerRow[i];
    let name = raw === null || raw === undefined || String(raw).trim() === "" ? `Column ${i + 1}` : String(raw).trim();
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count > 0) name = `${name} (${count + 1})`;
    return name;
  });

  const rows = aoa.slice(1).map((r) => {
    const row = r.slice(0, width);
    while (row.length < width) row.push(null);
    return row;
  });

  return { fileName, sheetName, sheetNames: wb.SheetNames, headers, rows };
}

/** CSV cannot hold styling, so it stays plain. Dates are written as YYYY-MM-DD. */
export function downloadCleanCsv(dataset: Dataset, removed: Set<number>) {
  const kept = dataset.rows.filter((_, i) => !removed.has(i));
  const sheet = XLSX.utils.aoa_to_sheet([dataset.headers, ...kept], {
    cellDates: true,
    UTC: true,
    dateNF: "yyyy-mm-dd",
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Clean");
  const dot = dataset.fileName.lastIndexOf(".");
  const base = dot === -1 ? dataset.fileName : dataset.fileName.slice(0, dot);
  XLSX.writeFile(wb, `${base}_clean.csv`, { bookType: "csv" });
}

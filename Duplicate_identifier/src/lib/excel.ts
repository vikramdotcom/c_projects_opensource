// Styled Excel exports built with ExcelJS. Loaded on demand when the user downloads.
import type { Workbook, Worksheet, Fill, Font, Borders } from "exceljs";
import { cellToString } from "./normalize.ts";
import type { Cell, DedupeConfig, Dataset, DuplicateGroup, GroupDecision } from "./types.ts";

export interface ExportContext {
  dataset: Dataset;
  config: DedupeConfig;
  groups: DuplicateGroup[];
  decisions: Record<number, GroupDecision>;
  removed: Set<number>;
}

const COLOR = {
  brand: "FF4F46E5",
  brandDark: "FF3730A3",
  brandSoft: "FFEEF2FF",
  band: "FFF6F7FF",
  border: "FFE4E4E7",
  text: "FF18181B",
  muted: "FF71717A",
  white: "FFFFFFFF",
  rose: "FFE11D48",
  roseSoft: "FFFFE4E6",
  roseText: "FF9F1239",
  green: "FF059669",
  greenSoft: "FFD1FAE5",
  greenText: "FF065F46",
  graySoft: "FFF4F4F5",
  grayText: "FF52525B",
  groupBand: "FFF8FAFC",
};

const FONT = "Calibri";
const solid = (argb: string): Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const thin = (argb: string) => ({ style: "thin" as const, color: { argb } });

async function newWorkbook(): Promise<Workbook> {
  const mod = await import("exceljs");
  const ExcelJS = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Duplicate Identifier (built by Vikram)";
  wb.created = new Date();
  return wb;
}

async function save(wb: Workbook, fileName: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? fileName : fileName.slice(0, dot);
}

/** Width from the longest value in the first rows, clamped to a readable range. */
function columnWidths(headers: string[], rows: Cell[][]): number[] {
  const sample = rows.slice(0, 2000);
  return headers.map((h, c) => {
    let max = h.length + 4; // room for the filter button
    for (const r of sample) {
      const v = r[c];
      const len = v instanceof Date ? 11 : cellToString(v).length;
      if (len > max) max = len;
    }
    return Math.min(Math.max(max + 2, 10), 50);
  });
}

function styleHeaderRow(ws: Worksheet, count: number, fill: string) {
  const row = ws.getRow(1);
  row.height = 26;
  for (let c = 1; c <= count; c++) {
    const cell = row.getCell(c);
    cell.font = { name: FONT, bold: true, size: 11, color: { argb: COLOR.white } };
    cell.fill = solid(fill);
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    cell.border = { bottom: thin(fill) } as Partial<Borders>;
  }
}

/**
 * A data sheet with a coloured, frozen header row, filters, sensible widths,
 * date formatting and zebra banding that stays correct after sorting.
 */
function addTableSheet(
  wb: Workbook,
  name: string,
  headers: string[],
  rows: Cell[][],
  accent: string,
): Worksheet {
  const ws = wb.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
    properties: { tabColor: { argb: accent } },
  });
  const widths = columnWidths(headers, rows);
  ws.columns = headers.map((h, i) => ({ header: h, width: widths[i] }));
  ws.addRows(rows);
  styleHeaderRow(ws, headers.length, accent);

  headers.forEach((_, c) => {
    if (rows.some((r) => r[c] instanceof Date)) ws.getColumn(c + 1).numFmt = "dd mmm yyyy";
  });

  if (headers.length > 0) {
    const last = ws.getColumn(headers.length).letter;
    ws.autoFilter = { from: "A1", to: `${last}1` };
    if (rows.length > 0) {
      ws.addConditionalFormatting({
        ref: `A2:${last}${rows.length + 1}`,
        rules: [
          {
            type: "expression",
            priority: 1,
            formulae: ["MOD(ROW(),2)=0"],
            style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: COLOR.band } } },
          },
        ],
      });
    }
  }
  return ws;
}

function describeRules(ctx: ExportContext): string {
  const { config, dataset } = ctx;
  if (config.rules.length === dataset.headers.length && config.rules.every((r) => r.mode === "exact")) {
    return "Whole row (exact)";
  }
  return config.rules
    .map((r) => {
      const name = dataset.headers[r.index];
      return r.mode === "fuzzy" ? `${name} (fuzzy, ${config.similarity}%)` : `${name} (exact)`;
    })
    .join(", ");
}

function addSummarySheet(wb: Workbook, ctx: ExportContext, title: string) {
  const ws = wb.addWorksheet("Summary", {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: COLOR.brandDark } },
  });
  ws.columns = [{ width: 3 }, { width: 30 }, { width: 46 }];

  const titleCell = ws.getCell("B2");
  titleCell.value = "Duplicate Identifier";
  titleCell.font = { name: FONT, size: 22, bold: true, color: { argb: COLOR.brand } };
  ws.getRow(2).height = 34;
  const sub = ws.getCell("B3");
  sub.value = title;
  sub.font = { name: FONT, size: 12, color: { argb: COLOR.muted } };

  const label: Partial<Font> = { name: FONT, size: 11, color: { argb: COLOR.muted } };
  const value: Partial<Font> = { name: FONT, size: 11, color: { argb: COLOR.text } };
  const details: [string, string][] = [
    ["Source file", ctx.dataset.fileName],
    ["Sheet", ctx.dataset.sheetName],
    ["Processed on", new Date().toLocaleString()],
    ["Duplicates matched on", describeRules(ctx)],
    [
      "Row kept in each group",
      { first: "First occurrence", last: "Last occurrence", mostComplete: "Most complete row" }[
        ctx.config.keep
      ],
    ],
  ];
  details.forEach(([k, v], i) => {
    const r = 5 + i;
    ws.getCell(`B${r}`).value = k;
    ws.getCell(`B${r}`).font = label;
    ws.getCell(`C${r}`).value = v;
    ws.getCell(`C${r}`).font = value;
    ws.getCell(`C${r}`).alignment = { wrapText: true, vertical: "top" };
  });

  const statsTop = 5 + details.length + 1;
  const header = ws.getRow(statsTop);
  header.height = 24;
  ["B", "C"].forEach((col, i) => {
    const cell = ws.getCell(`${col}${statsTop}`);
    cell.value = i === 0 ? "Results" : "";
    cell.font = { name: FONT, bold: true, color: { argb: COLOR.white } };
    cell.fill = solid(COLOR.brand);
    cell.alignment = { vertical: "middle", indent: 1 };
  });

  const ignored = ctx.groups.filter((g) => ctx.decisions[g.id]?.ignored).length;
  const stats: [string, number, string][] = [
    ["Rows in original file", ctx.dataset.rows.length, COLOR.text],
    ["Duplicate groups found", ctx.groups.length - ignored, COLOR.brand],
    ["Duplicate rows removed", ctx.removed.size, COLOR.rose],
    ["Rows in clean file", ctx.dataset.rows.length - ctx.removed.size, COLOR.green],
  ];
  stats.forEach(([k, v, color], i) => {
    const r = statsTop + 1 + i;
    ws.getRow(r).height = 24;
    const kc = ws.getCell(`B${r}`);
    const vc = ws.getCell(`C${r}`);
    kc.value = k;
    vc.value = v;
    kc.font = { name: FONT, size: 11, color: { argb: COLOR.text } };
    vc.font = { name: FONT, size: 14, bold: true, color: { argb: color } };
    vc.numFmt = "#,##0";
    vc.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
    kc.alignment = { vertical: "middle", indent: 1 };
    for (const c of [kc, vc]) {
      c.fill = solid(i % 2 === 0 ? COLOR.brandSoft : COLOR.white);
      c.border = { bottom: thin(COLOR.border) } as Partial<Borders>;
    }
  });

  const pct = ctx.dataset.rows.length ? ctx.removed.size / ctx.dataset.rows.length : 0;
  const note = ws.getCell(`B${statsTop + stats.length + 2}`);
  note.value = `${(pct * 100).toFixed(1)}% of rows were duplicates.`;
  note.font = { name: FONT, size: 11, italic: true, color: { argb: COLOR.muted } };

  const footer = ws.getCell(`B${statsTop + stats.length + 4}`);
  footer.value = "Generated with Duplicate Identifier · Built by Vikram · Your data never left your browser.";
  footer.font = { name: FONT, size: 9, color: { argb: COLOR.muted } };
  return ws;
}

/** Map each removed row to the row that was kept in its place. */
function keptInstead(ctx: ExportContext): Map<number, number> {
  const map = new Map<number, number>();
  for (const g of ctx.groups) {
    const d = ctx.decisions[g.id];
    if (d?.ignored) continue;
    const keeper = d?.keeper ?? g.keeper;
    for (const r of g.rows) if (r !== keeper) map.set(r, keeper);
  }
  return map;
}

export async function downloadCleanWorkbook(ctx: ExportContext) {
  const wb = await newWorkbook();
  const { dataset, removed } = ctx;
  const kept = dataset.rows.filter((_, i) => !removed.has(i));
  addTableSheet(wb, "Clean Data", dataset.headers, kept, COLOR.brand);
  addSummarySheet(wb, ctx, "Cleaning summary");

  if (removed.size > 0) {
    const replacedBy = keptInstead(ctx);
    const removedRows = [...removed]
      .sort((a, b) => a - b)
      .map((r) => [r + 2, (replacedBy.get(r) ?? r) + 2, ...dataset.rows[r]] as Cell[]);
    const ws = addTableSheet(
      wb,
      "Removed Rows",
      ["Original row", "Duplicate of row", ...dataset.headers],
      removedRows,
      COLOR.rose,
    );
    for (const c of [1, 2]) ws.getColumn(c).alignment = { horizontal: "center" };
  }
  await save(wb, `${baseName(dataset.fileName)}_clean.xlsx`);
}

export async function downloadReportWorkbook(ctx: ExportContext) {
  const wb = await newWorkbook();
  const { dataset, groups, decisions } = ctx;
  const headers = ["Group", "Action", "Original row", ...dataset.headers];
  const ws = wb.addWorksheet("Duplicates", {
    views: [{ state: "frozen", ySplit: 1, xSplit: 3, showGridLines: false }],
    properties: { tabColor: { argb: COLOR.brand } },
  });

  const rows: Cell[][] = [];
  const meta: { action: string; groupIndex: number; firstOfGroup: boolean }[] = [];
  groups.forEach((g, gi) => {
    const d = decisions[g.id];
    const keeper = d?.keeper ?? g.keeper;
    g.rows.forEach((r, k) => {
      const action = d?.ignored ? "Not duplicate" : r === keeper ? "Keep" : "Remove";
      rows.push([g.id + 1, action, r + 2, ...dataset.rows[r]]);
      meta.push({ action, groupIndex: gi, firstOfGroup: k === 0 });
    });
  });

  const widths = columnWidths(headers, rows);
  ws.columns = headers.map((h, i) => ({ header: h, width: i < 3 ? Math.max(widths[i], 14) : widths[i] }));
  ws.addRows(rows);
  styleHeaderRow(ws, headers.length, COLOR.brand);
  ws.autoFilter = { from: "A1", to: `${ws.getColumn(headers.length).letter}1` };
  headers.forEach((_, c) => {
    if (rows.some((r) => r[c] instanceof Date)) ws.getColumn(c + 1).numFmt = "dd mmm yyyy";
  });

  const actionStyle: Record<string, { fill: string; font: string }> = {
    Keep: { fill: COLOR.greenSoft, font: COLOR.greenText },
    Remove: { fill: COLOR.roseSoft, font: COLOR.roseText },
    "Not duplicate": { fill: COLOR.graySoft, font: COLOR.grayText },
  };

  meta.forEach((m, i) => {
    const row = ws.getRow(i + 2);
    const shade = m.groupIndex % 2 === 1;
    for (let c = 1; c <= headers.length; c++) {
      const cell = row.getCell(c);
      if (shade) cell.fill = solid(COLOR.groupBand);
      if (m.firstOfGroup && i > 0) cell.border = { top: thin(COLOR.border) } as Partial<Borders>;
      if (m.action === "Remove" && c > 3) cell.font = { name: FONT, color: { argb: COLOR.muted } };
    }
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(1).font = { name: FONT, bold: true, color: { argb: COLOR.brand } };
    row.getCell(3).alignment = { horizontal: "center" };
    const style = actionStyle[m.action];
    const actionCell = row.getCell(2);
    actionCell.fill = solid(style.fill);
    actionCell.font = { name: FONT, bold: true, color: { argb: style.font } };
    actionCell.alignment = { horizontal: "center" };
  });

  addSummarySheet(wb, ctx, "Duplicates report");
  await save(wb, `${baseName(dataset.fileName)}_duplicates_report.xlsx`);
}

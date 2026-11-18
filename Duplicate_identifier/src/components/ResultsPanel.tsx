"use client";

import { useMemo, useState } from "react";
import DataTable from "./DataTable";
import { rowsToRemove } from "@/lib/dedupe";
import { downloadCleanCsv } from "@/lib/files";
import type { Dataset, DedupeConfig, DedupeResult, GroupDecision } from "@/lib/types";

interface Props {
  dataset: Dataset;
  config: DedupeConfig;
  result: DedupeResult;
}

const PAGE_SIZE = 10;

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`text-2xl font-semibold tabular-nums ${tone ?? ""}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

export default function ResultsPanel({ dataset, config, result }: Props) {
  const [decisions, setDecisions] = useState<Record<number, GroupDecision>>({});
  const [page, setPage] = useState(0);

  const removed = useMemo(() => rowsToRemove(result.groups, decisions), [result, decisions]);
  const highlight = useMemo(() => new Set(config.rules.map((r) => r.index)), [config]);
  const pageCount = Math.max(1, Math.ceil(result.groups.length / PAGE_SIZE));
  const visible = result.groups.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const [busy, setBusy] = useState<"clean" | "report" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // The styled Excel exporter is loaded only when needed, to keep the page fast.
  const exportExcel = async (kind: "clean" | "report") => {
    setBusy(kind);
    setExportError(null);
    try {
      const excel = await import("@/lib/excel");
      const ctx = { dataset, config, groups: result.groups, decisions, removed };
      if (kind === "clean") await excel.downloadCleanWorkbook(ctx);
      else await excel.downloadReportWorkbook(ctx);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Could not create the Excel file.");
    } finally {
      setBusy(null);
    }
  };

  const decide = (id: number, patch: GroupDecision) =>
    setDecisions((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const buttonClass =
    "rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total rows" value={dataset.rows.length} />
        <Stat label="Duplicate groups" value={result.groups.length} />
        <Stat label="Rows to remove" value={removed.size} tone="text-rose-600" />
        <Stat
          label="Rows after cleaning"
          value={dataset.rows.length - removed.size}
          tone="text-emerald-600"
        />
      </div>
      <p className="text-sm text-zinc-500">
        Compared {result.comparedRows.toLocaleString()} rows in{" "}
        {result.durationMs < 1000
          ? `${Math.max(1, result.durationMs)} ms`
          : `${(result.durationMs / 1000).toFixed(1)} s`}
        .
        {result.skippedRows > 0 &&
          ` Skipped ${result.skippedRows.toLocaleString()} rows with blank values.`}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportExcel("clean")}
          disabled={busy !== null}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy === "clean" ? "Preparing Excel…" : "Download clean Excel"}
        </button>
        <button
          type="button"
          onClick={() => downloadCleanCsv(dataset, removed)}
          className={buttonClass}
        >
          Download clean CSV
        </button>
        <button
          type="button"
          onClick={() => exportExcel("report")}
          disabled={result.groups.length === 0 || busy !== null}
          className={`${buttonClass} disabled:opacity-50`}
        >
          {busy === "report" ? "Preparing report…" : "Download duplicates report"}
        </button>
      </div>
      <p className="-mt-3 text-xs text-zinc-500">
        The Excel file includes a formatted clean sheet, a summary, and the removed rows.
      </p>
      {exportError && (
        <p role="alert" className="text-sm text-rose-600">
          {exportError}
        </p>
      )}

      {result.groups.length === 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          No duplicates found with these settings.
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold">Review duplicate groups</h3>
          <p className="text-sm text-zinc-500">
            Pick the row to keep in each group. Mark a group as &quot;Not duplicates&quot; to keep
            every row.
          </p>
          {visible.map((g) => {
            const d = decisions[g.id];
            const keeper = d?.keeper ?? g.keeper;
            return (
              <div
                key={g.id}
                className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ${
                  d?.ignored
                    ? "border-zinc-200 opacity-60 dark:border-zinc-800"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Group {g.id + 1} · {g.rows.length} rows
                  </span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-indigo-600"
                      checked={!!d?.ignored}
                      onChange={(e) => decide(g.id, { ignored: e.target.checked })}
                    />
                    Not duplicates
                  </label>
                </div>
                <DataTable
                  headers={dataset.headers}
                  highlight={highlight}
                  rows={g.rows.map((r) => ({ index: r, cells: dataset.rows[r] }))}
                  leadingLabel="Keep"
                  leading={(r) => (
                    <input
                      type="radio"
                      aria-label={`Keep row ${r + 2}`}
                      name={`group-${g.id}`}
                      className="h-4 w-4 accent-emerald-600"
                      checked={keeper === r}
                      disabled={!!d?.ignored}
                      onChange={() => decide(g.id, { keeper: r })}
                    />
                  )}
                  rowClass={(r) =>
                    d?.ignored
                      ? ""
                      : r === keeper
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "text-zinc-400 line-through decoration-rose-400/60"
                  }
                />
              </div>
            );
          })}

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                className={buttonClass}
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="tabular-nums">
                Page {page + 1} of {pageCount}
              </span>
              <button
                type="button"
                className={buttonClass}
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

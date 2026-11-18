"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkBook } from "xlsx";
import FileDrop from "@/components/FileDrop";
import DataTable from "@/components/DataTable";
import ConfigPanel from "@/components/ConfigPanel";
import ResultsPanel from "@/components/ResultsPanel";
import { readWorkbook, sheetToDataset } from "@/lib/files";
import { findDuplicates } from "@/lib/dedupe";
import { guessKind } from "@/lib/normalize";
import type { Dataset, DedupeConfig, DedupeResult } from "@/lib/types";
import type { WorkerResponse } from "@/lib/dedupe.worker";

const PREVIEW_ROWS = 8;
const LARGE_FILE_ROWS = 100_000;

function defaultConfig(headers: string[]): DedupeConfig {
  // Start with email columns when present, otherwise compare whole rows.
  const emailCols = headers
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => guessKind(h) === "email");
  const rules =
    emailCols.length > 0
      ? emailCols.map(({ i }) => ({ index: i, kind: "email" as const, mode: "exact" as const }))
      : headers.map((h, i) => ({ index: i, kind: guessKind(h), mode: "exact" as const }));
  return {
    rules,
    normalize: { trim: true, ignoreCase: true, collapseSpaces: true, stripPunctuation: false },
    similarity: 85,
    keep: "first",
    skipBlanks: true,
  };
}

function Card({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [workbook, setWorkbook] = useState<WorkBook | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [config, setConfig] = useState<DedupeConfig | null>(null);
  const [result, setResult] = useState<DedupeResult | null>(null);
  const [runConfig, setRunConfig] = useState<DedupeConfig | null>(null);
  const [runId, setRunId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => workerRef.current?.terminate(), []);

  const loadSheet = (wb: WorkBook, sheetName: string, fileName: string) => {
    const ds = sheetToDataset(wb, sheetName, fileName);
    setDataset(ds);
    setConfig(defaultConfig(ds.headers));
    setResult(null);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const wb = await readWorkbook(file);
      if (wb.SheetNames.length === 0) throw new Error("The file has no sheets.");
      setWorkbook(wb);
      loadSheet(wb, wb.SheetNames[0], file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this file.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = async () => {
    try {
      // Relative path so the app also works when hosted in a sub-folder.
      const res = await fetch("./sample-contacts.csv");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      await handleFile(new File([blob], "sample-contacts.csv", { type: "text/csv" }));
    } catch {
      setError("Could not load the sample file. Check your connection and try again.");
    }
  };

  const reset = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setWorkbook(null);
    setDataset(null);
    setConfig(null);
    setResult(null);
    setRunning(false);
    setError(null);
  };

  const showResults = (r: DedupeResult) => {
    setResult(r);
    setRunning(false);
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const run = () => {
    if (!dataset || !config) return;
    setError(null);
    setResult(null);
    setRunConfig(config);
    setRunId((n) => n + 1);
    setRunning(true);
    setProgress(0);

    let worker: Worker;
    try {
      workerRef.current?.terminate();
      worker = new Worker(new URL("../lib/dedupe.worker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker;
    } catch {
      // Workers unavailable: run on the main thread instead.
      showResults(findDuplicates(dataset.rows, config));
      return;
    }

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === "progress") {
        setProgress(msg.total ? msg.done / msg.total : 0);
      } else if (msg.type === "done") {
        showResults(msg.result);
        worker.terminate();
        workerRef.current = null;
      } else {
        setError(msg.message);
        setRunning(false);
      }
    };
    worker.onerror = (e) => {
      setError(e.message || "Duplicate detection failed.");
      setRunning(false);
    };
    worker.postMessage({ rows: dataset.rows, config });
  };

  const cancel = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setRunning(false);
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <svg aria-hidden viewBox="0 0 32 32" className="h-9 w-9 shrink-0">
            <rect width="32" height="32" rx="8" className="fill-indigo-600" />
            <rect x="7" y="9" width="13" height="3" rx="1.5" fill="#fff" />
            <rect x="7" y="15" width="13" height="3" rx="1.5" fill="#fff" opacity=".55" />
            <rect x="7" y="21" width="9" height="3" rx="1.5" fill="#fff" />
            <path d="M21 17.5l2.5 2.5 4-5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight">Duplicate Identifier</h1>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            100% private
          </span>
        </div>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Upload a spreadsheet, find duplicate names, emails, phone numbers or whole rows, review
          them, and download a clean file. Everything runs in your browser.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {error}
        </div>
      )}

      {!dataset ? (
        <Card step={1} title="Upload your data">
          <FileDrop onFile={handleFile} onSample={loadSample} busy={loading} />
        </Card>
      ) : (
        <>
          <Card step={1} title="Your data">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="font-medium">{dataset.fileName}</span>
              <span className="text-zinc-500">
                {dataset.rows.length.toLocaleString()} rows · {dataset.headers.length} columns
              </span>
              {dataset.sheetNames.length > 1 && workbook && (
                <label className="flex items-center gap-2">
                  Sheet
                  <select
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                    value={dataset.sheetName}
                    onChange={(e) => loadSheet(workbook, e.target.value, dataset.fileName)}
                  >
                    {dataset.sheetNames.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={reset}
                className="ml-auto text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Upload a different file
              </button>
            </div>
            {dataset.rows.length > LARGE_FILE_ROWS && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                This file is large. Exact matching will work, but fuzzy matching may be slow.
              </p>
            )}
            {dataset.rows.length === 0 ? (
              <p className="text-sm text-zinc-500">This sheet has no data rows.</p>
            ) : (
              <DataTable
                headers={dataset.headers}
                rows={dataset.rows
                  .slice(0, PREVIEW_ROWS)
                  .map((cells, index) => ({ index, cells }))}
              />
            )}
            {dataset.rows.length > PREVIEW_ROWS && (
              <p className="mt-2 text-xs text-zinc-500">
                Showing the first {PREVIEW_ROWS} rows.
              </p>
            )}
          </Card>

          {config && (
            <Card step={2} title="Choose how to match">
              <ConfigPanel
                headers={dataset.headers}
                config={config}
                onChange={setConfig}
                onRun={run}
                running={running}
              />
              {running && (
                <div className="mt-5 space-y-2" aria-live="polite">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-indigo-600 transition-[width]"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Comparing rows… {Math.round(progress * 100)}%</span>
                    <button type="button" onClick={cancel} className="hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {result && runConfig && (
            <div ref={resultsRef} className="scroll-mt-6">
              <Card step={3} title="Review and download">
                <ResultsPanel key={runId} dataset={dataset} config={runConfig} result={result} />
              </Card>
            </div>
          )}
        </>
      )}

      <footer className="space-y-1 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        <p>Files are processed locally in your browser. Nothing is uploaded to a server.</p>
        <p>
          Built by <span className="font-medium text-zinc-700 dark:text-zinc-300">Vikram</span>
        </p>
      </footer>
    </main>
  );
}

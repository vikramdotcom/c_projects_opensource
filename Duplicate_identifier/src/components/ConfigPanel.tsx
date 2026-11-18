"use client";

import type { ColumnKind, ColumnRule, DedupeConfig, KeepStrategy, MatchMode } from "@/lib/types";
import { guessKind } from "@/lib/normalize";

interface Props {
  headers: string[];
  config: DedupeConfig;
  onChange: (config: DedupeConfig) => void;
  onRun: () => void;
  running: boolean;
}

const selectClass =
  "rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default function ConfigPanel({ headers, config, onChange, onRun, running }: Props) {
  const ruleFor = (i: number) => config.rules.find((r) => r.index === i);
  const hasFuzzy = config.rules.some((r) => r.mode === "fuzzy");

  const setRules = (rules: ColumnRule[]) =>
    onChange({ ...config, rules: rules.sort((a, b) => a.index - b.index) });

  const toggle = (i: number) => {
    if (ruleFor(i)) setRules(config.rules.filter((r) => r.index !== i));
    else setRules([...config.rules, { index: i, kind: guessKind(headers[i]), mode: "exact" }]);
  };

  const update = (i: number, patch: Partial<ColumnRule>) =>
    setRules(config.rules.map((r) => (r.index === i ? { ...r, ...patch } : r)));

  const selectAll = () =>
    setRules(headers.map((h, i) => ({ index: i, kind: guessKind(h), mode: "exact" as MatchMode })));

  const setNormalize = (key: keyof DedupeConfig["normalize"], value: boolean) =>
    onChange({ ...config, normalize: { ...config.normalize, [key]: value } });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Which columns decide a duplicate?</h3>
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              onClick={selectAll}
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Whole row
            </button>
            <button
              type="button"
              onClick={() => setRules([])}
              className="text-zinc-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mb-3 text-sm text-zinc-500">
          Rows are duplicates when <strong>all</strong> selected columns match. Use
          &quot;Fuzzy&quot; for names with typos.
        </p>
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {headers.map((h, i) => {
            const rule = ruleFor(i);
            return (
              <li key={i} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!rule}
                    onChange={() => toggle(i)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="truncate">{h}</span>
                </label>
                {rule && (
                  <div className="flex gap-2">
                    <select
                      aria-label={`Value type for ${h}`}
                      className={selectClass}
                      value={rule.kind}
                      onChange={(e) => update(i, { kind: e.target.value as ColumnKind })}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                    <select
                      aria-label={`Match mode for ${h}`}
                      className={selectClass}
                      value={rule.mode}
                      onChange={(e) => update(i, { mode: e.target.value as MatchMode })}
                    >
                      <option value="exact">Exact</option>
                      <option value="fuzzy">Fuzzy</option>
                    </select>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="space-y-5">
        <div>
          <h3 className="mb-2 font-semibold">Clean values before comparing</h3>
          {(
            [
              ["trim", "Trim spaces at start and end"],
              ["collapseSpaces", "Treat multiple spaces as one"],
              ["ignoreCase", "Ignore upper/lower case"],
              ["stripPunctuation", "Ignore punctuation"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 py-1 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-indigo-600"
                checked={config.normalize[key]}
                onChange={(e) => setNormalize(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
          <label className="flex items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-indigo-600"
              checked={config.skipBlanks}
              onChange={(e) => onChange({ ...config, skipBlanks: e.target.checked })}
            />
            Skip rows with a blank compared value
          </label>
          <p className="mt-1 text-xs text-zinc-500">
            Email columns are always trimmed and lowercased. Phone columns compare the last 10
            digits.
          </p>
        </div>

        {hasFuzzy && (
          <div>
            <label htmlFor="similarity" className="mb-1 flex justify-between font-semibold">
              <span>Fuzzy similarity</span>
              <span className="tabular-nums text-indigo-600 dark:text-indigo-400">
                {config.similarity}%
              </span>
            </label>
            <input
              id="similarity"
              type="range"
              min={60}
              max={100}
              value={config.similarity}
              onChange={(e) => onChange({ ...config, similarity: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <p className="text-xs text-zinc-500">
              Lower finds more matches but also more false ones. 85% is a good start.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="keep" className="mb-1 block font-semibold">
            Which row to keep
          </label>
          <select
            id="keep"
            className={`${selectClass} w-full`}
            value={config.keep}
            onChange={(e) => onChange({ ...config, keep: e.target.value as KeepStrategy })}
          >
            <option value="first">First occurrence</option>
            <option value="last">Last occurrence</option>
            <option value="mostComplete">Most complete row</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={running || config.rules.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "Finding duplicates…" : "Find duplicates"}
        </button>
        {config.rules.length === 0 && (
          <p className="text-center text-xs text-zinc-500">Select at least one column.</p>
        )}
      </aside>
    </div>
  );
}

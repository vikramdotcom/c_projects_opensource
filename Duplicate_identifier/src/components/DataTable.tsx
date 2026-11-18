import { cellToString } from "@/lib/normalize";
import type { Cell } from "@/lib/types";

interface Props {
  headers: string[];
  rows: { index: number; cells: Cell[] }[];
  highlight?: Set<number>;
  /** Optional first column, for example a "Keep" radio button. */
  leading?: (rowIndex: number) => React.ReactNode;
  leadingLabel?: string;
  rowClass?: (rowIndex: number) => string;
}

/** Simple scrollable table. Row numbers match the spreadsheet (header is row 1). */
export default function DataTable({
  headers,
  rows,
  highlight,
  leading,
  leadingLabel,
  rowClass,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
          <tr>
            {leading && <th className="px-3 py-2 font-medium">{leadingLabel}</th>}
            <th className="px-3 py-2 font-medium">Row</th>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`whitespace-nowrap px-3 py-2 font-medium ${
                  highlight?.has(i) ? "text-indigo-600 dark:text-indigo-400" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map(({ index, cells }) => (
            <tr key={index} className={rowClass?.(index) ?? ""}>
              {leading && <td className="px-3 py-2">{leading(index)}</td>}
              <td className="px-3 py-2 tabular-nums text-zinc-400">{index + 2}</td>
              {headers.map((_, c) => (
                <td
                  key={c}
                  className={`max-w-xs truncate whitespace-nowrap px-3 py-2 ${
                    highlight?.has(c) ? "font-medium" : ""
                  }`}
                  title={cellToString(cells[c])}
                >
                  {cellToString(cells[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

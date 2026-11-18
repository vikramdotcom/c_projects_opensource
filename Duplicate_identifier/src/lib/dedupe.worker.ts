import { findDuplicates } from "./dedupe.ts";
import type { Cell, DedupeConfig, DedupeResult } from "./types.ts";

export type WorkerRequest = { rows: Cell[][]; config: DedupeConfig };
export type WorkerResponse =
  | { type: "progress"; done: number; total: number }
  | { type: "done"; result: DedupeResult }
  | { type: "error"; message: string };

const send = (msg: WorkerResponse) => self.postMessage(msg);

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { rows, config } = event.data;
  try {
    const result = findDuplicates(rows, config, (done, total) =>
      send({ type: "progress", done, total }),
    );
    send({ type: "done", result });
  } catch (err) {
    send({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};

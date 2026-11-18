"use client";

import { useRef, useState } from "react";
import { ACCEPTED_EXTENSIONS } from "@/lib/files";

interface Props {
  onFile: (file: File) => void;
  onSample: () => void;
  busy: boolean;
}

export default function FileDrop({ onFile, onSample, busy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a data file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          dragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
            : "border-zinc-300 bg-white hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900"
        }`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="mb-3 h-10 w-10 text-indigo-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          />
        </svg>
        <p className="text-base font-medium">
          {busy ? "Reading file…" : "Drop a file here or click to browse"}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Excel, CSV, TSV, ODS or JSON. Your file never leaves this browser.
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-center text-sm text-zinc-500">
        No file handy?{" "}
        <button
          type="button"
          onClick={onSample}
          className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
        >
          Try the sample contacts file
        </button>
      </p>
    </div>
  );
}

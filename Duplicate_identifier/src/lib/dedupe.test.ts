import { test } from "node:test";
import assert from "node:assert/strict";
import { findDuplicates, rowsToRemove } from "./dedupe.ts";
import { normalizeValue } from "./normalize.ts";
import { similarity } from "./similarity.ts";
import type { Cell, DedupeConfig } from "./types.ts";

const normalize = { trim: true, ignoreCase: true, collapseSpaces: true, stripPunctuation: false };

const base: DedupeConfig = {
  rules: [],
  normalize,
  similarity: 85,
  keep: "first",
  skipBlanks: true,
};

const rows: Cell[][] = [
  ["John Smith", "john@gmail.com", "+91 98765 43210"],
  ["Jon Smith", " JOHN@Gmail.com ", "09876543210"],
  ["Priya Sharma", "priya@yahoo.com", "9123456780"],
  ["Smith John", "other@mail.com", "1111111111"],
  ["Priya  Sharma", "priya.s@yahoo.com", null],
  ["Ann", "ann@x.com", "2222222222"],
  ["Joanna", "joanna@x.com", "3333333333"],
];

test("normalizes emails and phone numbers", () => {
  assert.equal(normalizeValue(" JOHN@Gmail.com ", "email", normalize), "john@gmail.com");
  assert.equal(normalizeValue("+91 98765 43210", "phone", normalize), "9876543210");
  assert.equal(normalizeValue("09876543210", "phone", normalize), "9876543210");
});

test("similarity ignores word order", () => {
  assert.equal(similarity("smith john", "john smith"), 1);
  assert.ok(similarity("jon smith", "john smith") > 0.85);
  assert.ok(similarity("ann", "joanna") < 0.85);
});

test("exact match on email", () => {
  const res = findDuplicates(rows, { ...base, rules: [{ index: 1, kind: "email", mode: "exact" }] });
  assert.deepEqual(res.groups.map((g) => g.rows), [[0, 1]]);
});

test("exact match on phone", () => {
  const res = findDuplicates(rows, { ...base, rules: [{ index: 2, kind: "phone", mode: "exact" }] });
  assert.deepEqual(res.groups.map((g) => g.rows), [[0, 1]]);
  assert.equal(res.skippedRows, 1);
});

test("fuzzy match on name finds typos and extra spaces, not substrings", () => {
  const res = findDuplicates(rows, { ...base, rules: [{ index: 0, kind: "text", mode: "fuzzy" }] });
  // "Smith John" matches because word order is ignored. "Ann" and "Joanna" stay apart.
  assert.deepEqual(res.groups.map((g) => g.rows), [[0, 1, 3], [2, 4]]);
});

test("exact and fuzzy columns combine", () => {
  const data: Cell[][] = [
    ["Delhi", "Rahul Verma"],
    ["Delhi", "Rahul Varma"],
    ["Pune", "Rahul Verma"],
  ];
  const res = findDuplicates(data, {
    ...base,
    rules: [
      { index: 0, kind: "text", mode: "exact" },
      { index: 1, kind: "text", mode: "fuzzy" },
    ],
  });
  assert.deepEqual(res.groups.map((g) => g.rows), [[0, 1]]);
});

test("whole-row exact match", () => {
  const data: Cell[][] = [
    ["a", 1],
    ["b", 2],
    ["a", 1],
    ["A ", 1],
  ];
  const res = findDuplicates(data, {
    ...base,
    rules: [
      { index: 0, kind: "text", mode: "exact" },
      { index: 1, kind: "text", mode: "exact" },
    ],
  });
  assert.deepEqual(res.groups.map((g) => g.rows), [[0, 2, 3]]);
});

test("keep strategies and decisions", () => {
  const data: Cell[][] = [
    ["x@a.com", null],
    ["x@a.com", "filled"],
    ["x@a.com", null],
  ];
  const rule = [{ index: 0, kind: "email" as const, mode: "exact" as const }];
  assert.equal(findDuplicates(data, { ...base, rules: rule, keep: "last" }).groups[0].keeper, 2);
  const res = findDuplicates(data, { ...base, rules: rule, keep: "mostComplete" });
  assert.equal(res.groups[0].keeper, 1);
  assert.deepEqual([...rowsToRemove(res.groups, {})].sort(), [0, 2]);
  assert.deepEqual([...rowsToRemove(res.groups, { 0: { keeper: 0 } })].sort(), [1, 2]);
  assert.equal(rowsToRemove(res.groups, { 0: { ignored: true } }).size, 0);
});

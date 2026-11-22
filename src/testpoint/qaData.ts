import path from "path";
import type { Page } from "@playwright/test";
import { reportRunDir } from "../configuration/reportRun";

/** Every item an E2E test creates starts with this, so cleanup can find leftovers. */
export const QA_PREFIX = "QA-E2E";

/** Short id of this execution (from the report folder name), the same in every worker. */
export function runId(): string {
  return path.basename(reportRunDir()).replace(/\D/g, "").slice(-8);
}

/** Unique name for test data: "QA-E2E <label> <run id>". */
export function qaName(label: string): string {
  return `${QA_PREFIX} ${label} ${runId()}`;
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Values one TestPoint saves for a later one in the same test (e.g. a count before an action). */
const memory = new WeakMap<Page, Map<string, unknown>>();

export function remember(page: Page, key: string, value: unknown): void {
  if (!memory.has(page)) memory.set(page, new Map());
  memory.get(page)!.set(key, value);
}

export function recall<T>(page: Page, key: string): T {
  const value = memory.get(page)?.get(key);
  if (value === undefined) throw new Error(`Nothing remembered under "${key}"; an earlier TestPoint must save it`);
  return value as T;
}

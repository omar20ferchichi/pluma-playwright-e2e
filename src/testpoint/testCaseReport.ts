import fs from "fs";
import path from "path";
import type { TestInfo } from "@playwright/test";
import { reportPath } from "../configuration/reportRun";
import { testCaseFileBase } from "../configuration/logger";
import { TestPoint, TestPointPhase, TestPointResult } from "./TestPoint";

/** reports/<run>/testcases/<spec>__<test title>.json — one file per test case. */
export type TestCaseReport = {
  testCase: string;
  scenarioId?: string;
  spec: string;
  project: string;
  retry: number;
  result: "passed" | "failed" | "running";
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  totals: { testpoints: number; passed: number; failed: number; notRun: number };
  testpoints: TestPointResult[];
};

const reports = new Map<string, TestCaseReport>();

/** Same base name as the test's log file (logs/<base>.log), so the two pair up. */
function fileFor(info: TestInfo): string {
  return reportPath("testcases", `${testCaseFileBase(info.file, info.title, info.retry)}.json`);
}

/**
 * Add the TestPoints of one runTestPoints() call to the current test case's JSON report and write it.
 * A test that calls runTestPoints() several times gets all its TestPoints in one file, numbered in order.
 */
export function recordTestPoints(info: TestInfo, points: TestPoint[], phase: TestPointPhase = "test"): TestCaseReport {
  const key = `${info.testId}#${info.retry}`;
  let report = reports.get(key);
  if (!report) {
    report = {
      testCase: info.title,
      scenarioId: /^([A-Z][A-Z0-9]*-\d+[A-Z]?)\b/.exec(info.title)?.[1],
      spec: path.relative(process.cwd(), info.file),
      project: info.project.name,
      retry: info.retry,
      result: "running",
      startedAt: new Date().toISOString(),
      totals: { testpoints: 0, passed: 0, failed: 0, notRun: 0 },
      testpoints: [],
    };
    reports.set(key, report);
  }

  const offset = report.testpoints.length;
  report.testpoints.push(...points.map((point, i) => point.result(offset + i + 1, phase)));

  const all = report.testpoints;
  report.totals = {
    testpoints: all.length,
    passed: all.filter((p) => p.execution === "passed").length,
    failed: all.filter((p) => p.execution === "failed").length,
    notRun: all.filter((p) => p.execution === "not-run").length,
  };
  report.result = report.totals.failed > 0 ? "failed" : "passed";
  const firstStart = all.find((p) => p.startedAt)?.startedAt;
  if (firstStart && firstStart < report.startedAt) report.startedAt = firstStart;
  report.finishedAt = new Date().toISOString();
  report.durationMs = new Date(report.finishedAt).getTime() - new Date(report.startedAt).getTime();

  const file = fileFor(info);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  return report;
}

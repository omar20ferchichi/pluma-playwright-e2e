import fs from "fs";
import type { Page } from "@playwright/test";
import { expect, test } from "../../src/fixtures/auth";
import { reportPath } from "../../src/configuration/reportRun";
import { testCaseFileBase } from "../../src/configuration/logger";
import { TestPoint } from "../../src/testpoint/TestPoint";
import { actionId } from "../../src/testpoint/pageTestPoints";
import { runTestPoints } from "../runTestPoints";

// No browser needed: TestPoints only receive the page object.
const fakePage = {} as Page;

test.describe("TestPoint (no login)", () => {
  test("a passing TestPoint is marked passed", async () => {
    const point = new TestPoint("TP-T-1", "passes", async () => undefined);
    expect(point.execution).toBe("not-run");
    await point.run(fakePage);
    expect(point.execution).toBe("passed");
  });

  test("a failing TestPoint is marked failed and re-throws", async () => {
    const point = new TestPoint("TP-T-2", "fails", async () => {
      throw new Error("boom");
    });
    await expect(point.run(fakePage)).rejects.toThrow("boom");
    expect(point.execution).toBe("failed");
  });

  test("runTestPoints runs in order and stops at the first failure", async () => {
    const order: string[] = [];
    const step = (id: string, fail = false) =>
      new TestPoint(id, id, async () => {
        order.push(id);
        if (fail) throw new Error(id);
      });
    const points = [step("a"), step("b", true), step("c")];
    await expect(runTestPoints(fakePage, points)).rejects.toThrow("b");
    expect(order).toEqual(["a", "b"]);
    expect(points.map((p) => p.execution)).toEqual(["passed", "failed", "not-run"]);
  });

  test("a test case JSON report records every TestPoint, including the ones not run", async ({}, testInfo) => {
    const points = [
      new TestPoint("TP-R-1", "ok", async () => undefined),
      new TestPoint("TP-R-2", "breaks", async () => {
        throw new Error("expected failure");
      }),
      new TestPoint("TP-R-3", "skipped by the failure", async () => undefined),
    ];
    await expect(runTestPoints(fakePage, points)).rejects.toThrow("expected failure");

    const attachment = testInfo.attachments.find((a) => a.name === "testcase-report");
    expect(attachment, "report is attached to the test").toBeTruthy();
    const report = JSON.parse(String(attachment!.body));
    expect(report.result).toBe("failed");
    expect(report.totals).toEqual({ testpoints: 3, passed: 1, failed: 1, notRun: 1 });
    expect(report.testpoints.map((p: { id: string; execution: string }) => [p.id, p.execution])).toEqual([
      ["TP-R-1", "passed"],
      ["TP-R-2", "failed"],
      ["TP-R-3", "not-run"],
    ]);
    expect(report.testpoints[1].error).toContain("expected failure");
    expect(typeof report.testpoints[0].durationMs).toBe("number");

    const files = fs.readdirSync(reportPath("testcases"));
    expect(files.some((f) => f.startsWith("testpoint__a_test_case_JSON_report"))).toBe(true);
  });

  test("teardown TestPoints run after a failure and are marked as teardown in the report", async ({}, testInfo) => {
    const cleaned: string[] = [];
    await expect(
      runTestPoints(
        fakePage,
        [
          new TestPoint("TP-M-1", "main fails", async () => {
            throw new Error("main failure");
          }),
          new TestPoint("TP-M-2", "never runs", async () => undefined),
        ],
        { teardown: [new TestPoint("TP-TD-1", "cleanup", async () => void cleaned.push("done"))] },
      ),
    ).rejects.toThrow("main failure");
    expect(cleaned).toEqual(["done"]);

    const last = testInfo.attachments.filter((a) => a.name === "testcase-report").pop();
    const report = JSON.parse(String(last!.body));
    expect(report.testpoints.map((p: { id: string; phase: string; execution: string }) => [p.id, p.phase, p.execution])).toEqual([
      ["TP-M-1", "test", "failed"],
      ["TP-M-2", "test", "not-run"],
      ["TP-TD-1", "teardown", "passed"],
    ]);
  });

  test("a teardown failure fails a test whose main steps passed", async () => {
    await expect(
      runTestPoints(fakePage, [new TestPoint("TP-M-3", "ok", async () => undefined)], {
        teardown: [
          new TestPoint("TP-TD-2", "cleanup breaks", async () => {
            throw new Error("cleanup failure");
          }),
        ],
      }),
    ).rejects.toThrow("cleanup failure");
  });

  test("every test case gets its own log file, named like its JSON report", async ({}, testInfo) => {
    const base = testCaseFileBase(testInfo.file, testInfo.title, testInfo.retry);
    const log = reportPath("logs", `${base}.log`);
    expect(fs.existsSync(log), `${log} exists`).toBe(true);
    await new TestPoint("TP-LOG-1", "writes into this test's log", async () => undefined).run(fakePage);
    expect(fs.readFileSync(log, "utf8")).toContain("Running TestPoint TP-LOG-1");
    expect(fs.readFileSync(log, "utf8")).toContain(`Test case "TestPoint (no login) › ${testInfo.title}"`);
  });

  test("action IDs are zero-padded", () => {
    expect(actionId("CALENDAR", 3)).toBe("TP-ACT-CALENDAR-03");
  });
});

import fs from "fs";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { reportPath } from "./reportRun";

type Row = { title: string; file: string; status: string; durationMs: number; error?: string };

/**
 * Writes reports/<run>/summary.json and summary.md next to the HTML report.
 * Both files are rewritten after every test (status "running"), so a run that is
 * stopped or crashes still leaves a report of the tests that finished.
 * Playwright's own results.json is only written when the run ends.
 */
export default class PlumaReporter implements Reporter {
  private rows: Row[] = [];

  onBegin(): void {
    this.write("running");
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.rows.push({
      title: test.titlePath().slice(1).join(" › "),
      file: test.location.file.replace(process.cwd() + "/", ""),
      status: result.status,
      durationMs: result.duration,
      error: result.error?.message?.split("\n")[0],
    });
    this.write("running");
  }

  onEnd(result: FullResult): void {
    this.write(result.status);
  }

  private write(status: string): void {
    const count = (s: string) => this.rows.filter((row) => row.status === s).length;
    const summary = {
      status,
      updatedAt: new Date().toISOString(),
      total: this.rows.length,
      passed: count("passed"),
      failed: count("failed") + count("timedOut"),
      skipped: count("skipped"),
      tests: this.rows,
    };
    fs.writeFileSync(reportPath("summary.json"), JSON.stringify(summary, null, 2));

    const lines = [
      `# Pluma test run: ${status}`,
      "",
      `Total ${summary.total} · passed ${summary.passed} · failed ${summary.failed} · skipped ${summary.skipped}`,
      "",
      "| Status | Test | Duration | Error |",
      "|---|---|---|---|",
      ...this.rows.map(
        (row) =>
          `| ${row.status} | ${row.title} | ${(row.durationMs / 1000).toFixed(1)}s | ${(row.error ?? "").replace(/\|/g, "\\|")} |`,
      ),
    ];
    fs.writeFileSync(reportPath("summary.md"), lines.join("\n") + "\n");
  }
}

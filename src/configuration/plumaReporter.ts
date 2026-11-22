import fs from "fs";
import path from "path";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { reportPath, reportRunDir } from "./reportRun";
import { testCaseFileBase } from "./logger";

type Recordings = { video?: string; trace?: string; screenshot?: string; viewTrace?: string };
type Row = { title: string; file: string; status: string; durationMs: number; error?: string; recordings?: Recordings };

/** Video, trace and screenshot paths of one test, relative to the report folder. */
function recordingsOf(result: TestResult): Recordings | undefined {
  const find = (name: string, type?: RegExp) =>
    result.attachments.find((a) => a.name === name && a.path && (!type || type.test(a.contentType)))?.path;
  const rel = (file?: string) => (file ? path.relative(reportRunDir(), file) : undefined);
  const recordings: Recordings = {
    video: rel(find("video")),
    trace: rel(find("trace")),
    screenshot: rel(find("screenshot", /^image\//)),
  };
  if (recordings.trace) recordings.viewTrace = `npx playwright show-trace ${path.relative(process.cwd(), find("trace")!)}`;
  return Object.values(recordings).some(Boolean) ? recordings : undefined;
}

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
    const recordings = recordingsOf(result);
    if (recordings) this.addToTestCaseReport(test, result, recordings);
    this.rows.push({
      title: test.titlePath().slice(1).join(" › "),
      file: test.location.file.replace(process.cwd() + "/", ""),
      status: result.status,
      durationMs: result.duration,
      error: result.error?.message?.split("\n")[0],
      recordings,
    });
    this.write("running");
  }

  onEnd(result: FullResult): void {
    this.write(result.status);
  }

  /** Add the recordings to testcases/<test>.json (written by the test itself, before its video is saved). */
  private addToTestCaseReport(test: TestCase, result: TestResult, recordings: Recordings): void {
    const file = reportPath("testcases", `${testCaseFileBase(test.location.file, test.title, result.retry)}.json`);
    if (!fs.existsSync(file)) return;
    try {
      const report = JSON.parse(fs.readFileSync(file, "utf8"));
      fs.writeFileSync(file, JSON.stringify({ ...report, recordings }, null, 2));
    } catch {
      // A broken JSON report is reported by the test itself; don't fail the run here.
    }
  }

  private write(status: string): void {
    const link = (file?: string) => (file ? `[trace](${encodeURI(file)})` : "");
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
      "| Status | Test | Duration | Trace | Error |",
      "|---|---|---|---|---|",
      ...this.rows.map(
        (row) =>
          `| ${row.status} | ${row.title} | ${(row.durationMs / 1000).toFixed(1)}s | ${link(row.recordings?.trace)} | ${(row.error ?? "").replace(/\|/g, "\\|")} |`,
      ),
    ];
    fs.writeFileSync(reportPath("summary.md"), lines.join("\n") + "\n");
  }
}

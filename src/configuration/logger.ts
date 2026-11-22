import fs from "fs";
import path from "path";
import { reportPath } from "./reportRun";

let currentLogFile: string | undefined;

function write(level: string, message: string): void {
  const line = `${new Date().toISOString()} [${level}] ${message}`;
  if (level === "ERROR") console.error(line);
  else if (process.env.PLUMA_VERBOSE) console.log(line);
  if (currentLogFile) fs.appendFileSync(currentLogFile, `${line}\n`);
}

/** File name shared by a test's .log and its testcases/*.json: "<spec>__<title>[__retryN]". */
export function testCaseFileBase(specFile: string, title: string, retry = 0): string {
  const spec = path.basename(specFile).replace(/\.spec\.ts$/, "").replace(/\.ts$/, "");
  return `${spec}__${title}${retry ? `__retry${retry}` : ""}`.replace(/[^\w.-]+/g, "_").slice(0, 150);
}

/** Start the log file of one test case: reports/<run>/logs/<spec>__<title>.log */
export function startTestLog(fileBase: string, header: string): string {
  currentLogFile = reportPath("logs", `${fileBase}.log`);
  fs.mkdirSync(path.dirname(currentLogFile), { recursive: true });
  fs.writeFileSync(currentLogFile, "");
  write("INFO", header);
  return currentLogFile;
}

/** Write the result line and stop logging, so nothing leaks into the next test's file. */
export function endTestLog(footer: string): void {
  write("INFO", footer);
  currentLogFile = undefined;
}

export const logger = {
  info: (message: string) => write("INFO", message),
  warn: (message: string) => write("WARN", message),
  error: (message: string) => write("ERROR", message),
};

import fs from "fs";
import path from "path";
import { config } from "./config";

const ENV_KEY = "PLUMA_REPORT_RUN_DIR";

function runStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
}

function pointLatestAt(runDir: string): void {
  const latest = path.join(config.reports.root, "latest");
  try {
    fs.rmSync(latest, { recursive: true, force: true });
    fs.symlinkSync(runDir, latest, "dir");
  } catch {
    // Symlinks can fail on some filesystems; the timestamped folder is still there.
  }
}

/**
 * One folder per execution: reports/<timestamp>/{html,artifacts,logs,results.json,summary.md}.
 * Workers reload playwright.config, so they join the folder the main process already created.
 */
export function reportRunDir(): string {
  const existing = process.env[ENV_KEY];
  if (existing) {
    fs.mkdirSync(existing, { recursive: true });
    return existing;
  }

  if (process.env.TEST_WORKER_INDEX !== undefined) {
    const latest = path.join(config.reports.root, "latest");
    if (fs.existsSync(latest)) {
      const dir = fs.realpathSync(latest);
      process.env[ENV_KEY] = dir;
      return dir;
    }
  }

  fs.mkdirSync(config.reports.root, { recursive: true });
  let runDir = path.join(config.reports.root, runStamp());
  if (fs.existsSync(runDir)) runDir = `${runDir}_${process.pid}`;
  for (const sub of ["logs", "html", "artifacts"]) {
    fs.mkdirSync(path.join(runDir, sub), { recursive: true });
  }
  process.env[ENV_KEY] = runDir;
  pointLatestAt(runDir);
  return runDir;
}

export function reportPath(...parts: string[]): string {
  return path.join(reportRunDir(), ...parts);
}

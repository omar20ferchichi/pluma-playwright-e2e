/**
 * Move a whole test execution (reports/<run>/) between machines as one file.
 *
 *   npm run execution -- list                         every execution in reports/, with its result
 *   npm run execution -- export [run] [--out file]    reports/<run>/ → exports/pluma-execution-<run>.tar.gz
 *   npm run execution -- import <file|folder> [--name n]   → reports/<n>/ (HTML report, traces, logs, JSON)
 *   npm run execution -- open [run]                    open that execution's HTML report
 *
 * [run] defaults to the latest execution. An execution folder is self-contained: the HTML report
 * embeds the traces, so an imported run opens exactly like a local one.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { config } from "../src/configuration/config";

const REPORTS = config.reports.root;
const EXPORTS = path.join(config.rootDir, "exports");

type Summary = { status: string; updatedAt: string; total: number; passed: number; failed: number; skipped: number };

function fail(message: string): never {
  console.error(`✘ ${message}`);
  process.exit(1);
}

function run(cmd: string, args: string[]): void {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) fail(`${cmd} ${args.join(" ")} failed`);
}

function isExecution(dir: string): boolean {
  return fs.existsSync(path.join(dir, "summary.json")) || fs.existsSync(path.join(dir, "html", "index.html"));
}

function readSummary(dir: string): Summary | undefined {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "summary.json"), "utf8"));
  } catch {
    return undefined;
  }
}

function executions(): string[] {
  if (!fs.existsSync(REPORTS)) return [];
  return fs
    .readdirSync(REPORTS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "latest")
    .map((e) => e.name)
    .filter((name) => isExecution(path.join(REPORTS, name)))
    .sort();
}

/** "latest", a folder name, or nothing (= latest). */
function resolveRun(name?: string): string {
  if (!name || name === "latest") {
    const latest = path.join(REPORTS, "latest");
    if (fs.existsSync(latest)) return fs.realpathSync(latest);
    const all = executions();
    if (!all.length) fail(`No execution in ${REPORTS}. Run the tests first.`);
    return path.join(REPORTS, all[all.length - 1]);
  }
  const dir = path.isAbsolute(name) ? name : path.join(REPORTS, name);
  if (!isExecution(dir)) fail(`${dir} is not an execution folder (no summary.json or html/index.html)`);
  return dir;
}

function option(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  if (i === -1) return undefined;
  const value = args[i + 1];
  args.splice(i, 2);
  if (!value) fail(`${flag} needs a value`);
  return value;
}

function size(file: string): string {
  return `${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB`;
}

function list(): void {
  const all = executions();
  if (!all.length) return console.log(`No execution in ${REPORTS}.`);
  const latest = fs.existsSync(path.join(REPORTS, "latest")) ? path.basename(fs.realpathSync(path.join(REPORTS, "latest"))) : "";
  console.log("Execution                         Result    Tests  Passed  Failed  Source");
  for (const name of all) {
    const dir = path.join(REPORTS, name);
    const s = readSummary(dir);
    const imported = fs.existsSync(path.join(dir, "imported.json")) ? "imported" : "local";
    const mark = name === latest ? " (latest)" : "";
    console.log(
      `${(name + mark).padEnd(34)}${(s?.status ?? "?").padEnd(10)}${String(s?.total ?? "?").padStart(5)}${String(s?.passed ?? "?").padStart(8)}${String(s?.failed ?? "?").padStart(8)}  ${imported}`,
    );
  }
}

function exportRun(args: string[]): void {
  const out = option(args, "--out");
  const dir = resolveRun(args[0]);
  const name = path.basename(dir);
  const file = path.resolve(out ?? path.join(EXPORTS, `pluma-execution-${name}.tar.gz`));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // Archive the folder under its own name, without the temporary login file.
  run("tar", ["-czf", file, "--exclude", `${name}/.auth`, "-C", path.dirname(dir), name]);
  const s = readSummary(dir);
  console.log(`✔ Exported ${name} (${s ? `${s.status}, ${s.passed}/${s.total} passed` : "no summary"}) → ${path.relative(process.cwd(), file)} (${size(file)})`);
  console.log("  Traces contain the test account's session token: share this file only with people you trust.");
}

function importRun(args: string[]): void {
  const wanted = option(args, "--name");
  const source = args[0] ? path.resolve(args[0]) : fail("Give the exported file (or execution folder) to import");
  if (!fs.existsSync(source)) fail(`${source} does not exist`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pluma-import-"));
  try {
    let found: string;
    if (fs.statSync(source).isDirectory()) {
      found = source;
    } else if (/\.(tar\.gz|tgz|tar)$/i.test(source)) {
      run("tar", ["-xzf", source, "-C", tmp]);
      found = findExecution(tmp) ?? fail(`${source} does not contain an execution (no summary.json or html/index.html)`);
    } else if (/\.zip$/i.test(source)) {
      run("unzip", ["-q", source, "-d", tmp]);
      found = findExecution(tmp) ?? fail(`${source} does not contain an execution (no summary.json or html/index.html)`);
    } else {
      fail("Import a .tar.gz / .tgz / .zip made by `npm run execution -- export`, or an execution folder");
    }
    if (!isExecution(found)) fail(`${found} is not an execution folder`);

    let name = wanted ?? path.basename(found);
    if (!wanted && fs.existsSync(path.join(REPORTS, name))) {
      let n = 1;
      while (fs.existsSync(path.join(REPORTS, `${name}_imported${n > 1 ? n : ""}`))) n++;
      name = `${name}_imported${n > 1 ? n : ""}`;
    }
    const target = path.join(REPORTS, name);
    if (fs.existsSync(target)) fail(`${target} already exists; pass --name to import under another name`);

    fs.mkdirSync(REPORTS, { recursive: true });
    fs.cpSync(found, target, { recursive: true });
    fs.writeFileSync(
      path.join(target, "imported.json"),
      JSON.stringify({ from: source, importedAt: new Date().toISOString() }, null, 2),
    );
    const s = readSummary(target);
    console.log(`✔ Imported ${path.basename(source)} → reports/${name}`);
    if (s) console.log(`  ${s.status}: ${s.passed} passed, ${s.failed} failed, ${s.skipped} skipped of ${s.total} (run of ${s.updatedAt})`);
    console.log(`  Open it with:  npm run execution -- open ${name}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** The execution folder inside an extracted archive (the archive root, or one folder below). */
function findExecution(root: string): string | undefined {
  if (isExecution(root)) return root;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const dir = path.join(root, entry.name);
    if (entry.isDirectory() && isExecution(dir)) return dir;
  }
  return undefined;
}

function open(args: string[]): void {
  const dir = resolveRun(args[0]);
  const html = path.join(dir, "html");
  if (!fs.existsSync(path.join(html, "index.html"))) fail(`${dir} has no HTML report`);
  console.log(`Opening ${path.basename(dir)} — each test has a "View trace" button.`);
  run("npx", ["playwright", "show-report", html]);
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case "list":
    list();
    break;
  case "export":
    exportRun(args);
    break;
  case "import":
    importRun(args);
    break;
  case "open":
    open(args);
    break;
  default:
    console.log("Usage: npm run execution -- <list | export [run] [--out file] | import <file|folder> [--name n] | open [run]>");
    process.exit(command ? 1 : 0);
}

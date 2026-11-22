import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import YAML from "yaml";

const root = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(root, ".env"), quiet: true } as dotenv.DotenvConfigOptions);

type YamlConfig = {
  app: { base_url: string; headless: boolean; slow_mo_ms: number; navigation_timeout_ms: number };
  auth: { login_path: string; home_path: string };
  reports: { root: string };
};

const yaml = YAML.parse(fs.readFileSync(path.join(__dirname, "config.yaml"), "utf8")) as YamlConfig;
const env = process.env;

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(parsed) ? parsed : fallback;
}

/** YAML holds the defaults; .env / environment variables override them. */
export const config = {
  rootDir: root,
  app: {
    baseUrl: env.PLUMA_BASE_URL || yaml.app.base_url,
    headless: bool(env.PLUMA_HEADLESS, yaml.app.headless),
    slowMoMs: num(env.PLUMA_SLOW_MO_MS, yaml.app.slow_mo_ms),
    navigationTimeoutMs: yaml.app.navigation_timeout_ms,
  },
  auth: {
    email: env.PLUMA_EMAIL ?? "",
    password: env.PLUMA_PASSWORD ?? "",
    loginPath: yaml.auth.login_path,
    homePath: yaml.auth.home_path,
  },
  reports: {
    root: path.resolve(root, yaml.reports.root),
  },
};

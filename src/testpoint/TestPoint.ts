import { Page } from "@playwright/test";
import { logger } from "../configuration/logger";

export type TestPointExecution = "not-run" | "passed" | "failed";

/** What happened when one TestPoint ran; written into the test case JSON report. */
export type TestPointPhase = "test" | "teardown";

export type TestPointResult = {
  step: number;
  /** "teardown" steps always run, even after a failure, to clean up data the test created. */
  phase: TestPointPhase;
  id: string;
  description: string;
  ticketId: string;
  status: string;
  execution: TestPointExecution;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  urlBefore?: string;
  urlAfter?: string;
  error?: string;
};

/**
 * One named, reusable test step (an action or a check).
 * Specs are ordered lists of TestPoints run by tests/runTestPoints.ts.
 */
export class TestPoint {
  execution: TestPointExecution = "not-run";
  startedAt?: Date;
  finishedAt?: Date;
  urlBefore?: string;
  urlAfter?: string;
  error?: string;

  constructor(
    public id: string,
    public description: string,
    public func: (page: Page) => Promise<void>,
    public ticketId = "*****",
    public status = "ready",
  ) {}

  async run(page: Page): Promise<this> {
    logger.info(`Running TestPoint ${this.id}: ${this.description}`);
    this.startedAt = new Date();
    this.urlBefore = currentUrl(page);
    try {
      await this.func(page);
      this.execution = "passed";
      logger.info(`TestPoint ${this.id} passed`);
    } catch (error) {
      this.execution = "failed";
      // Strip terminal colour codes that Playwright puts in assertion messages.
      this.error = (error instanceof Error ? error.message : String(error)).replace(/\u001b\[[0-9;]*m/g, "");
      logger.error(`TestPoint ${this.id} failed: ${String(error)}`);
      throw error;
    } finally {
      this.finishedAt = new Date();
      this.urlAfter = currentUrl(page);
    }
    return this;
  }

  result(step: number, phase: TestPointPhase = "test"): TestPointResult {
    return {
      step,
      phase,
      id: this.id,
      description: this.description,
      ticketId: this.ticketId,
      status: this.status,
      execution: this.execution,
      startedAt: this.startedAt?.toISOString(),
      finishedAt: this.finishedAt?.toISOString(),
      durationMs: this.startedAt && this.finishedAt ? this.finishedAt.getTime() - this.startedAt.getTime() : undefined,
      urlBefore: this.urlBefore,
      urlAfter: this.urlAfter,
      error: this.error,
    };
  }
}

/** Path + query of the page, or undefined for fake pages in unit tests. */
function currentUrl(page: Page): string | undefined {
  try {
    if (typeof page.url !== "function") return undefined;
    const url = new URL(page.url());
    return url.pathname + url.search;
  } catch {
    return undefined;
  }
}

import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class BacklinksAnalyticsPage extends BasePage {
  static readonly path = "/app/backlinks-analytics";
  static readonly key = "BACKLINKS";
  static testPoints(): TestPoint[] {
    return inspectSuite(BacklinksAnalyticsPage, [
      ["View History", (p) => p.viewHistory],
      ["Domain or URL input", (p) => p.domainInput],
      ["Analyze backlinks", (p) => p.analyze],
    ]);
  }

  readonly viewHistory: Locator;
  readonly domainInput: Locator;
  /** Spends credits — inspect only, never click. */
  readonly analyze: Locator;

  constructor(page: Page) {
    super(page, BacklinksAnalyticsPage.path);
    this.viewHistory = this.button("View History");
    this.domainInput = this.textbox("Domain or URL input");
    this.analyze = this.button("Analyze backlinks");
  }
}

export class BacklinksHistoryPage extends BasePage {
  static readonly path = "/app/backlinks-analytics/history";
  static readonly key = "BACKLINKS_HISTORY";
  static testPoints(): TestPoint[] {
    return inspectSuite(BacklinksHistoryPage, [
      ["New Analysis", (p) => p.newAnalysis],
      ["Search by target domain", (p) => p.search],
    ]);
  }

  readonly newAnalysis: Locator;
  readonly search: Locator;

  constructor(page: Page) {
    super(page, BacklinksHistoryPage.path);
    this.newAnalysis = this.button("New Analysis");
    this.search = this.placeholder("Search by target domain...");
  }
}

const K = BacklinksAnalyticsPage.key;

export class OpenBacklinksAnalyticsPage extends OpenPage {
  constructor() {
    super(BacklinksAnalyticsPage);
  }
}

export class OpenBacklinksHistoryPage extends OpenPage {
  constructor() {
    super(BacklinksHistoryPage);
  }
}

export class BacklinksFillDomain extends TestPoint {
  constructor(domain: string) {
    super(actionId(K, 1), `Type "${domain}" in the domain input (not analyzed)`, async (page) => {
      const pom = new BacklinksAnalyticsPage(page);
      await pom.domainInput.fill(domain);
      await expect(pom.domainInput).toHaveValue(domain);
    });
  }
}

export class BacklinksOpenHistory extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Click View History and land on the history page", async (page) => {
      await new BacklinksAnalyticsPage(page).viewHistory.click();
      const history = new BacklinksHistoryPage(page);
      await history.expectOnPage();
      await history.expectVisible(history.newAnalysis, "New Analysis");
    });
  }
}

import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class DashboardPage extends BasePage {
  static readonly path = "/app/dashboard";
  static readonly key = "DASHBOARD";
  static testPoints(): TestPoint[] {
    return inspectSuite(DashboardPage, [
      ["Add domain", (p) => p.addDomain],
      ["+ (Brand Voice widget)", (p) => p.addBrandVoice],
    ]);
  }

  readonly dismissSetup: Locator;
  readonly checklistCreateDocument: Locator;
  readonly checklistFinishDocument: Locator;
  readonly checklistTitleDocument: Locator;
  readonly done: Locator;
  /** Starts Google Search Console OAuth — inspect only, never click. */
  readonly linkDomain: Locator;
  /** Starts Google Search Console OAuth — inspect only, never click. */
  readonly addDomain: Locator;
  readonly addBrandVoice: Locator;
  readonly recentDocuments: Locator;

  constructor(page: Page) {
    super(page, DashboardPage.path);
    this.dismissSetup = this.button("Dismiss Setup x");
    this.checklistCreateDocument = page.locator("#createDocument");
    this.checklistFinishDocument = page.locator("#finishDocument");
    this.checklistTitleDocument = page.locator("#titleDocument");
    this.done = this.button("Done");
    this.linkDomain = this.button("Link");
    this.addDomain = this.button("Add domain");
    this.addBrandVoice = this.button("+");
    this.recentDocuments = this.link(/last update/, false);
  }
}

const K = DashboardPage.key;

export class OpenDashboardPage extends OpenPage {
  constructor() {
    super(DashboardPage);
  }
}

export class DashboardOpenBrandVoiceFromWidget extends TestPoint {
  constructor() {
    super(actionId(K, 1), "Click + on the Brand Voice widget and land on /app/brand-voice", async (page) => {
      await new DashboardPage(page).addBrandVoice.first().click();
      await expect(page).toHaveURL(/\/app\/brand-voice/);
    });
  }
}

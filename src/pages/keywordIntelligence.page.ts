import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class KeywordIntelligencePage extends BasePage {
  static readonly path = "/app/tools/keyword_intelligence";
  static readonly key = "KEYWORDS";
  static testPoints(): TestPoint[] {
    return inspectSuite(KeywordIntelligencePage, [
      ["View All", (p) => p.viewAllLink],
      ["Keyword or niche input", (p) => p.keywordInput],
      ["Analyze keywords", (p) => p.analyze],
    ]);
  }

  readonly viewAllLink: Locator;
  readonly viewAllButton: Locator;
  readonly keywordInput: Locator;
  /** Spends credits — inspect only, never click. */
  readonly analyze: Locator;

  constructor(page: Page) {
    super(page, KeywordIntelligencePage.path);
    this.viewAllLink = this.link("View All");
    this.viewAllButton = this.button("View All");
    this.keywordInput = this.textbox("Keyword or niche input");
    this.analyze = this.button("Analyze keywords");
  }
}

export class KeywordRecentPage extends BasePage {
  static readonly path = "/app/tools/keyword_intelligence/recent";
  static readonly key = "KEYWORDS_RECENT";
  static testPoints(): TestPoint[] {
    return inspectSuite(KeywordRecentPage, [
      ["New Keyword", (p) => p.newKeyword],
      ["Search by keyword", (p) => p.search],
    ]);
  }

  readonly newKeyword: Locator;
  readonly search: Locator;

  constructor(page: Page) {
    super(page, KeywordRecentPage.path);
    this.newKeyword = this.button("New Keyword");
    this.search = this.placeholder("Search by keyword...");
  }
}

const K = KeywordIntelligencePage.key;

export class OpenKeywordIntelligencePage extends OpenPage {
  constructor() {
    super(KeywordIntelligencePage);
  }
}

export class OpenKeywordRecentPage extends OpenPage {
  constructor() {
    super(KeywordRecentPage);
  }
}

export class KeywordFillInput extends TestPoint {
  constructor(keyword: string) {
    super(actionId(K, 1), `Type "${keyword}" in the keyword input (not analyzed)`, async (page) => {
      const pom = new KeywordIntelligencePage(page);
      await pom.keywordInput.fill(keyword);
      await expect(pom.keywordInput).toHaveValue(keyword);
    });
  }
}

export class KeywordOpenRecent extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Click View All and land on the recent keywords page", async (page) => {
      await new KeywordIntelligencePage(page).viewAllLink.click();
      const recent = new KeywordRecentPage(page);
      await recent.expectOnPage();
      await recent.expectVisible(recent.newKeyword, "New Keyword");
    });
  }
}

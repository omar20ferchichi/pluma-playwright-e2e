import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class LlmRankPage extends BasePage {
  static readonly path = "/app/llm-rank";
  static readonly key = "LLM_RANK";
  static testPoints(): TestPoint[] {
    return inspectSuite(LlmRankPage, [["Create your first AI tracker", (p) => p.createTracker]]);
  }

  readonly createTracker: Locator;

  constructor(page: Page) {
    super(page, LlmRankPage.path);
    this.createTracker = this.button("Create your first AI tracker");
  }
}

/** Step 1 of the tracker wizard. */
export class LlmRankDiscoverPage extends BasePage {
  static readonly path = "/app/llm-rank/discover";
  static readonly key = "LLM_RANK_DISCOVER";
  static testPoints(): TestPoint[] {
    return inspectSuite(LlmRankDiscoverPage, [
      ["Brand", (p) => p.brand],
      ["Topic", (p) => p.topic],
      ["ChatGPT engine", (p) => p.engine("ChatGPT")],
      ["Claude engine", (p) => p.engine("Claude")],
      ["Perplexity engine", (p) => p.engine("Perplexity")],
      ["Cancel", (p) => p.cancel],
      ["Next", (p) => p.next],
    ]);
  }

  readonly brand: Locator;
  readonly topic: Locator;
  readonly cancel: Locator;
  /** Moves the wizard on — never clicked. */
  readonly next: Locator;

  constructor(page: Page) {
    super(page, LlmRankDiscoverPage.path);
    this.brand = this.textbox("Brand");
    this.topic = this.textbox("Topic");
    this.cancel = this.button("Cancel");
    this.next = this.button("Next");
  }

  engine(name: "ChatGPT" | "Claude" | "Perplexity"): Locator {
    return this.button(name);
  }
}

const K = LlmRankPage.key;

export class OpenLlmRankPage extends OpenPage {
  constructor() {
    super(LlmRankPage);
  }
}

export class OpenLlmRankDiscoverPage extends OpenPage {
  constructor() {
    super(LlmRankDiscoverPage);
  }
}

export class LlmRankStartTracker extends TestPoint {
  constructor() {
    super(actionId(K, 1), "Click Create your first AI tracker and land on the wizard", async (page) => {
      await new LlmRankPage(page).createTracker.click();
      await new LlmRankDiscoverPage(page).expectOnPage();
    });
  }
}

export class LlmRankFillWizardStep1 extends TestPoint {
  constructor(brand: string, topic: string) {
    super(actionId(K, 2), "Fill Brand and Topic on wizard step 1 (Next not clicked)", async (page) => {
      const pom = new LlmRankDiscoverPage(page);
      await pom.brand.fill(brand);
      await pom.topic.fill(topic);
      await expect(pom.brand).toHaveValue(brand);
      await expect(pom.topic).toHaveValue(topic);
    });
  }
}

export class LlmRankCancelWizard extends TestPoint {
  constructor() {
    super(actionId(K, 3), "Cancel the tracker wizard and leave /discover", async (page) => {
      await new LlmRankDiscoverPage(page).cancel.click();
      await expect(page).not.toHaveURL(/\/discover/);
    });
  }
}

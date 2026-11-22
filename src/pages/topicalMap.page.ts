import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class TopicalMapPage extends BasePage {
  static readonly path = "/app/tools/topical_map";
  static readonly key = "TOPICAL_MAP";
  static testPoints(): TestPoint[] {
    return inspectSuite(TopicalMapPage, [
      ["New Topic Research", (p) => p.newTopicResearch],
      ["Search", (p) => p.search],
    ]);
  }

  readonly newTopicResearch: Locator;
  readonly search: Locator;
  readonly topicInput: Locator;
  /** Runs a research job — inspect only, never click. */
  readonly createTopicResearch: Locator;

  constructor(page: Page) {
    super(page, TopicalMapPage.path);
    this.newTopicResearch = this.nestedButton("New Topic Research");
    this.search = this.placeholder("Search...");
    this.topicInput = this.placeholder("e.g best SEO Tool");
    this.createTopicResearch = this.button("Create Topic Research");
  }
}

const K = TopicalMapPage.key;

export class OpenTopicalMapPage extends OpenPage {
  constructor() {
    super(TopicalMapPage);
  }
}

export class TopicalMapOpenNewTopicDialog extends TestPoint {
  constructor() {
    super(actionId(K, 1), 'Click New Topic Research and see its dialog', async (page) => {
      const pom = new TopicalMapPage(page);
      await pom.newTopicResearch.click();
      await pom.expectDialogOpen();
      await pom.expectVisible(pom.topicInput, "topic input");
      await pom.expectVisible(pom.createTopicResearch, "Create Topic Research");
    });
  }
}

export class TopicalMapFillTopic extends TestPoint {
  constructor(topic: string) {
    super(actionId(K, 2), `Type "${topic}" as the topic (not created)`, async (page) => {
      const pom = new TopicalMapPage(page);
      await pom.topicInput.fill(topic);
      await expect(pom.topicInput).toHaveValue(topic);
    });
  }
}

export class TopicalMapCancelDialog extends TestPoint {
  constructor() {
    super(actionId(K, 3), "Cancel the New Topic Research dialog", async (page) => {
      await new TopicalMapPage(page).cancelDialog();
    });
  }
}

export class TopicalMapSearch extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 4), `Type "${text}" in the topical map search`, async (page) => {
      const pom = new TopicalMapPage(page);
      await pom.search.fill(text);
      await expect(pom.search).toHaveValue(text);
    });
  }
}

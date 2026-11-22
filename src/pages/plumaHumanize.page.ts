import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class PlumaHumanizePage extends BasePage {
  static readonly path = "/app/pluma-humanize";
  static readonly key = "PLUMA_HUMANIZE";
  static testPoints(): TestPoint[] {
    return inspectSuite(PlumaHumanizePage, [
      ["Text editor", (p) => p.editor],
      ["Analyze Text", (p) => p.analyze],
    ]);
  }

  /** Quill editor (contenteditable). */
  readonly editor: Locator;
  /** Spends credits — inspect only, never click. */
  readonly analyze: Locator;

  constructor(page: Page) {
    super(page, PlumaHumanizePage.path);
    this.editor = page.locator(".ql-editor");
    this.analyze = this.button("Analyze Text");
  }
}

const K = PlumaHumanizePage.key;

export class OpenPlumaHumanizePage extends OpenPage {
  constructor() {
    super(PlumaHumanizePage);
  }
}

export class HumanizeTypeText extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 1), "Type text into the Humanize editor (not analyzed)", async (page) => {
      const pom = new PlumaHumanizePage(page);
      await pom.editor.click();
      await page.keyboard.type(text);
      await expect(pom.editor).toContainText(text);
    });
  }
}

export class HumanizeClearText extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Clear the Humanize editor", async (page) => {
      const pom = new PlumaHumanizePage(page);
      await pom.editor.click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.press("Delete");
      await expect(pom.editor).toHaveText("");
    });
  }
}

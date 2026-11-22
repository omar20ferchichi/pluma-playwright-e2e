import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export type BrandVoiceTab = "Paste your text" | "Extract from URL";

export class BrandVoicePage extends BasePage {
  static readonly path = "/app/brand-voice";
  static readonly key = "BRAND_VOICE";
  static testPoints(): TestPoint[] {
    return inspectSuite(BrandVoicePage, [
      ["New Voice", (p) => p.newVoice],
      ["Search", (p) => p.search],
    ]);
  }

  readonly newVoice: Locator;
  readonly search: Locator;
  // "New brand voice" dialog
  readonly textContent: Locator;
  readonly url: Locator;
  /** Runs an AI generation — inspect only, never click. */
  readonly generateVoice: Locator;

  constructor(page: Page) {
    super(page, BrandVoicePage.path);
    this.newVoice = this.button("New Voice");
    this.search = this.placeholder("Search...");
    this.textContent = this.placeholder("Write some content here...");
    this.url = this.placeholder("Paste your url here...");
    this.generateVoice = this.button("Generate Voice");
  }
}

const K = BrandVoicePage.key;

export class OpenBrandVoicePage extends OpenPage {
  constructor() {
    super(BrandVoicePage);
  }
}

export class BrandVoiceOpenNewVoiceDialog extends TestPoint {
  constructor() {
    super(actionId(K, 1), 'Click New Voice and see the "New brand voice" dialog', async (page) => {
      const pom = new BrandVoicePage(page);
      await pom.newVoice.click();
      await pom.expectDialogOpen();
      await pom.expectVisible(page.getByRole("tab", { name: "Paste your text" }), "Paste your text tab");
      await pom.expectVisible(pom.generateVoice, "Generate Voice");
    });
  }
}

export class BrandVoiceSwitchTab extends TestPoint {
  constructor(tab: BrandVoiceTab) {
    super(actionId(K, 2), `Switch the New Voice dialog to "${tab}"`, async (page) => {
      const pom = new BrandVoicePage(page);
      await pom.dialog().getByRole("tab", { name: tab, exact: true }).click();
      await pom.expectVisible(tab === "Paste your text" ? pom.textContent : pom.url, `${tab} field`);
    });
  }
}

export class BrandVoiceFillText extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 3), "Type sample text in the New Voice dialog (not generated)", async (page) => {
      const pom = new BrandVoicePage(page);
      await pom.textContent.fill(text);
      await expect(pom.textContent).toHaveValue(text);
    });
  }
}

export class BrandVoiceFillUrl extends TestPoint {
  constructor(url: string) {
    super(actionId(K, 4), "Type a URL in the Extract from URL tab (not generated)", async (page) => {
      const pom = new BrandVoicePage(page);
      await pom.url.fill(url);
      await expect(pom.url).toHaveValue(url);
    });
  }
}

export class BrandVoiceCloseDialog extends TestPoint {
  constructor() {
    super(actionId(K, 5), "Close the New Voice dialog without generating", async (page) => {
      await new BrandVoicePage(page).closeDialog();
    });
  }
}

import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class PlumaArtPage extends BasePage {
  static readonly path = "/app/pluma-Art";
  static readonly key = "PLUMA_ART";
  static testPoints(): TestPoint[] {
    return inspectSuite(PlumaArtPage, [
      ["Image description", (p) => p.description],
      ["Number of images", (p) => p.numberOfImages],
      ["Generate", (p) => p.generate],
      ["Saved tab", (p) => p.savedTab],
      ["Favourite tab", (p) => p.favouriteTab],
    ]);
  }

  readonly description: Locator;
  readonly numberOfImages: Locator;
  /** ⚠ "Visual" switch, no label. */
  readonly visualSwitch: Locator;
  /** Spends credits — inspect only, never click. */
  readonly generate: Locator;
  readonly savedTab: Locator;
  readonly favouriteTab: Locator;

  constructor(page: Page) {
    super(page, PlumaArtPage.path);
    this.description = this.placeholder("Write an image description here");
    this.numberOfImages = this.placeholder("Number of Images");
    this.visualSwitch = page.locator("button.peer.inline-flex");
    this.generate = this.button("Generate");
    this.savedTab = this.tab("Saved");
    this.favouriteTab = this.tab("Favourite");
  }
}

const K = PlumaArtPage.key;

export class OpenPlumaArtPage extends OpenPage {
  constructor() {
    super(PlumaArtPage);
  }
}

export class PlumaArtFillDescription extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 1), "Type an image description (not generated)", async (page) => {
      const pom = new PlumaArtPage(page);
      await pom.description.fill(text);
      await expect(pom.description).toHaveValue(text);
    });
  }
}

export class PlumaArtSwitchTab extends TestPoint {
  constructor(tab: "Saved" | "Favourite") {
    super(actionId(K, 2), `Switch Pluma Art to the ${tab} tab`, async (page) => {
      const pom = new PlumaArtPage(page);
      const target = tab === "Saved" ? pom.savedTab : pom.favouriteTab;
      await target.click();
      await expect(target).toHaveAttribute("aria-selected", "true");
    });
  }
}

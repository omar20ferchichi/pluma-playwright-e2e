import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

/** /app/interlink — onboarding screen, no sidebar. */
export class LinkNetworkPage extends BasePage {
  static readonly path = "/app/interlink";
  static readonly key = "LINK_NETWORK";
  static testPoints(): TestPoint[] {
    return inspectSuite(LinkNetworkPage, [
      ["Connect Your Domain", (p) => p.connectDomain],
      ["Continue with Existing Account", (p) => p.continueExisting],
    ]);
  }

  /** Starts Google Search Console OAuth — inspect only, never click. */
  readonly connectDomain: Locator;
  readonly continueExisting: Locator;

  constructor(page: Page) {
    super(page, LinkNetworkPage.path);
    this.connectDomain = this.button("Connect Your Domain");
    this.continueExisting = this.button("Continue with Existing Account");
  }
}

const K = LinkNetworkPage.key;

export class OpenLinkNetworkPage extends OpenPage {
  constructor() {
    super(LinkNetworkPage);
  }
}

export class LinkNetworkAssertContinueDisabled extends TestPoint {
  constructor() {
    super(actionId(K, 1), "Continue with Existing Account is disabled while no domain is connected", async (page) => {
      await expect(new LinkNetworkPage(page).continueExisting).toBeDisabled();
    });
  }
}

import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export const REWARD_PLATFORMS = ["Capterra", "G2", "TrustPilot", "Linkedin", "X", "Facebook"] as const;
export type RewardPlatform = (typeof REWARD_PLATFORMS)[number];

export class RewardsPage extends BasePage {
  static readonly path = "/app/rewards";
  static readonly key = "REWARDS";
  static testPoints(): TestPoint[] {
    return inspectSuite(RewardsPage, [
      ["Check rewards history", (p) => p.history],
      ...REWARD_PLATFORMS.map((name) => [name, (p: RewardsPage) => p.platform(name)] as [string, (p: RewardsPage) => Locator]),
    ]);
  }

  readonly history: Locator;

  constructor(page: Page) {
    super(page, RewardsPage.path);
    this.history = this.nestedButton("Check rewards history");
  }

  platform(name: RewardPlatform): Locator {
    return this.button(name);
  }
}

const K = RewardsPage.key;

export class OpenRewardsPage extends OpenPage {
  constructor() {
    super(RewardsPage);
  }
}

export class RewardsOpenHistory extends TestPoint {
  constructor() {
    super(actionId(K, 1), 'Open the "Rewards history" dialog', async (page) => {
      const pom = new RewardsPage(page);
      await pom.history.click();
      await pom.expectDialogOpen();
    });
  }
}

export class RewardsCloseDialog extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Close the Rewards history dialog", async (page) => {
      await new RewardsPage(page).closeDialog();
    });
  }
}

export class RewardsSelectPlatform extends TestPoint {
  constructor(platform: RewardPlatform) {
    super(actionId(K, 3), `Select the ${platform} reward`, async (page) => {
      const pom = new RewardsPage(page);
      await pom.platform(platform).click();
      await pom.expectVisible(pom.platform(platform), platform);
    });
  }
}

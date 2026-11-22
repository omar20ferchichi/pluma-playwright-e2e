import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export class WorkspaceCreationPage extends BasePage {
  static readonly path = "/settings/workspace-creation";
  static readonly key = "WORKSPACE_CREATION";
  static testPoints(): TestPoint[] {
    return inspectSuite(WorkspaceCreationPage, [
      ["Upload logo", (p) => p.uploadLogo],
      ["Workspace name", (p) => p.workspaceName],
      ["Cancel", (p) => p.cancel],
      ["Create", (p) => p.create],
    ]);
  }

  readonly uploadLogo: Locator;
  /** ⚠ colour picker trigger, no label. */
  readonly colorPicker: Locator;
  readonly workspaceName: Locator;
  readonly cancel: Locator;
  /** Creates a real workspace — inspect only, never click. */
  readonly create: Locator;

  constructor(page: Page) {
    super(page, WorkspaceCreationPage.path);
    this.uploadLogo = page.getByText("Upload", { exact: true });
    this.colorPicker = page.locator("button.flex.h-10");
    this.workspaceName = this.placeholder("Workspace name...");
    this.cancel = this.button("Cancel");
    this.create = this.button("Create");
  }
}

const K = WorkspaceCreationPage.key;

export class OpenWorkspaceCreationPage extends OpenPage {
  constructor() {
    super(WorkspaceCreationPage);
  }
}

export class WorkspaceCreationFillName extends TestPoint {
  constructor(name: string) {
    super(actionId(K, 1), `Type "${name}" as the workspace name (not created)`, async (page) => {
      const pom = new WorkspaceCreationPage(page);
      await pom.workspaceName.fill(name);
      await expect(pom.workspaceName).toHaveValue(name);
    });
  }
}

export class WorkspaceCreationCancel extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Cancel workspace creation and leave the page", async (page) => {
      await new WorkspaceCreationPage(page).cancel.click();
      await expect(page).not.toHaveURL(/workspace-creation/);
    });
  }
}

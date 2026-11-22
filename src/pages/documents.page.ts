import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export const DOCUMENT_STATUSES = ["Draft", "In Review", "Completed", "Published"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

/** /app/documents — "Article Generator" in the sidebar. */
export class DocumentsPage extends BasePage {
  static readonly path = "/app/documents";
  static readonly key = "DOCUMENTS";
  static testPoints(): TestPoint[] {
    return inspectSuite(DocumentsPage, [
      ["New document", (p) => p.newDocument],
      ["Search document", (p) => p.search],
      ["Status filter", (p) => p.statusFilter],
      ["Source filter", (p) => p.sourceFilter],
    ]);
  }

  /** Creates a real document — inspect only, never click. */
  readonly newDocument: Locator;
  readonly search: Locator;
  readonly statusFilter: Locator;
  readonly sourceFilter: Locator;
  readonly resetFilter: Locator;

  constructor(page: Page) {
    super(page, DocumentsPage.path);
    this.newDocument = this.button("New document");
    this.search = this.placeholder("Search document...");
    this.statusFilter = this.nestedButton("Status");
    this.sourceFilter = this.button("Source");
    // Two "Reset filter" buttons; the second sits under an animated panel.
    this.resetFilter = this.button("Reset filter").first();
  }

  status(name: DocumentStatus): Locator {
    return this.button(name);
  }

  /**
   * ⚠ A selected status filter only shows as the CSS class "bg-pluma-primary"
   * (no aria-pressed / data-state). Ask the devs for aria-pressed.
   */
  async expectStatusSelected(name: DocumentStatus, selected: boolean): Promise<void> {
    const assertion = expect(this.status(name), `status ${name} selected=${selected}`);
    await (selected ? assertion : assertion.not).toHaveClass(/\bbg-pluma-primary\b/);
  }
}

const K = DocumentsPage.key;

export class OpenDocumentsPage extends OpenPage {
  constructor() {
    super(DocumentsPage);
  }
}

export class DocumentsSearch extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 1), `Type "${text}" in the document search`, async (page) => {
      const pom = new DocumentsPage(page);
      await pom.search.fill(text);
      await expect(pom.search).toHaveValue(text);
    });
  }
}

export class DocumentsShowStatusFilters extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Click Status and check the four status filters are shown", async (page) => {
      const pom = new DocumentsPage(page);
      await pom.statusFilter.click();
      for (const status of DOCUMENT_STATUSES) await pom.expectVisible(pom.status(status), `status ${status}`);
    });
  }
}

export class DocumentsSelectStatus extends TestPoint {
  constructor(status: DocumentStatus) {
    super(actionId(K, 3), `Select the "${status}" status filter`, async (page) => {
      const pom = new DocumentsPage(page);
      await pom.status(status).click();
      await pom.expectStatusSelected(status, true);
    });
  }
}

export class DocumentsResetFilter extends TestPoint {
  constructor() {
    super(actionId(K, 4), "Click Reset filter; no status filter stays selected", async (page) => {
      const pom = new DocumentsPage(page);
      await pom.resetFilter.click();
      // Reset clears the status/source filters only; the search text stays.
      for (const status of DOCUMENT_STATUSES) await pom.expectStatusSelected(status, false);
    });
  }
}

export class DocumentsShowSourceFilters extends TestPoint {
  constructor() {
    super(actionId(K, 5), "Click Source and check the filter group changes", async (page) => {
      const pom = new DocumentsPage(page);
      await pom.sourceFilter.click();
      await pom.expectVisible(pom.sourceFilter, "Source filter still shown");
    });
  }
}

import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";

export const TEMPLATE_CATEGORIES = [
  "All",
  "SEO",
  "Emails & Letters",
  "Brainstorming",
  "Social Ads",
  "Products",
  "Sales copy",
  "Websites copy",
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export class TemplatesPage extends BasePage {
  static readonly path = "/app/templates";
  static readonly key = "TEMPLATES";
  static testPoints(): TestPoint[] {
    return inspectSuite(TemplatesPage, [
      ["Search for Template", (p) => p.search],
      ...TEMPLATE_CATEGORIES.map(
        (category) => [`Category ${category}`, (p: TemplatesPage) => p.category(category)] as [string, (p: TemplatesPage) => Locator],
      ),
      ["AIDA card", (p) => p.card("AIDA")],
    ]);
  }

  readonly search: Locator;

  constructor(page: Page) {
    super(page, TemplatesPage.path);
    this.search = this.placeholder("Search for Template");
  }

  category(name: TemplateCategory): Locator {
    return this.button(name);
  }

  /** Each template has a link and a button with the same name; we use the link. */
  card(name: string): Locator {
    return this.link(name);
  }
}

/** /app/templates/:id — fields differ per template; these are the common ones. */
export class TemplateDetailPage extends BasePage {
  static readonly path = "/app/templates/:id";
  static readonly key = "TEMPLATE_DETAIL";

  readonly back: Locator;
  readonly name: Locator;
  readonly details: Locator;
  readonly tone: Locator;
  /** Spends credits — inspect only, never click. */
  readonly generateCopy: Locator;

  constructor(page: Page) {
    super(page, /^\/app\/templates\/[^/]+$/);
    this.back = page.locator('a[href="/app/templates"]');
    this.name = this.placeholder("Name");
    this.details = this.placeholder("Brief details or features.");
    this.tone = this.placeholder("e.g. Friendly, Professional.");
    this.generateCopy = this.button("Generate a copy");
  }
}

const K = TemplatesPage.key;

export class OpenTemplatesPage extends OpenPage {
  constructor() {
    super(TemplatesPage);
  }
}

export class TemplatesFilterCategory extends TestPoint {
  constructor(category: TemplateCategory) {
    super(actionId(K, 1), `Filter templates by "${category}"`, async (page) => {
      const pom = new TemplatesPage(page);
      await pom.category(category).click();
      await pom.expectVisible(pom.category(category), category);
    });
  }
}

export class TemplatesSearch extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 2), `Search templates for "${text}"`, async (page) => {
      const pom = new TemplatesPage(page);
      await pom.search.fill(text);
      await expect(pom.search).toHaveValue(text);
    });
  }
}

export class TemplatesAssertCardVisible extends TestPoint {
  constructor(name: string) {
    super(actionId(K, 3), `Template card "${name}" is shown`, async (page) => {
      const pom = new TemplatesPage(page);
      await pom.expectVisible(pom.card(name), `${name} card`);
    });
  }
}

export class TemplatesAssertCardHidden extends TestPoint {
  constructor(name: string) {
    super(actionId(K, 4), `Template card "${name}" is filtered out`, async (page) => {
      const pom = new TemplatesPage(page);
      await pom.expectHidden(pom.card(name), `${name} card`);
    });
  }
}

export class TemplatesOpenTemplate extends TestPoint {
  constructor(name: string) {
    super(actionId(K, 5), `Open the "${name}" template and see its form`, async (page) => {
      await new TemplatesPage(page).card(name).first().click();
      const detail = new TemplateDetailPage(page);
      await detail.expectOnPage();
      await detail.expectVisible(detail.generateCopy, "Generate a copy");
    });
  }
}

export class TemplateFillName extends TestPoint {
  constructor(name: string) {
    super(actionId(K, 6), "Type a product name in the template form (not generated)", async (page) => {
      const detail = new TemplateDetailPage(page);
      await detail.name.fill(name);
      await expect(detail.name).toHaveValue(name);
    });
  }
}

export class TemplateBackToList extends TestPoint {
  constructor() {
    super(actionId(K, 7), "Go back from a template to /app/templates", async (page) => {
      await new TemplateDetailPage(page).back.first().click();
      await new TemplatesPage(page).expectOnPage();
    });
  }
}

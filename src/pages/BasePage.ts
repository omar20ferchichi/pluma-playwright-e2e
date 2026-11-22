import { expect, Locator, Page } from "@playwright/test";

export function pathMatches(url: URL, path: string | RegExp): boolean {
  const actual = url.pathname.replace(/\/$/, "") || "/";
  if (path instanceof RegExp) return path.test(actual);
  const expected = path.replace(/\/$/, "") || "/";
  return actual.toLowerCase() === expected.toLowerCase();
}

/**
 * Shared base for every Pluma page object.
 * Locator priority (see pluma-locators.md): role + name → label → placeholder → #id → CSS + nth (⚠ fragile).
 */
export class BasePage {
  constructor(
    public readonly page: Page,
    public readonly path: string | RegExp,
  ) {}

  async goto(): Promise<void> {
    if (this.path instanceof RegExp) throw new Error(`${this.constructor.name} has a dynamic path; open it by clicking`);
    await this.page.goto(this.path, { waitUntil: "domcontentloaded" });
    await this.expectOnPage();
    await this.waitForReady();
  }

  /** Pages are client-rendered: wait until something interactive is on screen. */
  async waitForReady(): Promise<void> {
    // Filter to visible ones: the app keeps hidden buttons (e.g. a collapsed sidebar toggle) first in the DOM.
    await this.page.locator("button, a, input").filter({ visible: true }).first().waitFor({ state: "visible" });
  }

  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL((url) => pathMatches(url, this.path));
  }

  async expectVisible(locator: Locator, label: string): Promise<void> {
    await expect(locator.first(), label).toBeVisible({ timeout: 10_000 });
  }

  async expectHidden(locator: Locator, label: string): Promise<void> {
    await expect(locator.first(), label).toBeHidden({ timeout: 10_000 });
  }

  // ---- finders -------------------------------------------------------------

  protected button(name: string | RegExp, exact = true): Locator {
    return this.page.getByRole("button", { name, exact });
  }

  /**
   * For buttons Pluma wraps in a tooltip or dialog-trigger <button> with the same accessible name
   * (e.g. "New Topic Research" matches 3 nested buttons). The innermost one comes last in the DOM.
   * Only use it for those: a page can also have several separate buttons with one name ("Add Task").
   */
  protected nestedButton(name: string): Locator {
    return this.page.getByRole("button", { name, exact: true }).last();
  }

  protected link(name: string | RegExp, exact = true): Locator {
    return this.page.getByRole("link", { name, exact });
  }

  protected tab(name: string): Locator {
    return this.page.getByRole("tab", { name, exact: true });
  }

  protected textbox(name: string): Locator {
    return this.page.getByRole("textbox", { name, exact: true });
  }

  protected placeholder(text: string): Locator {
    return this.page.getByPlaceholder(text, { exact: true });
  }

  protected combobox(name: string): Locator {
    return this.page.getByRole("combobox", { name, exact: true });
  }

  // ---- dialogs & menus -----------------------------------------------------

  dialog(): Locator {
    return this.page.getByRole("dialog");
  }

  dialogButton(name: string): Locator {
    return this.dialog().getByRole("button", { name, exact: true });
  }

  async expectDialogOpen(title?: string): Promise<void> {
    await expect(this.dialog(), "dialog should be open").toBeVisible();
    if (title) await expect(this.dialog().getByText(title, { exact: true }).first()).toBeVisible();
  }

  async expectDialogClosed(): Promise<void> {
    await expect(this.dialog(), "dialog should be closed").toBeHidden();
  }

  /** Close the open dialog with its Close (X) button, or Escape as a fallback. Never saves. */
  async closeDialog(): Promise<void> {
    const close = this.dialogButton("Close");
    if (await close.isVisible()) await close.click();
    else await this.page.keyboard.press("Escape");
    await this.expectDialogClosed();
  }

  async cancelDialog(): Promise<void> {
    await this.dialogButton("Cancel").click();
    await this.expectDialogClosed();
  }

  menuItem(name: string): Locator {
    return this.page.getByRole("menuitem", { name, exact: true });
  }
}

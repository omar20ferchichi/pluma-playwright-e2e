import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TestPoint } from "../testpoint/TestPoint";
import { actionId, inspectSuite, OpenPage } from "../testpoint/pageTestPoints";
import { escapeRegExp, QA_PREFIX, qaName, recall, remember } from "../testpoint/qaData";

export const CALENDAR_COLUMNS = ["DRAFT", "IN PROGRESS", "IN REVIEW", "COMPLETED"] as const;
export type CalendarView = "Board" | "Summary" | "List";

export class CalendarPage extends BasePage {
  static readonly path = "/app/calendar";
  static readonly key = "CALENDAR";
  static testPoints(): TestPoint[] {
    return inspectSuite(CalendarPage, [
      ["Board view", (p) => p.boardView],
      ["More view", (p) => p.moreView],
      ["Search tasks", (p) => p.search],
      ["Filters", (p) => p.filters],
      ["Add Task", (p) => p.addTask],
      ["DRAFT column", (p) => p.column("DRAFT")],
      ["IN PROGRESS column", (p) => p.column("IN PROGRESS")],
      ["IN REVIEW column", (p) => p.column("IN REVIEW")],
      ["COMPLETED column", (p) => p.column("COMPLETED")],
    ]);
  }

  readonly boardView: Locator;
  readonly moreView: Locator;
  readonly search: Locator;
  readonly filters: Locator;
  readonly addTask: Locator;
  // Summary / List views
  readonly allTime: Locator;
  readonly viewAllItems: Locator;
  /** ⚠ unlabelled "select all" checkbox of the List view. */
  readonly listSelectAll: Locator;
  // Add Task dialog
  readonly taskTitle: Locator;
  readonly taskDescription: Locator;
  /** Creates a real task — inspect only, never click. */
  readonly createTask: Locator;
  // Filters dialog
  readonly filtersClear: Locator;
  readonly filtersStatus: Locator;

  constructor(page: Page) {
    super(page, CalendarPage.path);
    this.boardView = this.button("Board");
    this.moreView = this.button("More view");
    this.search = this.placeholder("Search tasks by name...");
    this.filters = this.button("Filters");
    // The header button; each column also has its own "Add Task".
    this.addTask = this.button("Add Task").first();
    this.allTime = this.button("All time");
    this.viewAllItems = this.button("View all items");
    this.listSelectAll = page.locator("button.peer.h-4");
    this.taskTitle = this.placeholder("Enter task title");
    this.taskDescription = this.placeholder("Write task description...");
    this.createTask = this.button("Create Task");
    this.filtersClear = this.button("Clear");
    this.filtersStatus = this.placeholder("Select status...");
  }

  /**
   * Column header; its name is the title plus the item count, e.g. "Draft 3" or "In Progress 0".
   * The count updates late after a change, so tests never assert on it.
   */
  column(name: string): Locator {
    return this.page.getByRole("button", { name: new RegExp(`^${escapeRegExp(name)} \\d+$`, "i") });
  }

  // ---- tasks (E2E) -----------------------------------------------------------

  /**
   * Board card of a task, found by its title heading (h4). The card's accessible name is
   * "<title> [<description>] <priority>", so matching on the name breaks once a description is set.
   */
  taskCard(title: string): Locator {
    return this.page
      .getByRole("button")
      .filter({ has: this.page.getByRole("heading", { level: 4, name: title, exact: true }) });
  }

  /** Every card whose title starts with the QA prefix. */
  qaTaskCards(): Locator {
    return this.page
      .getByRole("button")
      .filter({ has: this.page.getByRole("heading", { level: 4, name: new RegExp(`^${QA_PREFIX} `) }) });
  }

  /** ⚠ "…" button of a card or column header: the only, unlabelled, button inside it. */
  private menuButton(owner: Locator): Locator {
    return owner.first().getByRole("button");
  }

  /** Popover opened by a card / column "…" button (items "Edit" and "Delete"). */
  private popoverItem(name: "Edit" | "Delete"): Locator {
    return this.page.locator("[data-radix-popper-content-wrapper]").getByText(new RegExp(`^${name}$`, "i"));
  }

  /** "Save Changes" of the Edit Task dialog. */
  get saveChanges(): Locator {
    return this.dialogButton("Save Changes");
  }

  /** ⚠ "+" button after the last column that opens "Add Status"; no label. */
  get addStatusButton(): Locator {
    return this.page.locator("button.flex.h-9").first();
  }

  async openBoard(): Promise<void> {
    await this.page.goto(`${CalendarPage.path}?view=board`, { waitUntil: "domcontentloaded" });
    await this.waitForBoard();
  }

  async waitForBoard(): Promise<void> {
    await expect(this.column("Draft"), "board columns loaded").toBeVisible({ timeout: 20_000 });
  }

  /** Status / Priority comboboxes of the Add / Edit task dialog (Radix select). */
  taskField(field: "Status" | "Priority"): Locator {
    return this.dialog().getByRole("combobox").nth(field === "Status" ? 0 : 1);
  }

  async chooseOption(field: "Status" | "Priority", value: string): Promise<void> {
    await this.taskField(field).click();
    await this.page.getByRole("option", { name: value, exact: true }).click();
    await expect(this.taskField(field)).toHaveText(new RegExp(escapeRegExp(value), "i"));
  }

  /** Opens "Add Standalone Task" and waits until its Status field has loaded (it starts as "Loading..."). */
  async openAddTaskDialog(): Promise<void> {
    await this.addTask.click();
    await this.expectDialogOpen("Add Standalone Task");
    await expect(this.taskField("Status")).toBeEnabled();
    await expect(this.taskField("Status")).toHaveText(/Draft/);
  }

  async createTaskOnBoard(task: { title: string; description?: string; status?: string; priority?: string }): Promise<void> {
    await this.openAddTaskDialog();
    await this.taskTitle.fill(task.title);
    if (task.description) await this.taskDescription.fill(task.description);
    if (task.status) await this.chooseOption("Status", task.status);
    if (task.priority) await this.chooseOption("Priority", task.priority);
    await this.createTask.click();
    await this.expectDialogClosed();
    await expect(this.taskCard(task.title), `card "${task.title}" on the board`).toBeVisible();
  }

  /** Opens the "Edit Task" dialog of a card and waits for its activity to load. */
  async openTask(title: string): Promise<void> {
    await this.taskCard(title).first().click();
    await this.expectDialogOpen("Edit Task");
    await expect(this.dialog().getByText("Loading activity...")).toBeHidden({ timeout: 15_000 });
  }

  /** Title of the column (h3) that contains the card. */
  async columnOfTask(title: string): Promise<string> {
    return this.taskCard(title).first().evaluate((card) => {
      let node: HTMLElement | null = card as HTMLElement;
      for (let i = 0; i < 10 && node; i++) {
        const heading = node.querySelector("h3");
        if (heading) return (heading.textContent ?? "").trim();
        node = node.parentElement;
      }
      return "";
    });
  }

  async deleteTask(title: string): Promise<void> {
    await this.menuButton(this.taskCard(title)).click();
    await this.popoverItem("Delete").click();
    await this.expectDialogOpen("Delete Task?");
    await this.dialogButton("Delete").click();
    await this.expectDialogClosed();
    await expect(this.taskCard(title)).toHaveCount(0);
  }

  async createStatusColumn(name: string): Promise<void> {
    await this.addStatusButton.click();
    await this.expectDialogOpen("Add Status");
    await this.placeholder("Enter status name").fill(name);
    await this.button("Create Status").click();
    await this.expectDialogClosed();
    await expect(this.column(name), `column "${name}"`).toBeVisible();
  }

  async deleteStatusColumn(name: string): Promise<void> {
    await this.menuButton(this.column(name)).click();
    await this.popoverItem("Delete").click();
    await this.expectDialogOpen("Delete Status?");
    await this.dialogButton("Delete").click();
    await this.expectDialogClosed();
    await expect(this.column(name)).toHaveCount(0);
  }

  /** Summary view: number shown under a status, e.g. "In Progress" → 3. */
  async summaryCount(status: string): Promise<number> {
    // Upper case only through CSS; the DOM text may be "Total items". innerText (below) applies the CSS.
    await expect(this.page.getByText(/^total items$/i)).toBeVisible();
    const lines = (await this.page.locator("body").innerText()).split("\n").map((l) => l.trim()).filter(Boolean);
    const start = lines.indexOf("TOTAL ITEMS");
    const at = lines.indexOf(status, start);
    const count = Number(lines[at + 1]);
    if (start < 0 || at < 0 || !Number.isFinite(count)) throw new Error(`No summary count for "${status}"`);
    return count;
  }

  /** List view row of a task. */
  listRow(title: string): Locator {
    return this.page.getByRole("row").filter({ hasText: title });
  }
}

const K = CalendarPage.key;

export class OpenCalendarPage extends OpenPage {
  constructor() {
    super(CalendarPage);
  }
}

export class CalendarSwitchView extends TestPoint {
  constructor(view: CalendarView) {
    super(actionId(K, 1), `Switch the calendar to the ${view} view`, async (page) => {
      const pom = new CalendarPage(page);
      if (view === "Board") {
        await pom.boardView.click();
        await expect(page).toHaveURL(/view=board/);
        await pom.expectVisible(pom.column("DRAFT"), "DRAFT column");
        return;
      }
      await pom.moreView.click();
      await pom.menuItem(view).click();
      if (view === "Summary") await pom.expectVisible(pom.viewAllItems, "View all items");
      else await pom.expectVisible(pom.listSelectAll, "List select-all checkbox");
    });
  }
}

export class CalendarOpenFilters extends TestPoint {
  constructor() {
    super(actionId(K, 2), "Open the FILTERS dialog", async (page) => {
      const pom = new CalendarPage(page);
      await pom.filters.click();
      await pom.expectDialogOpen();
      await pom.expectVisible(pom.filtersStatus, "status filter");
      await pom.expectVisible(pom.filtersClear, "Clear");
    });
  }
}

export class CalendarOpenAddTask extends TestPoint {
  constructor() {
    super(actionId(K, 3), 'Open the "Add Standalone Task" dialog', async (page) => {
      const pom = new CalendarPage(page);
      await pom.addTask.click();
      await pom.expectDialogOpen();
      await pom.expectVisible(pom.taskTitle, "task title");
      await pom.expectVisible(pom.createTask, "Create Task");
    });
  }
}

export class CalendarFillTaskTitle extends TestPoint {
  constructor(title: string) {
    super(actionId(K, 4), `Type "${title}" as the task title (not created)`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.taskTitle.fill(title);
      await expect(pom.taskTitle).toHaveValue(title);
    });
  }
}

export class CalendarCloseDialog extends TestPoint {
  constructor() {
    super(actionId(K, 5), "Close the open calendar dialog without saving", async (page) => {
      await new CalendarPage(page).closeDialog();
    });
  }
}

export class CalendarSearch extends TestPoint {
  constructor(text = "") {
    super(actionId(K, 6), text ? `Type "${text}" in the task search` : "Clear the task search", async (page) => {
      const pom = new CalendarPage(page);
      await pom.search.fill(text);
      await expect(pom.search).toHaveValue(text);
    });
  }
}

// ---- E2E: tasks and status columns ------------------------------------------
// Labels from the scenario CSV (e.g. "E2E-01") become unique names: "QA-E2E E2E-01 <run id>".
// Built-in statuses stay as they are; any other status is a QA column label and gets the same treatment.

const BUILT_IN_STATUSES = ["Draft", "In Progress", "In Review", "Completed"];
const statusName = (status: string) => (BUILT_IN_STATUSES.includes(status) ? status : qaName(status));
const none = (value?: string) => (value ? value : undefined);

export class CalendarOpenBoard extends TestPoint {
  constructor() {
    super(actionId(K, 7), "Open the calendar Board view and wait for its columns", async (page) => {
      await new CalendarPage(page).openBoard();
    });
  }
}

export class CalendarCleanupQaData extends TestPoint {
  constructor() {
    super(actionId(K, 8), `Delete every "${QA_PREFIX}" task and status column left on the board`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.openBoard();
      const cards = pom.qaTaskCards();
      for (let guard = 0; guard < 30 && (await cards.count()) > 0; guard++) {
        const title = (await cards.first().getByRole("heading", { level: 4 }).innerText()).trim();
        await pom.deleteTask(title);
      }
      const columns = page.getByRole("button", { name: new RegExp(`^${QA_PREFIX} .* \\d+$`, "i") });
      for (let guard = 0; guard < 10 && (await columns.count()) > 0; guard++) {
        const name = (await columns.first().getByRole("heading").first().innerText()).trim();
        await pom.deleteStatusColumn(name);
      }
      await expect(cards).toHaveCount(0);
      await expect(columns).toHaveCount(0);
    });
  }
}

export class CalendarCreateTask extends TestPoint {
  constructor(label: string, status = "", priority = "", description = "") {
    const title = qaName(label);
    const extras = [status && `status ${status}`, priority && `priority ${priority}`].filter(Boolean).join(", ");
    super(actionId(K, 9), `Create task "${title}"${extras ? ` (${extras})` : ""}`, async (page) => {
      await new CalendarPage(page).createTaskOnBoard({
        title,
        status: none(status) && statusName(status),
        priority: none(priority),
        description: none(description),
      });
    });
  }
}

export class CalendarAssertTaskInColumn extends TestPoint {
  constructor(label: string, status: string) {
    super(actionId(K, 10), `Task "${label}" is in the ${status} column`, async (page) => {
      const pom = new CalendarPage(page);
      await expect(pom.taskCard(qaName(label))).toBeVisible();
      expect((await pom.columnOfTask(qaName(label))).toLowerCase()).toBe(statusName(status).toLowerCase());
    });
  }
}

export class CalendarAssertTaskPriority extends TestPoint {
  constructor(label: string, priority: string) {
    super(actionId(K, 11), `Card of "${label}" shows priority ${priority}`, async (page) => {
      await expect(new CalendarPage(page).taskCard(qaName(label))).toContainText(new RegExp(`^${priority}$|${priority}`, "i"));
    });
  }
}

export class CalendarDeleteTask extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 12), `Delete task "${label}" from its card menu and confirm`, async (page) => {
      await new CalendarPage(page).deleteTask(qaName(label));
    });
  }
}

export class CalendarAssertTaskAbsent extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 13), `Task "${label}" is not on the board`, async (page) => {
      await expect(new CalendarPage(page).taskCard(qaName(label))).toHaveCount(0);
    });
  }
}

export class CalendarOpenTask extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 14), `Open task "${label}" (Edit Task dialog)`, async (page) => {
      await new CalendarPage(page).openTask(qaName(label));
    });
  }
}

export class CalendarAssertTaskFields extends TestPoint {
  constructor(status: string, priority: string) {
    super(actionId(K, 15), `Open task shows status ${status} and priority ${priority}`, async (page) => {
      const pom = new CalendarPage(page);
      await expect(pom.taskField("Status")).toHaveText(new RegExp(escapeRegExp(statusName(status)), "i"));
      await expect(pom.taskField("Priority")).toHaveText(new RegExp(priority, "i"));
    });
  }
}

export class CalendarEditTask extends TestPoint {
  constructor(newLabel: string, description = "") {
    super(actionId(K, 16), `Rename the open task to "${newLabel}"${description ? " and set its description" : ""}, then Save Changes`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.taskTitle.fill(qaName(newLabel));
      if (description) await pom.taskDescription.fill(description);
      await pom.saveChanges.click();
      await pom.expectDialogClosed();
    });
  }
}

export class CalendarChangeTaskStatus extends TestPoint {
  constructor(label: string, status: string) {
    super(actionId(K, 17), `Change the status of "${label}" to ${status} and save`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.openTask(qaName(label));
      await pom.chooseOption("Status", statusName(status));
      await pom.saveChanges.click();
      await pom.expectDialogClosed();
    });
  }
}

export class CalendarReloadBoard extends TestPoint {
  constructor() {
    super(actionId(K, 18), "Reload the page and wait for the board", async (page) => {
      await page.reload({ waitUntil: "domcontentloaded" });
      await new CalendarPage(page).waitForBoard();
    });
  }
}

export class CalendarAssertTaskDescription extends TestPoint {
  constructor(description: string) {
    super(actionId(K, 19), `Open task has the description "${description}"`, async (page) => {
      await expect(new CalendarPage(page).taskDescription).toHaveValue(description);
    });
  }
}

export class CalendarAddComment extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 20), `Post the comment "${text}" on the open task`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.dialog().locator(".ql-editor").click();
      await page.keyboard.type(text);
      await pom.dialogButton("Save").click();
    });
  }
}

export class CalendarAssertComment extends TestPoint {
  constructor(text: string) {
    super(actionId(K, 21), `Comments tab of the open task shows "${text}"`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.dialogButton("Comments").click();
      await expect(pom.dialog().getByText(text, { exact: true })).toBeVisible();
    });
  }
}

export class CalendarAssertHistory extends TestPoint {
  constructor(...entries: string[]) {
    super(actionId(K, 22), `History tab of the open task lists: ${entries.join(", ")}`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.dialogButton("History").click();
      for (const entry of entries) await expect(pom.dialog().getByText(entry, { exact: true }).first()).toBeVisible();
    });
  }
}

export class CalendarSearchTask extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 23), `Search the board for "${label}" and see only its card`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.search.fill(qaName(label));
      await expect(pom.taskCard(qaName(label))).toBeVisible();
      // Every card has an h4 title; column headers use h3.
      await expect(page.getByRole("button").filter({ has: page.getByRole("heading", { level: 4 }) })).toHaveCount(1);
    });
  }
}

export class CalendarRememberSummaryCount extends TestPoint {
  constructor(status: string) {
    super(actionId(K, 24), `Open the Summary view and note the ${status} count`, async (page) => {
      const pom = new CalendarPage(page);
      await page.goto(`${CalendarPage.path}?view=summary`, { waitUntil: "domcontentloaded" });
      remember(page, `summary:${status}`, await pom.summaryCount(status));
    });
  }
}

export class CalendarAssertSummaryCountIncreased extends TestPoint {
  constructor(status: string, by = "1") {
    super(actionId(K, 25), `Summary view: the ${status} count went up by ${by}`, async (page) => {
      const pom = new CalendarPage(page);
      const before = recall<number>(page, `summary:${status}`);
      await page.goto(`${CalendarPage.path}?view=summary`, { waitUntil: "domcontentloaded" });
      await expect.poll(() => pom.summaryCount(status), { timeout: 15_000 }).toBe(before + Number(by));
    });
  }
}

export class CalendarAssertListRow extends TestPoint {
  constructor(label: string, status: string, priority: string, description: string) {
    super(actionId(K, 26), `List view row of "${label}" shows ${status}, ${priority} and its description`, async (page) => {
      const pom = new CalendarPage(page);
      await page.goto(`${CalendarPage.path}?view=list`, { waitUntil: "domcontentloaded" });
      const row = pom.listRow(qaName(label));
      await expect(row).toHaveCount(1);
      // Case-insensitive: the DOM has "low"; it only shows as "Low" through CSS.
      for (const value of [statusName(status), priority, description]) {
        await expect(row).toContainText(new RegExp(escapeRegExp(value), "i"));
      }
    });
  }
}

export class CalendarCreateStatusColumn extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 27), `Add the status column "${qaName(label)}"`, async (page) => {
      await new CalendarPage(page).createStatusColumn(qaName(label));
    });
  }
}

export class CalendarAssertColumnAbsent extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 28), `Status column "${label}" is gone from the board`, async (page) => {
      await expect(new CalendarPage(page).column(qaName(label))).toHaveCount(0);
    });
  }
}

export class CalendarDeleteStatusColumn extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 29), `Delete the status column "${label}" from its menu and confirm`, async (page) => {
      await new CalendarPage(page).deleteStatusColumn(qaName(label));
    });
  }
}

export class CalendarTryCreateWithoutTitle extends TestPoint {
  constructor() {
    super(actionId(K, 30), "Click Create Task with an empty title: the dialog stays open", async (page) => {
      const pom = new CalendarPage(page);
      await pom.openAddTaskDialog();
      await expect(pom.taskTitle).toHaveValue("");
      await pom.createTask.click();
      await page.waitForTimeout(1_000);
      await pom.expectDialogOpen("Add Standalone Task");
    });
  }
}

export class CalendarFillNewTaskTitle extends TestPoint {
  constructor(label: string) {
    super(actionId(K, 31), `Type "${label}" as the title in the open Add Task dialog`, async (page) => {
      const pom = new CalendarPage(page);
      await pom.taskTitle.fill(qaName(label));
      await expect(pom.taskTitle).toHaveValue(qaName(label));
    });
  }
}

export class CalendarCancelDialog extends TestPoint {
  constructor() {
    super(actionId(K, 32), "Click Cancel in the open task dialog", async (page) => {
      await new CalendarPage(page).cancelDialog();
    });
  }
}

import { Locator, Page } from "@playwright/test";
import type { BasePage } from "../pages/BasePage";
import { TestPoint } from "./TestPoint";

/** A page object class: constructible from a Page, with its route and a short KEY used in TestPoint IDs. */
export type PageClass<T extends BasePage = BasePage> = {
  new (page: Page): T;
  readonly path: string;
  readonly key: string;
};

export type ControlSpec<T extends BasePage> = [label: string, pick: (pom: T) => Locator];

function pad(index: number): string {
  return String(index).padStart(2, "0");
}

/** TP-OPEN-<KEY>: go to the page by URL and check we landed on it. */
export class OpenPage<T extends BasePage = BasePage> extends TestPoint {
  constructor(PageCls: PageClass<T>) {
    super(`TP-OPEN-${PageCls.key}`, `Open ${PageCls.path}`, async (page) => {
      await new PageCls(page).goto();
    });
  }
}

/** TP-BTN-<KEY>-NN: check that one control of the page is visible. Never clicks. */
export class InspectControl<T extends BasePage> extends TestPoint {
  constructor(PageCls: PageClass<T>, index: number, label: string, pick: (pom: T) => Locator) {
    const id = `TP-BTN-${PageCls.key}-${pad(index)}`;
    super(id, `Inspect "${label}" on ${PageCls.path}`, async (page) => {
      const pom = new PageCls(page);
      await pom.expectVisible(pick(pom), `${id} ${label} on ${PageCls.path}`);
    });
  }
}

/** The inspect suite of a page: open it, then check each control. */
export function inspectSuite<T extends BasePage>(PageCls: PageClass<T>, controls: ControlSpec<T>[]): TestPoint[] {
  return [new OpenPage(PageCls), ...controls.map(([label, pick], i) => new InspectControl(PageCls, i + 1, label, pick))];
}

/** ID for an action TestPoint: TP-ACT-<KEY>-NN. */
export function actionId(key: string, index: number): string {
  return `TP-ACT-${key}-${pad(index)}`;
}

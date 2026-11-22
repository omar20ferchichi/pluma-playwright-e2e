import { PAGE_INVENTORY } from "../../src/pages/inventory";
import { TestPoint } from "../../src/testpoint/TestPoint";

export type InventorySuite = { key: string; path: string; testpoints: TestPoint[] };

/** One inspect suite per inventory page: TP-OPEN-<KEY> then TP-BTN-<KEY>-NN. */
export function inventorySuites(): InventorySuite[] {
  return PAGE_INVENTORY.map((PageCls) => ({
    key: PageCls.key,
    path: PageCls.path,
    testpoints: PageCls.testPoints(),
  }));
}

export function allInventoryTestPoints(): TestPoint[] {
  return inventorySuites().flatMap((suite) => suite.testpoints);
}

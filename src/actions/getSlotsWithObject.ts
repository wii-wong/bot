import mudConfig from "@dust/world/mud.config";
import { Hex } from "viem";
import { maxPlayerInventorySlots } from "../utils/constants";
import { stash } from "../utils/stash";

export function getSlotsWithObject(
  owner: Hex,
  objectType: number
): {
  slot: number;
  amount: number;
}[] {
  const slots: {
    slot: number;
    amount: number;
  }[] = [];
  for (let i = 0; i < maxPlayerInventorySlots; i++) {
    const inventorySlot = stash.getRecord({
      table: mudConfig.tables.InventorySlot,
      key: {
        owner,
        slot: i,
      },
    });
    if (inventorySlot?.objectType !== objectType) {
      continue;
    }
    slots.push({
      slot: i,
      amount: inventorySlot.amount,
    });
  }
  return slots;
}

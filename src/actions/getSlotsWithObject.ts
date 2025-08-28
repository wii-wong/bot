import mudConfig from "@dust/world/mud.config";
import { BotContext } from "../types";
import { maxPlayerInventorySlots as MAX_PLAYER_INVENTORY_SLOTS } from "../utils/constants";
import { stash } from "../utils/stash";

export function getSlotsWithObject(
  objectType: number,
  context: BotContext
): {
  slot: number;
  amount: number;
}[] {
  const slots: {
    slot: number;
    amount: number;
  }[] = [];
  for (let i = 0; i < MAX_PLAYER_INVENTORY_SLOTS; i++) {
    const inventorySlot = stash.getRecord({
      table: mudConfig.tables.InventorySlot,
      key: {
        owner: context.player.entityId,
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

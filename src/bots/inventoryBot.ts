import { getAllSlots } from "../actions/getSlotsWithObject";
import { getObjectName } from "../actions/getObjectTypeAt";
import { BotContext } from "../types";

export async function inventoryBot(context: BotContext) {
  const slots = getAllSlots(context.player.entityId, context);

  if (slots.length === 0) {
    console.log("Inventory is empty.");
    return;
  }

  console.log("=== Inventory ===");
  for (const slot of slots) {
    const name = getObjectName(slot.objectType);
    console.log(`[Slot ${slot.slot}] ${name} x${slot.amount}`);
  }
  console.log(`=== Total: ${slots.length} slots used ===`);
}

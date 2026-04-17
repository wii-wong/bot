import { encodeBlock, Vec3 } from "@dust/world/internal";
import { getAllSlots } from "../actions/getSlotsWithObject";
import { getObjectName } from "../actions/getObjectTypeAt";
import { BotContext } from "../types";
import { maxChestInventorySlots } from "../utils/constants";

export async function chestViewBot(chestCoord: Vec3, context: BotContext) {
  const chestId = encodeBlock(chestCoord);
  const slots = getAllSlots(chestId, context);

  if (slots.length === 0) {
    console.log(`Chest at [${chestCoord.join(", ")}] is empty.`);
    return;
  }

  console.log(`=== Chest [${chestCoord.join(", ")}] ===`);
  for (const slot of slots) {
    const name = getObjectName(slot.objectType);
    console.log(`[Slot ${slot.slot}] ${name} x${slot.amount}`);
  }
  console.log(`=== Total: ${slots.length}/${maxChestInventorySlots} slots used ===`);
}

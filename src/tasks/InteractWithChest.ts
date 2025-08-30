import { encodeBlock } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getAllSlots, getSlotsWithObject } from "../actions/getSlotsWithObject";
import { transferObject } from "../actions/transferObject";
import { BotContext, InteractWithChestParam } from "../types";
import { maxChestInventorySlots, maxPlayerInventorySlots } from "../utils/constants";

export async function InteractWithChest(param: InteractWithChestParam, context: BotContext) {
  const playerId = context.player.entityId;
  const chestId = encodeBlock(param.chestCoord);
  const objectType = getObjectTypeId(param.objectName);
  const { action, amount } = param;

  // Determine source and target based on action (withdraw or deposit)
  const sourceId = action === 'withdraw' ? chestId : playerId;
  const targetId = action === 'withdraw' ? playerId : chestId;

  // Find slots with the specified object in the source
  const sourceSlots = getSlotsWithObject(sourceId, objectType, context);

  if (sourceSlots.length === 0) {
    console.log(`No ${param.objectName} found in ${action === 'withdraw' ? 'chest' : 'inventory'}`);
    return;
  }

  // Limit the amount to transfer based on available source slots
  // Since objects can't be stacked, each slot can only hold one item
  const actualAmount = Math.min(amount, sourceSlots.length);

  // Get all slots in the target to find empty slots
  const targetSlots = getAllSlots(targetId, context);

  // Find empty slots in the target
  const occupiedSlotNumbers = new Set(targetSlots.map(slot => slot.slot));
  const emptySlots: number[] = [];

  // Determine which max slots to use based on the target
  const maxSlots = targetId === chestId ? maxChestInventorySlots : maxPlayerInventorySlots;

  // Find empty slots using the appropriate max slots constant
  for (let i = 0; i < maxSlots; i++) {
    if (!occupiedSlotNumbers.has(i)) {
      emptySlots.push(i);
    }
  }

  // Limit the amount to transfer based on available target slots
  const transferAmount = Math.min(actualAmount, emptySlots.length);

  if (transferAmount === 0) {
    console.log(`No available slots in ${action === 'withdraw' ? 'inventory' : 'chest'}`);
    return;
  }

  // Create transfer instructions
  const transfers: { slotFrom: number; slotTo: number; amount: number }[] = [];

  // Take only the number of slots we need from both source and target
  const sourceSlotsTouse = sourceSlots.slice(0, transferAmount);
  const emptySlotsTouse = emptySlots.slice(0, transferAmount);

  // Create transfers by zipping the two arrays together
  sourceSlotsTouse.forEach((sourceSlot, index) => {
    const targetSlot = emptySlotsTouse[index];
    // Only create a transfer if we have both a source and target slot
    if (targetSlot !== undefined) {
      transfers.push({
        slotFrom: sourceSlot.slot,
        slotTo: targetSlot,
        amount: 1 // Since objects can't be stacked, we transfer 1 per slot
      });
    }
  });

  // Execute the transfer
  await transferObject(sourceId, targetId, transfers, context);

  console.log(`Successfully ${action === 'withdraw' ? 'withdrew' : 'deposited'} ${transferAmount} ${param.objectName}`);
}
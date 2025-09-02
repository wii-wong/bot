import { encodeBlock, ObjectName, Vec3 } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getAllSlots, getSlotsWithObject } from "../actions/getSlotsWithObject";
import { transferObject } from "../actions/transferObject";
import { BotContext } from "../types";
import { maxChestInventorySlots, maxPlayerInventorySlots } from "../utils/constants";
import { isStackable } from "./blockCategory";

export type InteractWithChestParam = {
  chestCoord: Vec3;
  action: 'withdraw' | 'deposit';
  objectName: ObjectName;
  amount: number;
}

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

  // Check if the object is stackable
  const isItemStackable = await isStackable(objectType);
  const maxPerSlot = isItemStackable ? 99 : 1;

  // Calculate total available items in source slots
  const totalAvailableItems = sourceSlots.reduce((total, slot) => total + slot.amount, 0);

  // Limit the amount to transfer based on available source items
  const actualAmount = Math.min(amount, totalAvailableItems);

  // Get all slots in the target to find empty slots and slots with the same object
  const targetSlots = getAllSlots(targetId, context);

  // Find empty slots in the target
  const occupiedSlotNumbers = new Set(targetSlots.map(slot => slot.slot));
  const emptySlots: number[] = [];

  // Find slots with the same object that aren't full
  const targetSlotsWithSameObject = targetSlots.filter(
    slot => slot.objectType === objectType && slot.amount < maxPerSlot
  );

  // Determine which max slots to use based on the target
  const maxSlots = targetId === chestId ? maxChestInventorySlots : maxPlayerInventorySlots;

  // Find empty slots using the appropriate max slots constant
  for (let i = 0; i < maxSlots; i++) {
    if (!occupiedSlotNumbers.has(i)) {
      emptySlots.push(i);
    }
  }

  // Calculate how many items we can transfer to existing slots with the same object
  let remainingToTransfer = actualAmount;
  const transfers: { slotFrom: number; slotTo: number; amount: number }[] = [];

  // First try to fill existing slots with the same object
  if (isItemStackable && targetSlotsWithSameObject.length > 0) {
    for (const targetSlot of targetSlotsWithSameObject) {
      if (remainingToTransfer <= 0) break;

      const spaceAvailable = maxPerSlot - targetSlot.amount;
      if (spaceAvailable <= 0) continue;

      // Find source slots with items to transfer
      for (const sourceSlot of sourceSlots) {
        if (remainingToTransfer <= 0 || sourceSlot.amount <= 0) break;

        const amountToTransfer = Math.min(remainingToTransfer, sourceSlot.amount, spaceAvailable);
        if (amountToTransfer <= 0) continue;

        transfers.push({
          slotFrom: sourceSlot.slot,
          slotTo: targetSlot.slot,
          amount: amountToTransfer
        });

        // Update tracking variables
        remainingToTransfer -= amountToTransfer;
        sourceSlot.amount -= amountToTransfer;
      }
    }
  }

  // Then use empty slots for remaining items
  if (remainingToTransfer > 0 && emptySlots.length > 0) {
    let emptySlotIndex = 0;

    for (const sourceSlot of sourceSlots) {
      if (remainingToTransfer <= 0 || emptySlotIndex >= emptySlots.length || sourceSlot.amount <= 0) break;

      const amountToTransfer = Math.min(remainingToTransfer, sourceSlot.amount, maxPerSlot);
      if (amountToTransfer <= 0) continue;

      // Make sure we have a valid empty slot
      if (emptySlotIndex < emptySlots.length) {
        transfers.push({
          slotFrom: sourceSlot.slot,
          slotTo: emptySlots[emptySlotIndex]!,  // Use non-null assertion
          amount: amountToTransfer
        });

        // Update tracking variables
        remainingToTransfer -= amountToTransfer;
        sourceSlot.amount -= amountToTransfer;

        // If we filled this slot to capacity and still have items to transfer, move to next empty slot
        if (amountToTransfer === maxPerSlot && sourceSlot.amount > 0) {
          emptySlotIndex++;
        } else if (sourceSlot.amount <= 0) {
          // If we've used all items from this source slot but didn't fill the target slot,
          // we'll still use the same empty slot for the next source
        } else {
          // If we didn't fill the slot and still have items in this source, we're done
          // (this shouldn't happen with our math, but just in case)
          emptySlotIndex++;
        }
      }
    }
  }

  if (transfers.length === 0) {
    console.log(`No available slots in ${action === 'withdraw' ? 'inventory' : 'chest'}`);
    return;
  }

  // Execute the transfer
  await transferObject(sourceId, targetId, transfers, context);

  // Calculate total items transferred
  const totalTransferred = transfers.reduce((total, transfer) => total + transfer.amount, 0);

  console.log(`Successfully ${action === 'withdraw' ? 'withdrew' : 'deposited'} ${totalTransferred} ${param.objectName}`);
}
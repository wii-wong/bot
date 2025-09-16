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

  // console.log(`Source slots:`, sourceSlots);

  if (sourceSlots.length === 0) {
    console.log(`No ${param.objectName} found in ${action === 'withdraw' ? 'chest' : 'inventory'}`);
    return;
  }

  // Check if the object is stackable
  const isItemStackable = await isStackable(objectType);
  const maxPerSlot = isItemStackable ? 99 : 1;

  // Calculate total available items in source slots
  const totalAvailableItems = sourceSlots.reduce((total, slot) => total + slot.amount, 0);

  console.log(`Total available items:`, totalAvailableItems);

  // Limit the amount to transfer based on available source items
  const actualAmount = Math.min(amount, totalAvailableItems);

  console.log(`Actual amount to transfer:`, actualAmount);

  // Get all slots in the target to find empty slots and slots with the same object
  const targetSlots = getAllSlots(targetId, context);
  // console.log(`Target slots:`, targetSlots);

  // Find empty slots in the target
  const occupiedSlotNumbers = new Set(targetSlots.map(slot => slot.slot));
  const emptySlots: number[] = [];

  // Find slots with the same object that aren't full
  const targetSlotsWithSameObject = targetSlots.filter(
    slot => slot.objectType === objectType && slot.amount < maxPerSlot
  );

  // console.log(`Target slots with same object:`, targetSlotsWithSameObject);

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
    // Create a copy of target slots to track remaining space
    const targetSlotSpaces = targetSlotsWithSameObject.map(slot => ({
      slot: slot.slot,
      spaceAvailable: maxPerSlot - slot.amount
    }));

    for (const sourceSlot of sourceSlots) {
      if (remainingToTransfer <= 0 || sourceSlot.amount <= 0) break;

      // Sort target slots by available space (descending) to fill fullest slots first
      targetSlotSpaces.sort((a, b) => b.spaceAvailable - a.spaceAvailable);

      for (const targetSlotSpace of targetSlotSpaces) {
        if (remainingToTransfer <= 0 || sourceSlot.amount <= 0 || targetSlotSpace.spaceAvailable <= 0) break;

        const amountToTransfer = Math.min(remainingToTransfer, sourceSlot.amount, targetSlotSpace.spaceAvailable);
        if (amountToTransfer <= 0) continue;

        console.log(`Transferring ${amountToTransfer} from source slot ${sourceSlot.slot} to target slot ${targetSlotSpace.slot}`);

        transfers.push({
          slotFrom: sourceSlot.slot,
          slotTo: targetSlotSpace.slot,
          amount: amountToTransfer
        });

        // Update tracking variables
        remainingToTransfer -= amountToTransfer;
        sourceSlot.amount -= amountToTransfer;
        targetSlotSpace.spaceAvailable -= amountToTransfer;
      }
    }
  }

  // Then use empty slots for remaining items
  if (remainingToTransfer > 0 && emptySlots.length > 0) {
    // Create a data structure to track the remaining capacity of each empty slot
    const emptySlotSpaces = emptySlots.map(slot => ({
      slot,
      spaceAvailable: maxPerSlot
    }));

    for (const sourceSlot of sourceSlots) {
      if (remainingToTransfer <= 0 || emptySlotSpaces.length === 0) break;
      if (sourceSlot.amount <= 0) continue; // Skip empty source slots

      // Sort empty slots by available space (descending) to fill fullest slots first
      // This helps maximize slot usage efficiency
      emptySlotSpaces.sort((a, b) => b.spaceAvailable - a.spaceAvailable);

      // Get the current empty slot with the most space
      const currentEmptySlot = emptySlotSpaces[0];
      if (!currentEmptySlot || currentEmptySlot.spaceAvailable <= 0) break;

      const amountToTransfer = Math.min(remainingToTransfer, sourceSlot.amount, currentEmptySlot.spaceAvailable);
      if (amountToTransfer <= 0) continue;

      console.log(`Transferring ${amountToTransfer} from source slot ${sourceSlot.slot} to empty slot ${currentEmptySlot.slot}`);
      transfers.push({
        slotFrom: sourceSlot.slot,
        slotTo: currentEmptySlot.slot,
        amount: amountToTransfer
      });

      // Update tracking variables
      remainingToTransfer -= amountToTransfer;
      sourceSlot.amount -= amountToTransfer;
      currentEmptySlot.spaceAvailable -= amountToTransfer;

      // Remove slots that are now full
      if (currentEmptySlot.spaceAvailable <= 0) {
        emptySlotSpaces.shift(); // Remove the first slot which we just filled
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
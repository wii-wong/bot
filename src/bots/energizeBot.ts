import { ObjectName, Vec3 } from "@dust/world/internal";
import { craft } from "../actions/craft";
import { energizeFF } from "../actions/energizeFF";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { mineUntilDestroyedWithTool } from "../actions/mine";
import { findResources } from "../tasks/findResources";
import { InteractWithChest } from "../tasks/InteractWithChest";
import { movePlayer } from "../tasks/movePlayer";
import { BotContext, ObjectCategory, ToleranceType } from "../types";
import { getEnergyPercent } from "../utils/common";
import { CHEST_POSITION, FORCE_FIELD_POSITION, POWER_STONE_POSITION } from "../utils/constants";
import { RECIPE_BATTERY } from "../utils/recipes";

type SearchRegion = {
  topLeftCoord: Vec3;
  bottomRightCoord: Vec3;
}


/// CONSTANTS
const searchRadius = 20;
const searchRegion: SearchRegion = {
  topLeftCoord: [250, 80, -2900],
  bottomRightCoord: [640, 28, -2680],
}
const searchItem: ObjectName = "OakLog";
const toolsAvailble = ["CopperAxe", "WoodenPick"] as ObjectName[];

// Track visited areas and available areas
let visitedAreas: Set<string> = new Set();
let availableAreas: { x: number, z: number }[] | null = null;
let totalAreasCount = 0;

async function getNextArea(context: BotContext): Promise<SearchRegion | undefined> {
  // Get the dimensions of the search region
  const regionWidth = searchRegion.bottomRightCoord[0] - searchRegion.topLeftCoord[0];
  const regionDepth = searchRegion.bottomRightCoord[2] - searchRegion.topLeftCoord[2];

  // Calculate the number of areas in each direction
  const numAreasX = Math.ceil(regionWidth / searchRadius);
  const numAreasZ = Math.ceil(regionDepth / searchRadius);

  // Initialize available areas if not already done
  if (availableAreas === null) {
    availableAreas = [];
    for (let x = 0; x < numAreasX; x++) {
      for (let z = 0; z < numAreasZ; z++) {
        availableAreas.push({ x, z });
      }
    }
    totalAreasCount = availableAreas.length;
  }

  // If we've visited all areas, reset and return undefined
  if (visitedAreas.size >= totalAreasCount) {
    // Reset for next time
    visitedAreas.clear();
    return undefined;
  }

  // Get unvisited areas
  const unvisitedAreas = availableAreas.filter(area =>
    !visitedAreas.has(`${area.x},${area.z}`)
  );

  // This should never happen with our logic, but handle it just in case
  if (unvisitedAreas.length === 0) {
    console.log("No unvisited areas left, but visitedAreas.size < totalAreasCount. This shouldn't happen.");
    visitedAreas.clear();
    return undefined;
  }

  // Randomly select an unvisited area
  const randomIndex = Math.floor(Math.random() * unvisitedAreas.length);
  // We know this is defined because we checked unvisitedAreas.length > 0
  const selectedArea = unvisitedAreas[randomIndex]!;

  // Mark this area as visited
  const areaKey = `${selectedArea.x},${selectedArea.z}`;
  visitedAreas.add(areaKey);

  // Calculate the coordinates for the selected area
  const startX = searchRegion.topLeftCoord[0] + selectedArea.x * searchRadius;
  const startZ = searchRegion.topLeftCoord[2] + selectedArea.z * searchRadius;

  // Calculate end coordinates (ensuring we don't exceed the region boundaries)
  const endX = Math.min(startX + searchRadius, searchRegion.bottomRightCoord[0]);
  const endZ = Math.min(startZ + searchRadius, searchRegion.bottomRightCoord[2]);

  // Create the selected area
  const currentArea: SearchRegion = {
    topLeftCoord: [startX, searchRegion.topLeftCoord[1], startZ],
    bottomRightCoord: [endX, searchRegion.bottomRightCoord[1], endZ]
  };

  console.log(`Selected random area (${selectedArea.x},${selectedArea.z}), ${visitedAreas.size}/${totalAreasCount} areas visited`);

  return currentArea;
}

async function searchResourcesInArea(area: SearchRegion, context: BotContext) {
  // Calculate the center of the area
  const centerX = (area.topLeftCoord[0] + area.bottomRightCoord[0]) / 2;
  const centerY = (area.topLeftCoord[1] + area.bottomRightCoord[1]) / 2;
  const centerZ = (area.topLeftCoord[2] + area.bottomRightCoord[2]) / 2;
  const centerPoint: Vec3 = [centerX, centerY, centerZ];

  // Calculate the radius of the area (half the diagonal distance)
  const width = area.bottomRightCoord[0] - area.topLeftCoord[0];
  const height = area.bottomRightCoord[1] - area.topLeftCoord[1];
  const depth = area.bottomRightCoord[2] - area.topLeftCoord[2];
  const areaRadius = Math.sqrt(width * width + height * height + depth * depth) / 2;

  console.log(`Searching in centerPoint: ${centerPoint}, areaRadius: ${areaRadius}`);

  // Add timeout mechanism for findResources
  try {
    // Create a promise that rejects after 2 minutes (120000ms)
    const timeoutPromise = new Promise<Vec3[]>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('findResources timeout: exceeded 1 minute'));
      }, 2 * 60 * 1000);

      // Clear the timeout if it's not needed
      return () => clearTimeout(timeoutId);
    });

    // Race between the findResources call and the timeout
    return await Promise.race([
      findResources([searchItem], areaRadius, context, {
        originPos: centerPoint,
        filterObjectCategories: [ObjectCategory.Reachable]
      }),
      timeoutPromise
    ]);
  } catch (error) {
    // Handle the unknown error type properly
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Skipping area due to timeout: ${errorMessage}`);
    return []; // Return empty array to skip this area
  }
}

/**
 * Takes tools from the chest based on the toolsAvailble array
 * Limits the total number of tools to 20
 */
async function takeTools(context: BotContext): Promise<void> {
  // Get all available tools from the chest based on toolsAvailble array
  // Limit to 20 tools total across all tool types
  await movePlayer(CHEST_POSITION, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava"],
  });

  console.log("Getting tools from chest...");
  const maxTotalTools = 20;
  let toolsCollected = 0;

  for (const tool of toolsAvailble) {
    if (toolsCollected >= maxTotalTools) {
      break;
    }

    const remainingTools = maxTotalTools - toolsCollected;
    console.log(`Trying to get ${tool} from chest (up to ${remainingTools} more tools)...`);

    await InteractWithChest({
      chestCoord: CHEST_POSITION,
      action: 'withdraw',
      objectName: tool,
      amount: remainingTools
    }, context);

    // Count how many tools we got
    const toolSlotsForType = getSlotsWithObject(context.player.entityId, getObjectTypeId(tool), context);
    toolsCollected += toolSlotsForType.length;
    console.log(`Now have ${toolsCollected} tools total`);
  }
}

/**
 * Returns all tools to the chest
 * @param context The bot context
 */
async function returnToolsToChest(context: BotContext): Promise<void> {
  console.log("Returning tools to chest...");

  // Move to chest position first
  await movePlayer(CHEST_POSITION, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava"],
  });

  // Return all tools from toolsAvailble array
  for (const tool of toolsAvailble) {
    console.log(`Returning ${tool} to chest...`);

    // Get all slots with this tool
    const toolSlotsForType = getSlotsWithObject(context.player.entityId, getObjectTypeId(tool), context);

    if (toolSlotsForType.length > 0) {
      await InteractWithChest({
        chestCoord: CHEST_POSITION,
        action: 'deposit',
        objectName: tool,
        amount: toolSlotsForType.length
      }, context);
    }
  }
}

/**
 * Chops logs in the specified areas
 * Stops when out of tools or energy is too low
 * @param context The bot context
 */
async function chopLogs(context: BotContext): Promise<void> {
  let currentArea = await getNextArea(context);

  // Continue mining until we run out of energy or areas
  while (currentArea) {
    // Get resource positions in the current area
    const resourcePoints = await searchResourcesInArea(currentArea, context);
    console.log(`Found ${resourcePoints.length} resources in current area`);

    // Mine each resource in the area
    for (const point of resourcePoints) {
      // Check energy level
      const energyPercent = getEnergyPercent(await context.player.getEnergy());
      console.log("Energy percent: ", energyPercent);

      // If energy is too low, break the loop
      if (energyPercent <= 5) {
        console.log("Energy too low, stopping mining");
        return;
      }

      // Move to the resource
      const success = await movePlayer(point, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava"],
        maxLoop: 10000,
      });

      // If movement failed, skip this resource
      if (!success) {
        console.log("Failed to move to resource, skipping");
        continue;
      }

      // Check for available tools before mining
      // Get all tools from player inventory based on toolsAvailble array
      let toolSlots = [];
      for (const tool of toolsAvailble) {
        const toolSlotsForType = getSlotsWithObject(context.player.entityId, getObjectTypeId(tool), context);
        toolSlots.push(...toolSlotsForType);
      }

      // If no tools available, stop mining
      if (toolSlots.length === 0) {
        console.log("No tools available, stopping mining");
        return;
      }

      // Use the first available tool
      const toolSlot = toolSlots[0]?.slot;
      if (toolSlot !== undefined) {
        await mineUntilDestroyedWithTool(point, toolSlot, context);
      } else {
        console.log("No valid tool slot found, stopping mining");
        return;
      }
    }

    // Check energy again after mining the area
    const energyPercent = getEnergyPercent(await context.player.getEnergy());
    if (energyPercent <= 5) {
      console.log("Energy too low after mining area, stopping");
      return;
    }

    // Get the next area
    currentArea = await getNextArea(context);
  }
}

export async function makeBatteryAndEnergizeFF(context: BotContext): Promise<boolean> {
  await movePlayer(POWER_STONE_POSITION, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava"],
  });

  const objectType = getObjectTypeId(searchItem);
  const slots = getSlotsWithObject(context.player.entityId, objectType, context);
  console.log('slots: ', slots);
  for (const recipe of RECIPE_BATTERY) {
    if (recipe.inputs?.[0]?.[0] != 'AnyLog') {
      continue;
    }
    let inputCnt = 0;
    for (const slot of slots) {
      inputCnt += slot.amount;
    }
    if (inputCnt < recipe.inputs?.[0]?.[1]) {
      continue;
    }

    // Check if the total amount exceeds the recipe requirement
    const requiredAmount = recipe.inputs?.[0]?.[1];
    if (inputCnt > requiredAmount) {
      // Create adjusted slots that sum to exactly the required amount
      const adjustedSlots = [];
      let remainingAmount: number = requiredAmount as number;

      for (const slot of slots) {
        if (remainingAmount <= 0) break;

        const amountToUse = Math.min(slot.amount, remainingAmount);
        adjustedSlots.push({
          slot: slot.slot,
          amount: amountToUse
        });

        remainingAmount -= amountToUse;
      }

      if (remainingAmount > 0) {
        console.log('not enough resources');
        return false;
      }

      await craft(POWER_STONE_POSITION, recipe, adjustedSlots, context);
      return true;
    } else {
      // Use all slots as is since the total amount equals the requirement
      await craft(POWER_STONE_POSITION, recipe, slots, context);
      return true;
    }
  }

  const batterySlots = getSlotsWithObject(context.player.entityId, getObjectTypeId("Battery"), context);
  if (batterySlots.length == 0) {
    console.log('no battery found');
    return false;
  }

  await movePlayer(FORCE_FIELD_POSITION, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava"],
  });

  await energizeFF(FORCE_FIELD_POSITION, batterySlots, context);
  return true;
}

export async function energizeBot(context: BotContext) {
  // Step 1: Get tools from chest
  await takeTools(context);

  // Step 2: Main mining loop
  await chopLogs(context);

  // Step 3: Make battery and energize force field
  while (await makeBatteryAndEnergizeFF(context)) {
  }

  // Step 4: Return all tools to the chest
  await returnToolsToChest(context);
}


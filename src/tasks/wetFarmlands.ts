import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { wetFarmland } from "../actions/wetFarmland";
import { BotContext, ToleranceType } from "../types";
import { FARMLAND_CENTER_POSITION } from "../utils/constants";
import { findResources } from "./findResources";
import { movePlayer } from "./movePlayer";

export async function wetFarmlands(context: BotContext) {
  const { player, stashResult } = context;

  const waterBuckets = getSlotsWithObject(
    player.entityId,
    getObjectTypeId('WaterBucket'),
    context
  );

  const farmlands = await findResources(
    ["Farmland"],
    15,
    context,
    { originPos: FARMLAND_CENTER_POSITION }
  );
  if (farmlands.length === 0) {
    console.warn("No farmlands found to wet.");
    return;
  }

  console.log(`Wetting ${farmlands.length} farmlands...`);

  for (const farmland of farmlands) {
    const waterBucket = waterBuckets.shift();
    if (waterBucket === undefined) {
      console.warn(`No water buckets left to fill farmlands at ${farmland}.`);
      return;
    }

    // Check the distance to the resource
    // Move player near the farmland position if needed
    const playerPost = await context.player.getPos();
    const distanceToPos = Math.sqrt(
      Math.pow(playerPost[0] - farmland[0], 2) +
      Math.pow(playerPost[1] - farmland[1], 2) +
      Math.pow(playerPost[2] - farmland[2], 2)
    );

    // Move to the resource
    let moveSuccess = true;
    if (distanceToPos > 5) {
      moveSuccess = await movePlayer(farmland, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava", "Water"],
        maxLoop: 10000,
      });
    }

    // If movement failed, skip this resource
    if (!moveSuccess) {
      console.log("Failed to move to resource, skipping");
      continue;
    }

    await wetFarmland(
      player.entityId,
      farmland,
      waterBucket.slot,
      stashResult
    );
  }

  console.log("All farmlands wet!");
}


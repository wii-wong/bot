import { isFullyGrown } from "../actions/isFullyGrown";
import { mineUntilDestroyed } from "../actions/mine";
import { BotContext, ToleranceType } from "../types";
import { publicClient } from "../utils/chain";
import { FARMLAND_CENTER_POSITION } from "../utils/constants";
import { findResources } from "./findResources";
import { movePlayer } from "./movePlayer";

export async function harvestSeeds(context: BotContext) {
  const { player, stashResult } = context;

  const wheatSeeds = await findResources(
    ["WheatSeed"],
    15,
    context,
    { originPos: FARMLAND_CENTER_POSITION }
  );
  if (wheatSeeds.length === 0) {
    console.warn("No wheat seeds found to harvest.");
    return;
  }
  const latestBlock = await publicClient.getBlock({
    blockTag: "latest",
  });

  for (const wheatSeed of wheatSeeds) {
    const isFullyGrow = await isFullyGrown(wheatSeed, latestBlock.timestamp);
    if (!isFullyGrow) {
      console.warn(`Wheat at ${wheatSeed} is not fully grown yet.`);
      continue;
    }

    // Check the distance to the resource
    // Move player near the farmland position if needed
    const playerPost = await context.player.getPos();
    const distanceToPos = Math.sqrt(
      Math.pow(playerPost[0] - wheatSeed[0], 2) +
      Math.pow(playerPost[1] - wheatSeed[1], 2) +
      Math.pow(playerPost[2] - wheatSeed[2], 2)
    );

    // Move to the resource
    let moveSuccess = true;
    if (distanceToPos > 5) {
      moveSuccess = await movePlayer(wheatSeed, context, {
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

    await mineUntilDestroyed(wheatSeed, context);
  }
}



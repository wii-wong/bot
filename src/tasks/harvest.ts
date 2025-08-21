import {
  objectsByName
} from "@dust/world/internal";
import { harvestSeed } from "../actions/harvestSeed";
import { isFullyGrown } from "../actions/isFullyGrown";
import { BotContext } from "../bots/farmingBot";
import { publicClient } from "../utils/chain";
import { lowerFarmCoord, upperFarmCoord } from "../utils/constants";
import { getObjectsInArea } from "./getObjectsInArea";

export async function harvestSeeds({ player, stashResult }: BotContext) {
  const wheatSeeds = await getObjectsInArea(
    lowerFarmCoord,
    upperFarmCoord,
    objectsByName.WheatSeed.id
  );
  if (wheatSeeds.length === 0) {
    console.warn("No wheat seeds found to harvest.");
    return;
  }
  const latestBlock = await publicClient.getBlock({
    blockTag: "latest",
  });

  const promises = [];
  for (const wheatSeed of wheatSeeds) {
    const isFullyGrow = await isFullyGrown(wheatSeed, latestBlock.timestamp);
    if (!isFullyGrow) {
      // console.warn(`Wheat at ${wheatSeed} is not fully grown yet.`);
      continue;
    }
    const promise = harvestSeed(player.entityId, wheatSeed, stashResult);
    promises.push(promise);
  }
  if (promises.length === 0) {
    console.warn("No wheat was harvested.");
    return;
  }

  await Promise.all(promises);
}



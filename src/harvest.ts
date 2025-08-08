import {
  encodeBlock,
  objectsByName,
  packVec3,
  Vec3,
} from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { BotContext } from "./bot";
import { publicClient, worldContract } from "./chain";
import { lowerFarmCoord, upperFarmCoord } from "./constants";
import { getObjectsInArea } from "./getObjectsInArea";
import { stash, tables } from "./stash";

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

  await Promise.all(promises);
}

async function harvestSeed(
  caller: Hex,
  wheatPos: Vec3,
  stashResult: SyncToStashResult
) {
  console.log(`Harvesting wheat at ${wheatPos}`);
  const txHash = await worldContract.write.mine([
    caller,
    packVec3(wheatPos),
    "0x",
  ]);
  await stashResult.waitForTransaction(txHash);
  console.log(`Harvested wheat at ${wheatPos}, txHash: ${txHash}`);
}

async function isFullyGrown(
  wheatSeed: Vec3,
  latestTimestamp: bigint
): Promise<boolean> {
  const seedGrowthRecord = stash.getRecord({
    table: tables.SeedGrowth,
    key: { entityId: encodeBlock(wheatSeed) },
  });
  if (!seedGrowthRecord) {
    return true;
  }
  return seedGrowthRecord.fullyGrownAt < latestTimestamp;
}

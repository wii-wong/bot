import { objectsByName, packVec3, Vec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { BotContext } from "./bot";
import { worldContract } from "./chain";
import { waterCoord } from "./constants";
import { getSlotsWithObject } from "./getSlotsWithObject";

export async function fillBuckets({ player, stashResult }: BotContext) {
  const emptyBuckets = getSlotsWithObject(
    player.entityId,
    objectsByName.Bucket.id
  );
  if (emptyBuckets.length === 0) {
    console.warn("No empty buckets found in inventory.");
    return;
  }

  console.log(`Filling ${emptyBuckets.length} buckets...`);
  const promises = [];
  for (const { slot } of emptyBuckets) {
    const promise = fillBucket(player.entityId, waterCoord, slot, stashResult);
    promises.push(promise);
  }
  await Promise.all(promises);
  console.log("All buckets filled!");
}

async function fillBucket(
  caller: Hex,
  waterCoord: Vec3,
  slot: number,
  stashResult: SyncToStashResult
) {
  console.log(`Filling bucket in slot ${slot}`);
  const txHash = await worldContract.write.fillBucket([
    caller,
    packVec3(waterCoord),
    slot,
  ]);
  console.log(`Bucket filled in slot ${slot}, txHash: ${txHash}`);
  await stashResult.waitForTransaction(txHash);
}

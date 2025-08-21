import { objectsByName } from "@dust/world/internal";
import { fillBucket } from "../actions/fillBucket";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext } from "../bots/farmingBot";
import { waterCoord } from "../utils/constants";

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

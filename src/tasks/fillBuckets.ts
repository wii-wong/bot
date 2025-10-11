import { fillBucket } from "../actions/fillBucket";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext, ToleranceType } from "../types";
import { waterCoord } from "../utils/constants";
import { movePlayer } from "./movePlayer";

export async function fillBuckets(context: BotContext) {
  await movePlayer(waterCoord, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava", "Water"],
  });

  const emptyBuckets = getSlotsWithObject(
    context.player.entityId,
    getObjectTypeId('Bucket'),
    context
  );
  if (emptyBuckets.length === 0) {
    console.warn("No empty buckets found in inventory.");
    return;
  }

  console.log(`Filling ${emptyBuckets.length} buckets...`);
  for (const { slot } of emptyBuckets) {
    await fillBucket(waterCoord, slot, context);
  }
  console.log("All buckets filled!");
}

import { bringItems } from "../tasks/bringItems";
import { fillBuckets } from "../tasks/fillBuckets";
import { plantSeeds } from "../tasks/plantSeeds";
import { returnItems } from "../tasks/returnItems";
import { wetFarmlands } from "../tasks/wetFarmlands";
import { BotContext } from "../types";
import { BUCKET_CHEST_POSITION, SEEDS_CHEST_POSITION } from "../utils/constants";

export async function farmingBot(context: BotContext) {
  await bringItems({
    maxTotalItem: 40,
    itemName: 'Bucket',
    chestCoord: BUCKET_CHEST_POSITION
  }, context);

  await bringItems({
    maxTotalItem: 40,
    itemName: 'WaterBucket',
    chestCoord: BUCKET_CHEST_POSITION
  }, context);

  await bringItems({
    maxTotalItem: 40,
    itemName: 'WheatSeed',
    chestCoord: SEEDS_CHEST_POSITION
  }, context);

  await fillBuckets(context);

  await wetFarmlands(context);

  await plantSeeds(context);

  await returnItems({
    chestCoord: BUCKET_CHEST_POSITION,
    itemName: 'Bucket',
  }, context);

  await returnItems({
    chestCoord: BUCKET_CHEST_POSITION,
    itemName: 'WaterBucket',
  }, context);

  await returnItems({
    chestCoord: SEEDS_CHEST_POSITION,
    itemName: 'WheatSeed',
  }, context);
}


import { objectsByName } from "@dust/world/internal";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { wetFarmland } from "../actions/wetFarmland";
import { BotContext } from "../types";
import { lowerFarmCoord, upperFarmCoord } from "../utils/constants";
import { getOnAirObjectsInArea } from "./findObjects";

export async function wetFarmlands({ player, stashResult }: BotContext) {
  const waterBuckets = getSlotsWithObject(
    player.entityId,
    objectsByName.WaterBucket.id
  );

  const farmlands = await getOnAirObjectsInArea(
    lowerFarmCoord,
    upperFarmCoord,
    objectsByName.Farmland.id
  );
  if (farmlands.length === 0) {
    console.warn("No farmlands found to wet.");
    return;
  }

  console.log(`Wetting ${farmlands.length} farmlands...`);

  const promises = [];
  for (const farmland of farmlands) {
    const waterBucket = waterBuckets.shift();
    if (waterBucket === undefined) {
      console.warn(`No water buckets left to fill farmlands at ${farmland}.`);
      return;
    }
    const promise = wetFarmland(
      player.entityId,
      farmland,
      waterBucket.slot,
      stashResult
    );
    promises.push(promise);
  }

  await Promise.all(promises);

  console.log("All farmlands wet!");
}


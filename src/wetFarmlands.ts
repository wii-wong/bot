import { objectsByName, packVec3, Vec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { worldContract } from "./chain";
import { lowerFarmCoord, upperFarmCoord } from "./constants";
import { getObjectsInArea } from "./getObjectsInArea";
import { PlayerInfo } from "./getPlayerInfo";
import { getSlotsWithObject } from "./getSlotsWithObject";

export async function wetFarmlands({
  player,
  stashResult,
}: {
  player: PlayerInfo;
  stashResult: SyncToStashResult;
}) {
  const waterBuckets = getSlotsWithObject(
    player.entityId,
    objectsByName.WaterBucket.id
  );

  const farmlands = await getObjectsInArea(
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

async function wetFarmland(
  caller: Hex,
  farmland: Vec3,
  waterBucket: number,
  stashResult: SyncToStashResult
) {
  console.log(
    `Wetting farmland at ${farmland} with bucket in slot ${waterBucket}`
  );
  const txHash = await worldContract.write.wetFarmland([
    caller,
    packVec3(farmland),
    waterBucket,
  ]);
  await stashResult.waitForTransaction(txHash);
  console.log(`Farmland at ${farmland} wet, txHash: ${txHash}`);
}

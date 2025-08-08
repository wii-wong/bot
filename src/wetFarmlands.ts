import { objectsByName, packVec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
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

  for (const farmland of farmlands) {
    const waterBucket = waterBuckets.shift();
    if (waterBucket === undefined) {
      console.warn(`No water buckets left to fill farmlands at ${farmland}.`);
      return;
    }
    console.log(
      `Wetting farmland at ${farmland} with bucket in slot ${waterBucket.slot}`
    );
    const txHash = await worldContract.write.wetFarmland([
      player.entityId,
      packVec3(farmland),
      waterBucket.slot,
    ]);
    await stashResult.waitForTransaction(txHash);
    console.log(`Farmland at ${farmland} wet, txHash: ${txHash}`);
  }

  console.log("All farmlands wet!");
}

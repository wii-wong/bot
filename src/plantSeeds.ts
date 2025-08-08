import { objectsByName, packVec3, Vec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { worldContract } from "./chain";
import { lowerFarmCoord, upperFarmCoord } from "./constants";
import { getObjectsInArea } from "./getObjectsInArea";
import { getObjectTypeAt } from "./getObjectTypeAt";
import { PlayerInfo } from "./getPlayerInfo";
import { getSlotsWithObject } from "./getSlotsWithObject";

export async function plantSeeds({
  player,
  stashResult,
}: {
  player: PlayerInfo;
  stashResult: SyncToStashResult;
}) {
  const seeds = getSlotsWithObject(player.entityId, objectsByName.WheatSeed.id);
  if (seeds.length === 0) {
    console.warn("No seeds found in inventory.");
    return;
  }
  console.log(
    `Planting ${seeds.reduce((total, seed) => total + seed.amount, 0)} seeds...`
  );
  const wetFarmlands = await getObjectsInArea(
    lowerFarmCoord,
    upperFarmCoord,
    objectsByName.WetFarmland.id
  );
  if (wetFarmlands.length === 0) {
    console.warn("No wet farmlands found to plant seeds.");
    return;
  }

  const promises = [];
  for (const wetFarmland of wetFarmlands) {
    const seed = seeds.at(0);
    if (!seed) {
      console.warn("No seeds left to plant.");
      break;
    }

    const plantPos: Vec3 = [wetFarmland[0], wetFarmland[1] + 1, wetFarmland[2]];
    const objectType = await getObjectTypeAt(plantPos);
    if (objectType !== objectsByName.Air.id) {
      console.warn(
        `Cannot plant seed at ${plantPos} because it is occupied by object type ${objectType}`
      );
      continue;
    }

    const promise = plantSeed(
      player.entityId,
      plantPos,
      seed.slot,
      stashResult
    );
    promises.push(promise);

    seed.amount -= 1;
    if (seed.amount === 0) {
      seeds.shift(); // Remove the seed slot if no more seeds left
    }
  }

  await Promise.all(promises);

  console.log("Seeds planted!");
}

async function plantSeed(
  caller: Hex,
  plantPos: Vec3,
  seed: number,
  stashResult: SyncToStashResult
) {
  console.log(`Planting seed at ${plantPos} with slot ${seed}`);
  const txHash = await worldContract.write.build([
    caller,
    packVec3(plantPos),
    seed,
    "0x",
  ]);
  await stashResult.waitForTransaction(txHash);
  console.log(
    `Planted seed at ${plantPos} with slot ${seed}, txHash: ${txHash}`
  );
}

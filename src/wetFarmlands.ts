import { objectsByName, packVec3, Vec3 } from "@dust/world/internal";
import mudConfig from "@dust/world/mud.config";
import { worldContract } from "./chain";
import { getObjectTypeAt } from "./getObjectTypeAt";
import { maxPlayerInventorySlots, PlayerInfo } from "./getPlayerInfo";
import { stash } from "./stash";

export async function wetFarmlands(player: PlayerInfo) {
  console.log("Wet farmlands...");

  const waterBucketSlots: number[] = [];

  for (let i = 0; i < maxPlayerInventorySlots; i++) {
    const inventorySlot = stash.getRecord({
      table: mudConfig.tables.InventorySlot,
      key: {
        owner: player.entityId,
        slot: i,
      },
    });
    if (inventorySlot?.objectType !== objectsByName.WaterBucket.id) {
      continue;
    }
    waterBucketSlots.push(i);
  }

  const lowerCoord: Vec3 = [883, 62, -1367];
  const upperCoord: Vec3 = [892, 62, -1362];
  for (let x = lowerCoord[0]; x <= upperCoord[0]; x++) {
    for (let y = lowerCoord[1]; y <= upperCoord[1]; y++) {
      for (let z = lowerCoord[2]; z <= upperCoord[2]; z++) {
        const coord: Vec3 = [x, y, z];
        const objectType = await getObjectTypeAt(coord);
        if (objectType !== objectsByName.Farmland.id) {
          continue;
        }
        const waterBucketSlot = waterBucketSlots.shift();
        if (waterBucketSlot === undefined) {
          console.warn(`No water buckets left to fill farmlands at ${coord}.`);
          return;
        }
        console.log(
          `Wetting farmland at ${coord} with bucket in slot ${waterBucketSlots[0]}`
        );
        const txHash = await worldContract.write.wetFarmland([
          player.entityId,
          packVec3(coord),
          waterBucketSlot,
        ]);
        console.log(`Farmland at ${coord} wet, txHash: ${txHash}`);
      }
    }
  }

  console.log("All farmlands wet!");
}

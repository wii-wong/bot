import { objectsByName, packVec3, Vec3 } from "@dust/world/internal";
import mudConfig from "@dust/world/mud.config";
import { worldContract } from "./chain";
import { maxPlayerInventorySlots, PlayerInfo } from "./getPlayerInfo";
import { stash } from "./stash";

export async function fillBuckets(player: PlayerInfo) {
  console.log("Filling buckets...");

  const waterCoord: Vec3 = [888, 62, -1361];

  for (let i = 0; i < maxPlayerInventorySlots; i++) {
    const inventorySlot = stash.getRecord({
      table: mudConfig.tables.InventorySlot,
      key: {
        owner: player.entityId,
        slot: i,
      },
    });
    if (inventorySlot?.objectType !== objectsByName.Bucket.id) {
      continue;
    }
    console.log(`Filling bucket in slot ${i}`);
    const txHash = await worldContract.write.fillBucket([
      player.entityId,
      packVec3(waterCoord),
      i,
    ]);
    console.log(`Bucket filled in slot ${i}, txHash: ${txHash}`);
  }
  console.log("All buckets filled!");
}

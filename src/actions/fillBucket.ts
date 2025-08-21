import { packVec3, Vec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { worldContract } from "../utils/chain";

export async function fillBucket(
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

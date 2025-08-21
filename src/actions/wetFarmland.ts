import { packVec3, Vec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { worldContract } from "../utils/chain";

export async function wetFarmland(
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
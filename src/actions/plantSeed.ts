import { Vec3, packVec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { worldContract } from "../utils/chain";

export async function plantSeed(
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
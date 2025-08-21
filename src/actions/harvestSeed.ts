import {
    packVec3,
    Vec3,
} from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";
import { worldContract } from "../utils/chain";

export async function harvestSeed(
  caller: Hex,
  wheatPos: Vec3,
  stashResult: SyncToStashResult
) {
  console.log(`Harvesting wheat at ${wheatPos}`);
  const txHash = await worldContract.write.mine([
    caller,
    packVec3(wheatPos),
    "0x",
  ]);
  await stashResult.waitForTransaction(txHash);
  console.log(`Harvested wheat at ${wheatPos}, txHash: ${txHash}`);
}
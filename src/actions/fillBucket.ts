import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";

export async function fillBucket(
  waterCoord: Vec3,
  slot: number,
  context: BotContext
) {
  console.log(`Filling bucket in slot ${slot}`);
  const txHash = await worldContract.write.fillBucket([
    context.player.entityId,
    packVec3(waterCoord),
    slot,
  ]);
  console.log(`Bucket filled in slot ${slot}, txHash: ${txHash}`);
  await context.stashResult.waitForTransaction(txHash);
}

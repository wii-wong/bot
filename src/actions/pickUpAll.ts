import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";

export async function pickUpAll(
  position: Vec3,
  context: BotContext
) {
  const txHash = await worldContract.write.pickupAll([
    context.player.entityId,
    packVec3(position)
  ]);
  await context.stashResult.waitForTransaction(txHash);
}
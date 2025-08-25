import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { walletClient, worldContract } from "../utils/chain";
import { getPlayerInfo } from "./getPlayerInfo";

export async function pickUpAll(
  position: Vec3,
  context: BotContext
) {
  const playerRealPos = (await getPlayerInfo(walletClient.account.address)).pos;

  const txHash = await worldContract.write.pickupAll([
    context.player.entityId,
    packVec3(position)
  ]);
  await context.stashResult.waitForTransaction(txHash);
}
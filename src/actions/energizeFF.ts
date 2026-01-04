import { encodeBlock, Vec3 } from "@dust/world/internal";
import { BotContext, SlotAmount } from "../types";
import { worldContract } from "../utils/chain";
import { PLAYER_ACTION_DELAY } from "../utils/constants";

export async function energizeFF(
  forcefield: Vec3,
  slots: SlotAmount[],
  context: BotContext
) {
  console.log(`Filling bucket in slot ${slots}`);
  const txHash = await worldContract.write.energizeMachine([
    context.player.entityId,
    encodeBlock(forcefield),
    slots,
    "0x00",
  ]);
  console.log(`Energizing forcefield in slot ${slots}, txHash: ${txHash}`);
  await context.stashResult.waitForTransaction(txHash);
  await new Promise(resolve => setTimeout(resolve, PLAYER_ACTION_DELAY));
}

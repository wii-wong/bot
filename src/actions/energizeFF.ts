import { encodeBlock, Vec3 } from "@dust/world/internal";
import { BotContext, SlotAmount } from "../types";
import { worldContract } from "../utils/chain";

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
}

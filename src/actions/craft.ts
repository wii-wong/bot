import { encodeBlock, Vec3 } from "@dust/world/internal";
import { BotContext, SlotAmount } from "../types";
import { worldContract } from "../utils/chain";

export async function craft(
  context: BotContext,
  recipe 
  slots: SlotAmount[]
) {
  console.log(`Filling bucket in slot ${slots}`);
  const txHash = await worldContract.write.craftWithStation([
    context.player.entityId,
    encodeBlock(station),
    recipeId,
    slots,
  ]);
  console.log(`Bucket filled in slot ${slots}, txHash: ${txHash}`);
  await stashResult.waitForTransaction(txHash);
}

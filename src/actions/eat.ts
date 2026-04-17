import { BotContext } from "../types";
import { worldContract } from "../utils/chain";

export async function eat(
  slot: number,
  amount: number,
  context: BotContext
) {
  console.log(`Eating ${amount} food from slot ${slot}`);
  const txHash = await worldContract.write.eat([
    context.player.entityId,
    { slot, amount },
  ]);
  await context.stashResult.waitForTransaction(txHash);
}

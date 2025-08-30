import { Hex } from "viem";
import { BotContext, SlotTransfer } from "../types";
import { worldContract } from "../utils/chain";

export async function transferObject(
  from: Hex,
  to: Hex,
  transfers: SlotTransfer[],
  context: BotContext
) {
  const txHash = await worldContract.write.transfer([
    context.player.entityId,
    from,
    to,
    transfers,
    "0x0"
  ]);
  console.log(`Transfered, txHash: ${txHash}`);
  await context.stashResult.waitForTransaction(txHash);
}

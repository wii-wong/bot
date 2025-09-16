import { encodeBlock, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";

export async function detachProgram(
  chestCoord: Vec3,
  context: BotContext
) {
  const txHash = await worldContract.write.detachProgram([
    context.player.entityId,
    encodeBlock(chestCoord),
    "0x00",
  ]);
  console.log(`detachProgram, txHash: ${txHash}`);
  await context.stashResult.waitForTransaction(txHash);
}

import { encodeBlock, Vec3 } from "@dust/world/internal";
import { Hex } from "viem";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";

export async function updateProgram(
  chestCoord: Vec3,
  programId: Hex,
  context: BotContext
) {
  const txHash = await worldContract.write.updateProgram([
    context.player.entityId,
    encodeBlock(chestCoord),
    programId,
    "0x00",
  ]);
  console.log(`updateProgram, txHash: ${txHash}`);
  await context.stashResult.waitForTransaction(txHash);
}

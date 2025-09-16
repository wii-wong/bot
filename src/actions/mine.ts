import { packVec3, Vec3, voxelToChunkPos } from "@dust/world/internal";
import { BotContext, WriteContractOptions } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";
import { CHUNK_COMMITMENT_DELAY_TIME } from "../utils/constants";
import { getObjectName, getObjectTypeAt } from "./getObjectTypeAt";

export async function mineUntilDestroyed(
  position: Vec3,
  context: BotContext
) {
  console.log(
    `Mining ${position}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}, object is ${getObjectName(await getObjectTypeAt(position))}`
  );
  const txHash = await worldContract.write.mineUntilDestroyed([
    context.player.entityId,
    packVec3(position),
    "0x0"
  ]);
  await context.stashResult.waitForTransaction(txHash);
}

export async function mineUntilDestroyedWithTool(
  position: Vec3,
  slot: number,
  context: BotContext,
  options?: WriteContractOptions
) {
  const waitForTransaction = options?.waitForTransaction ?? true;

  console.log(
    `Mining ${position}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}, object is ${getObjectName(await getObjectTypeAt(position))}`
  );
  try {
    const txHash = await worldContract.write.mineUntilDestroyed([
      context.player.entityId,
      packVec3(position),
      slot,
      "0x0"
    ]);
    if (waitForTransaction) {
      await context.stashResult.waitForTransaction(txHash);
    }
  } catch (error) {
    console.log("Mine failed!");

    // Check if error is "Chunk commitment expired"
    if (error instanceof Error && error.message.includes("Chunk commitment expired")) {
      console.log("Chunk commitment expired, recommitting chunk and retrying...");
      // Call chunkCommit and then retry
      const commitTxHash = await worldContract.write.chunkCommit([
        context.player.entityId,
        packVec3(voxelToChunkPos(position)),
      ]);
      await context.stashResult.waitForTransaction(commitTxHash);

      // Wait for chunk commit to be processed (sleep for 1 block of chain)
      await new Promise((resolve) => setTimeout(resolve, CHUNK_COMMITMENT_DELAY_TIME));

      // Retry mining
      return mineUntilDestroyedWithTool(position, slot, context);
    }
  }
}

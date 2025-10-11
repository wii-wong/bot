import { packVec3, Vec3, voxelToChunkPos } from "@dust/world/internal";
import { BotContext, WriteContractOptions } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";
import { CHUNK_COMMITMENT_DELAY_TIME } from "../utils/constants";
import { getObjectName, getObjectTypeAt } from "./getObjectTypeAt";

export async function mineUntilDestroyed(
  position: Vec3,
  context: BotContext,
  options?: WriteContractOptions
) {
  await mineUntilDestroyedWithTool(position, 10000, context, options);
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
    if (error instanceof Error && (error.message.includes("Chunk commitment expired") || error.message.includes("No chunk commitment"))) {
      console.log("Chunk commitment expired, recommitting chunk and retrying...");
      // Call chunkCommit and then retry
      try {
        const commitTxHash = await worldContract.write.initChunkCommit([
          context.player.entityId,
          packVec3(voxelToChunkPos(position)),
        ]);
        await context.stashResult.waitForTransaction(commitTxHash);
      } catch (e) { }

      // Wait for chunk commit to be processed (sleep for 1 block of chain)
      await new Promise((resolve) => setTimeout(resolve, CHUNK_COMMITMENT_DELAY_TIME));

      const drand = await fetch("https://api.drand.sh/v2/beacons/evmnet/rounds/latest");
      const drandJson = await drand.json();

      const commitTxHash = await worldContract.write.fulfillChunkCommit([
        packVec3(voxelToChunkPos(position)),
        {
          signature: [BigInt(`0x${(drandJson.signature as string).substring(0, 64)}`), BigInt(`0x${(drandJson.signature as string).substring(64)}`)],
          roundNumber: BigInt(drandJson.round as number),
        }
      ]);
      await context.stashResult.waitForTransaction(commitTxHash);

      await new Promise((resolve) => setTimeout(resolve, CHUNK_COMMITMENT_DELAY_TIME));

      // Retry mining
      return mineUntilDestroyedWithTool(position, slot, context);
    }
  }
}
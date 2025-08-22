import { packVec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { publicClient, worldContract } from "../utils/chain";

export async function randomSpawn(
  context: BotContext
) {
  // Check if player has not died (energy is not 0)
  if (context.player.getEnergy() !== 0n) {
    throw new Error("Player has not died, spawn is not allowed!");
  }

  let attempts = 0;
  const maxAttempts = 10;
  let txHash: `0x${string}` | undefined;

  while (attempts < maxAttempts) {
    try {
      txHash = await worldContract.write.randomSpawn([
        (await publicClient.getBlockNumber()) - 2n,
        packVec3(context.player.pos),
      ]);
      console.log(
        `Random spawn txHash: ${txHash}`
      );
      break; // Success, exit the loop
    } catch (error: any) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} failed: ${error.message || 'Unknown error'}`);

      if (attempts >= maxAttempts) {
        throw new Error(`Failed to random spawn after ${maxAttempts} attempts`);
      }
    }
  }

  if (!txHash) {
    throw new Error("Failed to get transaction hash");
  }

  await context.stashResult.waitForTransaction(txHash);
  // await new Promise(resolve => setTimeout(resolve, MOCK_TX_AWAIT_TIME));
  console.log(
    `Random spawn done`
  );
}
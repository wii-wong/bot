import { encodeBlock, packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { publicClient, worldContract } from "../utils/chain";
import { MAX_PLAYER_ENERGY } from "../utils/constants";

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
        packVec3(await context.player.getPos()),
      ]);
      console.log(
        `Random spawn txHash: ${txHash}`
      );
      break; // Success, exit the loop
    } catch (error: any) {
      // sleep 2s 
      await new Promise(resolve => setTimeout(resolve, 2000));
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
  const playerPos = await context.player.getPos();
  console.log(
    `Random spawn done: pos: ${playerPos}`
  );
}

export async function spawnFromTile(spawnTile: Vec3, context: BotContext) {
  // Check if player has not died (energy is not 0)
  if (context.player.getEnergy() !== 0n) {
    throw new Error("Player has not died, spawn is not allowed!");
  }

  const txHash = await worldContract.write.spawn([
    encodeBlock(spawnTile),
    packVec3([spawnTile[0], spawnTile[1] + 1, spawnTile[2]]),
    MAX_PLAYER_ENERGY / 4n,
    "0x00"
  ]);

  await context.stashResult.waitForTransaction(txHash);
  const playerPos = await context.player.getPos();
  console.log(
    `Spawn done: pos: ${playerPos}`
  );
}
import { walletClient } from "./chain";
import { fillBuckets } from "./fillBuckets";
import { getPlayerInfo } from "./getPlayerInfo";
import { startStashSync } from "./startStashSync";
import { wetFarmlands } from "./wetFarmlands";

async function runBot() {
  console.log("🤖 Bot started...");
  const playerInfo = await getPlayerInfo(walletClient.account.address);
  console.log(
    `Player ${playerInfo.entityId} is at position ${playerInfo.pos} with energy ${playerInfo.getEnergy()}`
  );

  await fillBuckets(playerInfo);
  await wetFarmlands(playerInfo);
}

async function main() {
  const stashResult = await startStashSync();
  console.log("Stash sync completed!");

  while (true) {
    try {
      await runBot();
      console.log("Bot run completed. Restarting...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error in bot loop:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // listen for ctrl+c to exit
    process.on("SIGINT", () => {
      console.log("Exiting bot...");
      stashResult.stopSync();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      console.log("Exiting bot...");
      stashResult.stopSync();
      process.exit(0);
    });
  }
}

await main();

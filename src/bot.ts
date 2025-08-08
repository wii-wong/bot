import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import console from "console";
import { walletClient } from "./chain";
import { fillBuckets } from "./fillBuckets";
import { getPlayerInfo, PlayerInfo } from "./getPlayerInfo";
import { harvestSeeds } from "./harvest";
import { plantSeeds } from "./plantSeeds";
import { syncStash } from "./stash";
import { wetFarmlands } from "./wetFarmlands";

export type BotContext = {
  player: PlayerInfo;
  stashResult: SyncToStashResult;
};

async function runBot(stashResult: SyncToStashResult) {
  console.log("🤖 Bot started...");
  const playerInfo = await getPlayerInfo(walletClient.account.address);
  console.log(
    `Player ${playerInfo.entityId} is at position ${playerInfo.pos} with energy ${playerInfo.getEnergy()}`
  );
  const context: BotContext = {
    player: playerInfo,
    stashResult,
  };

  await fillBuckets(context);
  await wetFarmlands(context);
  await plantSeeds(context);
  await harvestSeeds(context);
}

async function main() {
  const stashResult = await syncStash();

  while (true) {
    try {
      await runBot(stashResult);
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

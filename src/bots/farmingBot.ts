import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import console from "console";
import { getPlayerInfo, PlayerInfo } from "../actions/getPlayerInfo";
import { fillBuckets } from "../tasks/fillBuckets";
import { harvestSeeds } from "../tasks/harvest";
import { plantSeeds } from "../tasks/plantSeeds";
import { wetFarmlands } from "../tasks/wetFarmlands";
import { walletClient } from "../utils/chain";
import { syncStash } from "../utils/stash";

export type BotContext = {
  player: PlayerInfo;
  stashResult: SyncToStashResult;
};

async function singleRun(stashResult: SyncToStashResult) {
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

export async function farmingBot() {
  const stashResult = await syncStash();

  while (true) {
    try {
      await singleRun(stashResult);
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


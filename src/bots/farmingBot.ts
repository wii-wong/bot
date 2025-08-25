import console from "console";
import { getPlayerInfo } from "../actions/getPlayerInfo";
import { fillBuckets } from "../tasks/fillBuckets";
import { harvestSeeds } from "../tasks/harvest";
import { plantSeeds } from "../tasks/plantSeeds";
import { wetFarmlands } from "../tasks/wetFarmlands";
import { BotContext } from "../types";
import { walletClient } from "../utils/chain";


async function singleRun(context: BotContext) {
  console.log("🤖 Bot started...");
  const playerInfo = await getPlayerInfo(walletClient.account.address);
  console.log(
    `Player ${playerInfo.entityId} is at position ${await playerInfo.getPos()} with energy ${playerInfo.getEnergy()}`
  );

  await fillBuckets(context);
  await wetFarmlands(context);
  await plantSeeds(context);
  await harvestSeeds(context);
}

export async function farmingBot(context: BotContext) {

  while (true) {
    try {
      await singleRun(context);
      console.log("Bot run completed. Restarting...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error in bot loop:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}



import process from "process";
import { getPlayerInfo } from "./actions/getPlayerInfo";
import { movePlayer } from "./bots/movePlayer";
import { BotContext } from "./types";
import { walletClient } from "./utils/chain";
import { MAX_PLAYER_ENERGY } from "./utils/constants";
import { syncStash } from "./utils/stash";

async function runBot(context: BotContext) {
    // await farmingBot(context);
    await movePlayer([context.player.pos], context);
    // await playerSpawn(context);
    // await resourceFindingBot(10, "Stone", context);
}

async function main() {
    const stashResult = await syncStash();
    const playerInfo = await getPlayerInfo(walletClient.account.address);

    const context: BotContext = {
        player: playerInfo,
        stashResult,
    };

    console.log("Player info: ");
    console.log("position: ", context.player.pos);
    console.log("energy: ", Number((context.player.getEnergy() * 100n) / MAX_PLAYER_ENERGY), "%");

    await runBot(context);

    console.log("Bot finished");

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

main().catch((error) => {
    console.error("Error in main:", error);
    process.exit(1);
});

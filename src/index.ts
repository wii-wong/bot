
import process from "process";
import { getPlayerInfo } from "./actions/getPlayerInfo";
import { movePlayer } from "./bots/movePlayer";
import { BotContext } from "./types";
import { walletClient } from "./utils/chain";
import { getEnergyPercent } from "./utils/common";
import { syncStash } from "./utils/stash";

async function runBot(context: BotContext) {
    // await onAirResourceFindingBot(40, "Melon", context);
    await movePlayer([-345, 27, -1655], context);
    // await digDownTo([-124, 21, -207], context);
    // await playerSpawn(context);
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
    console.log("energy: ", getEnergyPercent(context), "%");

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


import process from "process";
import { getPlayerInfo } from "./actions/getPlayerInfo";
import { findResources } from "./tasks/findResources";
import { BotContext, ObjectCategory } from "./types";
import { walletClient } from "./utils/chain";
import { getEnergyPercent } from "./utils/common";
import { syncStash } from "./utils/stash";

async function runBot(context: BotContext) {
    await findResources("IronOre", 50, context, {
        filterObjectCategories: [ObjectCategory.Reachable]
    });
    // await movePlayer([781, 43, -1282], context, {
    //     toleranceType: ToleranceType.Horizontal,
    //     tolerance: 5,
    //     avoidBlocks: ["Lava"],
    // });
    // await pickUpAll([538, 158, -1980], context);
    // await mineUntilDestroyed([850, 80, -2694], context);
    // await sleep(BED_POSITION, context);
    // await randomSpawn(context);
}

async function main() {
    const stashResult = await syncStash();
    const playerInfo = await getPlayerInfo(walletClient.account.address);

    const context: BotContext = {
        player: playerInfo,
        stashResult,
    };

    console.log("Player info: ");
    console.log("position: ", await context.player.getPos());
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

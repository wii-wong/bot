
import process from "process";
import { getPlayerInfo } from "./actions/getPlayerInfo";
import { energizeBot } from "./bots/energizeBot";
import { BotContext } from "./types";
import { walletClient } from "./utils/chain";
import { getEnergyPercent } from "./utils/common";
import { syncStash } from "./utils/stash";

async function runBot(context: BotContext) {
    await energizeBot(context);
    // await movePlayer(BED_POSITION, context, {
    //     toleranceType: ToleranceType.Cube,
    //     tolerance: 5,
    //     avoidBlocks: ["Lava"],
    // });
    // await pickUpAll([97, 222, -1240], context);
    // await mineUntilDestroyed([850, 80, -2694], context);
    // await playerSleep(BED_POSITION, context);
    // await spawnFromTile(SPAWN_TILE, context);
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
    console.log("energy: ", getEnergyPercent(await context.player.getEnergy()), "%");

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

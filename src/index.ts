
import process from "process";
import { getPlayerInfo } from "./actions/getPlayerInfo";
import { BotContext } from "./types";
import { walletClient } from "./utils/chain";
import { getEnergyPercent } from "./utils/common";
import { syncStash } from "./utils/stash";

async function runBot(context: BotContext) {
    // await wakeup(BED_POSITION, context);
    // await cuisine(context);
    // await spawnFromTile(SPAWN_TILE, context);
    // await energizeBot(context);
    // await farmingBot(context);
    // await harvestBot(context);
    // await collectingBot(context);
    // await collectSeedsBot(context);
    // await fillEventChestBot(context);
    // await updateProgram(coord as Vec3, "0x73796269746c79000000000000000000436865737450726f6772616d00000000", context);
    // console.log(await getSlotsWithObject(encodeBlock(RESOURCE_CHEST_POSITION), getObjectTypeId("RedMushroomBlock"), context));
    // await sleepBot(context);
    // await pickUpAll([111, 78, -2989], context);
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

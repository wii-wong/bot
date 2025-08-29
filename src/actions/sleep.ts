import { encodeBlock, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";

export async function playerSleep(
    bed: Vec3,
    context: BotContext
) {
    console.log(
        `Sleeping, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}`
    );
    const bedId = encodeBlock(bed);
    const txHash = await worldContract.write.sleep([
        context.player.entityId,
        bedId,
        "0x0"
    ]);
    await context.stashResult.waitForTransaction(txHash);
}
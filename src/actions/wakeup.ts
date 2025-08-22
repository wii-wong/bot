import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";

export async function wakeup(
    bed: Vec3,
    context: BotContext
) {
    console.log(
        `Sleeping, energy: ${getEnergyPercent(context).toString()}`
    );
    const spawnPosition: Vec3 = [bed[0], bed[1] + 1, bed[2]];
    const txHash = await worldContract.write.wakeup([
        context.player.entityId,
        packVec3(spawnPosition),
        "0x0"
    ]);
    await context.stashResult.waitForTransaction(txHash);
}
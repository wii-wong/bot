import { Vec3 } from "@dust/world/internal";

import { move } from "../actions/move";
import { BotContext, MovePlayerOptions } from "../types";
import { getEnergyPercent } from "../utils/common";
import { MOVE_PLAYER_DELAY } from "../utils/constants";
import { calculateMoveCostEnergy } from "./moveCostEnergy";
import { pathFinding } from "./pathfinding";

export async function movePlayer(target: Vec3, context: BotContext, options: MovePlayerOptions) {
    const playerPos = await context.player.getPos();
    const playerEnergy = await context.player.getEnergy();
    console.log(`Moving player from ${playerPos} to ${target}`);

    const path = await pathFinding(target, context, options);
    const costEnergy = await calculateMoveCostEnergy(path);

    console.log("path found: length: ", path.length, "costEnergy: ", getEnergyPercent(costEnergy));

    if (playerEnergy < costEnergy) {
        console.log("Not enough energy");
        return;
    }

    console.log("After move, player energy will be: ", getEnergyPercent(playerEnergy - costEnergy));

    // 分开调用，每28个点调用一次，每次调用完等待1s
    for (let i = 0; i < path.length; i += 28) {
        await move(
            path.slice(i, i + 28),
            context
        );
        await new Promise(resolve => setTimeout(resolve, MOVE_PLAYER_DELAY));
    }
}
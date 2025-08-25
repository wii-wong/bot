import { Vec3 } from "@dust/world/internal";

import { move } from "../actions/move";
import { pathFinding } from "../tasks/pathfinding";
import { BotContext } from "../types";
import { MOVE_PLAYER_DELAY } from "../utils/constants";

export async function movePlayer(target: Vec3, context: BotContext) {
    console.log(`Moving player from ${context.player.pos} to ${target}`);

    const path = await pathFinding(target, context, 3);

    console.log("path found: length: ", path.length);

    // 分开调用，每28个点调用一次，每次调用完等待1s
    for (let i = 0; i < path.length; i += 28) {
        await move(
            path.slice(i, i + 28),
            context
        );
        await new Promise(resolve => setTimeout(resolve, MOVE_PLAYER_DELAY));
    }
}
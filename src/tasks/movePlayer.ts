import { Vec3 } from "@dust/world/internal";

import { move } from "../actions/move";
import { BotContext, MovePlayerOptions } from "../types";
import { MOVE_PLAYER_DELAY } from "../utils/constants";
import { pathFinding } from "../utils/pathfinding";

export async function movePlayer(target: Vec3, context: BotContext, options: MovePlayerOptions) {
    const playerPos = await context.player.getPos();
    console.log(`Moving player from ${playerPos} to ${target}`);

    const path = await pathFinding(target, context, options);

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
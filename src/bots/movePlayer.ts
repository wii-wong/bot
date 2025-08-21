import { Vec3 } from "@dust/world/internal";

import { move } from "../actions/move";
import { BotContext } from "../types";

export async function movePlayer(newPosition: Vec3[], context: BotContext) {
    console.log(`Moving player from ${context.player.pos} to ${newPosition}`);

    await move(
        newPosition,
        context
    );
}
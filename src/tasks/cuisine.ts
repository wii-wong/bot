import { BotContext, ToleranceType } from "../types";
import { LAVA_POSITION } from "../utils/constants";
import { movePlayer } from "./movePlayer";

export async function cuisine(context: BotContext) {
    await movePlayer(LAVA_POSITION, context, {
        toleranceType: ToleranceType.Horizontal,
        tolerance: 0,
        avoidBlocks: [],
        ignoreEnergy: true,
    });
}
import { energizeFF } from "../actions/energizeFF";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext, ToleranceType } from "../types";
import { FORCE_FIELD_POSITION } from "../utils/constants";
import { movePlayer } from "./movePlayer";

export async function energizeForceField(context: BotContext) {
    await movePlayer(FORCE_FIELD_POSITION, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava"],
    });

    const energizeOnce = async () => {
        const batterySlots = getSlotsWithObject(context.player.entityId, getObjectTypeId("Battery"), context);
        if (batterySlots.length == 0) {
            console.log('no battery found');
            return false;
        }

        await energizeFF(FORCE_FIELD_POSITION, batterySlots, context);
        return true;
    }

    while (await energizeOnce()) {
    }
}
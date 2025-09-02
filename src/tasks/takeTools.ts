import { ObjectName } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext, ToleranceType } from "../types";
import { CHEST_POSITION } from "../utils/constants";
import { InteractWithChest } from "./InteractWithChest";
import { movePlayer } from "./movePlayer";

/**
 * Takes tools from the chest based on the toolsAvailble array
 * Limits the total number of tools to 20
 * @param context The bot context
 * @param toolsAvailble Array of tool names to collect from chest
 */
export async function takeTools(
    context: BotContext,
    toolsAvailble: ObjectName[]
): Promise<void> {
    // Get all available tools from the chest based on toolsAvailble array
    // Limit to 20 tools total across all tool types
    await movePlayer(CHEST_POSITION, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava"],
    });

    console.log("Getting tools from chest...");
    const maxTotalTools = 10;
    let toolsCollected = 0;

    for (const tool of toolsAvailble) {
        if (toolsCollected >= maxTotalTools) {
            break;
        }

        const remainingTools = maxTotalTools - toolsCollected;
        console.log(`Trying to get ${tool} from chest (up to ${remainingTools} more tools)...`);

        await InteractWithChest({
            chestCoord: CHEST_POSITION,
            action: 'withdraw',
            objectName: tool,
            amount: remainingTools
        }, context);

        // Count how many tools we got
        const toolSlotsForType = getSlotsWithObject(context.player.entityId, getObjectTypeId(tool), context);
        toolsCollected += toolSlotsForType.length;
        console.log(`Now have ${toolsCollected} tools total`);
    }
}
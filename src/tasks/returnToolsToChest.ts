import { ObjectName } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext, ToleranceType } from "../types";
import { CHEST_POSITION } from "../utils/constants";
import { InteractWithChest } from "./InteractWithChest";
import { movePlayer } from "./movePlayer";

/**
 * Returns all tools to the chest
 * @param context The bot context
 * @param tools Array of tool names to return to chest
 */
export async function returnToolsToChest(
    context: BotContext,
    tools: ObjectName[]
): Promise<void> {
    console.log("Returning tools to chest...");

    // Move to chest position first
    await movePlayer(CHEST_POSITION, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava"],
    });

    // Return all tools from tools array
    for (const tool of tools) {
        console.log(`Returning ${tool} to chest...`);

        // Get all slots with this tool
        const toolSlotsForType = getSlotsWithObject(context.player.entityId, getObjectTypeId(tool), context);

        if (toolSlotsForType.length > 0) {
            await InteractWithChest({
                chestCoord: CHEST_POSITION,
                action: 'deposit',
                objectName: tool,
                amount: toolSlotsForType.length
            }, context);
        }
    }
}
import { ObjectName, Vec3 } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { mineUntilDestroyedWithTool } from "../actions/mine";
import { BotContext, ToleranceType, WorldRegion } from "../types";
import { isMineable } from "./blockCategory";
import { movePlayer } from "./movePlayer";

export type MakePlainParams = {
    searchRegion: WorldRegion;
    withTools: ObjectName[];
}

export async function makePlain(params: MakePlainParams, context: BotContext) {
    const { searchRegion, withTools } = params;
    const { topLeftCoord, bottomRightCoord } = searchRegion;

    // Get the start and end points
    const startX = Math.min(topLeftCoord[0], bottomRightCoord[0]);
    const endX = Math.max(topLeftCoord[0], bottomRightCoord[0]);
    const startY = Math.max(topLeftCoord[1], bottomRightCoord[1]); // Start from top
    const endY = Math.min(topLeftCoord[1], bottomRightCoord[1]); // End at bottom
    const startZ = Math.min(topLeftCoord[2], bottomRightCoord[2]);
    const endZ = Math.max(topLeftCoord[2], bottomRightCoord[2]);

    // Traverse each layer from top to bottom
    for (let y = startY; y >= endY; y--) {
        // Traverse each block in the layer
        for (let x = startX; x <= endX; x++) {
            for (let z = startZ; z <= endZ; z++) {
                const pos: Vec3 = [x, y, z];

                // Check if the block is mineable
                const mineable = await isMineable(pos);
                if (!mineable) {
                    continue; // Skip if not mineable
                }

                // Check player energy
                const energyPercent = await context.player.getEnergy();
                if (energyPercent <= 5) {
                    console.log("Low energy, stopping makePlain operation");
                    return;
                }

                // Check for available tools before mining
                // Get all tools from player inventory based on withTools array
                let toolSlots = [];
                for (const tool of withTools) {
                    const toolSlotsForType = getSlotsWithObject(
                        context.player.entityId,
                        getObjectTypeId(tool),
                        context
                    );
                    toolSlots.push(...toolSlotsForType);
                }

                // If no tools available, stop mining
                if (toolSlots.length === 0) {
                    console.log("No tools available, stopping makePlain operation");
                    return;
                }

                // Try to mine with the first available tool
                const toolSlot = toolSlots[0]?.slot;
                if (toolSlot !== undefined) {
                    try {
                        // Move to the resource
                        const success = await movePlayer(pos, context, {
                            toleranceType: ToleranceType.Cube,
                            tolerance: 5,
                            avoidBlocks: ["Lava"],
                            maxLoop: 5000,
                        });

                        // If movement failed, skip this resource
                        if (!success) {
                            console.log("Failed to move to resource, skipping");
                            continue;
                        }
                        await mineUntilDestroyedWithTool(pos, toolSlot, context);
                    } catch (error) {
                        // Continue even if mining fails
                        console.log(`Failed to mine at ${pos} with tool in slot ${toolSlot}`);
                    }
                } else {
                    console.log("No valid tool slot found, stopping makePlain operation");
                    return;
                }
            }
        }
    }

    console.log("Make plain operation completed");
}
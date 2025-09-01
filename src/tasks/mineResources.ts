import { ObjectName, Vec3 } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { mineUntilDestroyedWithTool } from "../actions/mine";
import { BotContext, ObjectCategory, ToleranceType, WorldRegion } from "../types";
import { getEnergyPercent } from "../utils/common";
import { findResources } from "./findResources";
import { movePlayer } from "./movePlayer";



// Track visited areas and available areas
let visitedAreas: Set<string> = new Set();
let availableAreas: { x: number, z: number }[] | null = null;
let totalAreasCount = 0;

async function getNextArea(searchRegion: WorldRegion, searchRadius: number): Promise<WorldRegion | undefined> {
    // Get the dimensions of the search region
    const regionWidth = searchRegion.bottomRightCoord[0] - searchRegion.topLeftCoord[0];
    const regionDepth = searchRegion.bottomRightCoord[2] - searchRegion.topLeftCoord[2];

    // Calculate the number of areas in each direction
    const numAreasX = Math.ceil(regionWidth / searchRadius);
    const numAreasZ = Math.ceil(regionDepth / searchRadius);

    // Initialize available areas if not already done
    if (availableAreas === null) {
        availableAreas = [];
        for (let x = 0; x < numAreasX; x++) {
            for (let z = 0; z < numAreasZ; z++) {
                availableAreas.push({ x, z });
            }
        }
        totalAreasCount = availableAreas.length;
    }

    // If we've visited all areas, reset and return undefined
    if (visitedAreas.size >= totalAreasCount) {
        // Reset for next time
        visitedAreas.clear();
        return undefined;
    }

    // Get unvisited areas
    const unvisitedAreas = availableAreas.filter(area =>
        !visitedAreas.has(`${area.x},${area.z}`)
    );

    // This should never happen with our logic, but handle it just in case
    if (unvisitedAreas.length === 0) {
        console.log("No unvisited areas left, but visitedAreas.size < totalAreasCount. This shouldn't happen.");
        visitedAreas.clear();
        return undefined;
    }

    // Randomly select an unvisited area
    const randomIndex = Math.floor(Math.random() * unvisitedAreas.length);
    // We know this is defined because we checked unvisitedAreas.length > 0
    const selectedArea = unvisitedAreas[randomIndex]!;

    // Mark this area as visited
    const areaKey = `${selectedArea.x},${selectedArea.z}`;
    visitedAreas.add(areaKey);

    // Calculate the coordinates for the selected area
    const startX = searchRegion.topLeftCoord[0] + selectedArea.x * searchRadius;
    const startZ = searchRegion.topLeftCoord[2] + selectedArea.z * searchRadius;

    // Calculate end coordinates (ensuring we don't exceed the region boundaries)
    const endX = Math.min(startX + searchRadius, searchRegion.bottomRightCoord[0]);
    const endZ = Math.min(startZ + searchRadius, searchRegion.bottomRightCoord[2]);

    // Create the selected area
    const currentArea: WorldRegion = {
        topLeftCoord: [startX, searchRegion.topLeftCoord[1], startZ],
        bottomRightCoord: [endX, searchRegion.bottomRightCoord[1], endZ]
    };

    console.log(`Selected random area (${selectedArea.x},${selectedArea.z}), ${visitedAreas.size}/${totalAreasCount} areas visited`);

    return currentArea;
}

async function searchResourcesInArea(area: WorldRegion, searchItem: ObjectName, context: BotContext) {
    // Calculate the center of the area
    const centerX = (area.topLeftCoord[0] + area.bottomRightCoord[0]) / 2;
    const centerY = (area.topLeftCoord[1] + area.bottomRightCoord[1]) / 2;
    const centerZ = (area.topLeftCoord[2] + area.bottomRightCoord[2]) / 2;
    const centerPoint: Vec3 = [centerX, centerY, centerZ];

    // Calculate the radius of the area (half the diagonal distance)
    const width = area.bottomRightCoord[0] - area.topLeftCoord[0];
    const height = area.bottomRightCoord[1] - area.topLeftCoord[1];
    const depth = area.bottomRightCoord[2] - area.topLeftCoord[2];
    const areaRadius = Math.sqrt(width * width + height * height + depth * depth) / 2;

    console.log(`Searching in centerPoint: ${centerPoint}, areaRadius: ${areaRadius}`);

    // Add timeout mechanism for findResources
    try {
        // Create a promise that rejects after 2 minutes (120000ms)
        const timeoutPromise = new Promise<Vec3[]>((_, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('findResources timeout: exceeded 1 minute'));
            }, 2 * 60 * 1000);

            // Clear the timeout if it's not needed
            return () => clearTimeout(timeoutId);
        });

        // Race between the findResources call and the timeout
        return await Promise.race([
            findResources([searchItem], areaRadius, context, {
                originPos: centerPoint,
                filterObjectCategories: [ObjectCategory.Reachable]
            }),
            timeoutPromise
        ]);
    } catch (error) {
        // Handle the unknown error type properly
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Skipping area due to timeout: ${errorMessage}`);
        return []; // Return empty array to skip this area
    }
}

/**
 * Chops logs in the specified areas
 * Stops when out of tools or energy is too low
 * @param context The bot context
 * @param searchRegion The region to search for resources
 * @param searchRadius The radius to search within
 * @param searchItem The item to search for
 * @param toolsAvailble The tools available for mining
 */
export async function mineResources(
    context: BotContext,
    searchRegion: WorldRegion,
    searchRadius: number,
    searchItem: ObjectName,
    toolsAvailble: ObjectName[]
): Promise<void> {
    let currentArea = await getNextArea(searchRegion, searchRadius);

    // Continue mining until we run out of energy or areas
    while (currentArea) {
        // Get resource positions in the current area
        const resourcePoints = await searchResourcesInArea(currentArea, searchItem, context);
        console.log(`Found ${resourcePoints.length} resources in current area`);

        // Mine each resource in the area
        for (const point of resourcePoints) {
            // Check energy level
            const energyPercent = getEnergyPercent(await context.player.getEnergy());
            console.log("Energy percent: ", energyPercent);

            // If energy is too low, break the loop
            if (energyPercent <= 5) {
                console.log("Energy too low, stopping mining");
                return;
            }

            // Move to the resource
            const success = await movePlayer(point, context, {
                toleranceType: ToleranceType.Cube,
                tolerance: 5,
                avoidBlocks: ["Lava", "Water"],
                maxLoop: 10000,
            });

            // If movement failed, skip this resource
            if (!success) {
                console.log("Failed to move to resource, skipping");
                continue;
            }

            // Check for available tools before mining
            // Get all tools from player inventory based on toolsAvailble array
            let toolSlots = [];
            for (const tool of toolsAvailble) {
                const toolSlotsForType = getSlotsWithObject(context.player.entityId, getObjectTypeId(tool), context);
                toolSlots.push(...toolSlotsForType);
            }

            // If no tools available, stop mining
            if (toolSlots.length === 0) {
                console.log("No tools available, stopping mining");
                return;
            }

            // Use the first available tool
            const toolSlot = toolSlots[0]?.slot;
            if (toolSlot !== undefined) {
                await mineUntilDestroyedWithTool(point, toolSlot, context);
            } else {
                console.log("No valid tool slot found, stopping mining");
                return;
            }
        }

        // Check energy again after mining the area
        const energyPercent = getEnergyPercent(await context.player.getEnergy());
        if (energyPercent <= 5) {
            console.log("Energy too low after mining area, stopping");
            return;
        }

        // Get the next area
        currentArea = await getNextArea(searchRegion, searchRadius);
    }
}
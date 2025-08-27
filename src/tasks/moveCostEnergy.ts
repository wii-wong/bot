import { Vec3 } from "@dust/world/internal";
import { getObjectName, getObjectTypeAt } from "../actions/getObjectTypeAt";
import { LAVA_MOVE_ENERGY_COST, MOVE_ENERGY_COST, WATER_MOVE_ENERGY_COST } from "../utils/constants";

/**
 * Calculates the total energy cost for moving along a path
 * @param path Array of positions representing the path
 * @returns Total energy cost as a BigInt
 */
export async function calculateMoveCostEnergy(path: Vec3[]): Promise<bigint> {
    let totalEnergyCost = 0n;

    // Skip the first position (starting position) when calculating energy cost
    for (let i = 1; i < path.length; i++) {
        const pos = path[i];
        if (!pos) continue; // Skip if position is undefined

        const posBelow: Vec3 = [pos[0], pos[1] - 1, pos[2]];
        const blockBelowTypeId = await getObjectTypeAt(posBelow);

        try {
            const blockBelowName = getObjectName(blockBelowTypeId);

            // Determine energy cost based on block type below
            if (blockBelowName === "Water") {
                totalEnergyCost += WATER_MOVE_ENERGY_COST;
            } else if (blockBelowName === "Lava") {
                totalEnergyCost += LAVA_MOVE_ENERGY_COST;
            } else {
                totalEnergyCost += MOVE_ENERGY_COST;
            }
        } catch (error) {
            console.log(`Error checking block below for energy cost: ${error}`);
            totalEnergyCost += MOVE_ENERGY_COST; // Default to regular move cost on error
        }
    }

    return totalEnergyCost;
}
import { Recipe } from "@dust/world/internal";
import { encodeAbiParameters, Hex, keccak256 } from "viem";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { MAX_PLAYER_ENERGY } from "./constants";

export function getEnergyPercent(energy: bigint) {
    return Number((energy * 100n) / MAX_PLAYER_ENERGY)
}

/**
 * Encodes a recipe into a unique hash
 * @param recipe The recipe to encode
 * @returns A hex string representing the recipe hash
 */
export function encodeRecipe(recipe: Recipe): Hex {
    // Get station object type ID or null if no station
    const stationObjectType = recipe.station
        ? getObjectTypeId(recipe.station)
        : 0;

    // Extract input types and amounts
    const inputTypes = recipe.inputs.map(([name]) => getObjectTypeId(name));
    const inputAmounts = recipe.inputs.map(([, amount]) => amount);

    // Extract output types and amounts
    const outputTypes = recipe.outputs.map(([name]) => getObjectTypeId(name));
    const outputAmounts = recipe.outputs.map(([, amount]) => amount);

    // Encode the recipe components and hash them
    return keccak256(
        // Equivalent to abi.encode in Solidity
        // We encode each component separately to match the Solidity implementation
        // This creates a byte array that's then hashed
        encodeAbiParameters([
            { type: 'uint16' },
            { type: 'uint16[]' },
            { type: 'uint16[]' },
            { type: 'uint16[]' },
            { type: 'uint16[]' }
        ], [
            stationObjectType,
            inputTypes,
            inputAmounts as number[],
            outputTypes,
            outputAmounts as number[]]
        )
    );
}


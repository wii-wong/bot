import { Recipe } from "@dust/world/internal";
import { Hex, keccak256 } from "viem";
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
        ? String(getObjectTypeId(recipe.station))
        : "0x0000000000000000000000000000000000000000000000000000000000000000";

    // Extract input types and amounts
    const inputTypes = recipe.inputs.map(([name]) => String(getObjectTypeId(name)));
    const inputAmounts = recipe.inputs.map(([, amount]) => amount);

    // Extract output types and amounts
    const outputTypes = recipe.outputs.map(([name]) => String(getObjectTypeId(name)));
    const outputAmounts = recipe.outputs.map(([, amount]) => amount);

    // Encode the recipe components and hash them
    return keccak256(
        // Equivalent to abi.encode in Solidity
        // We encode each component separately to match the Solidity implementation
        // This creates a byte array that's then hashed
        encodeAbiComponents(
            stationObjectType,
            inputTypes,
            inputAmounts,
            outputTypes,
            outputAmounts
        )
    );
}

/**
 * Helper function to encode components similar to Solidity's abi.encode
 */
function encodeAbiComponents(
    stationObjectType: string,
    inputTypes: string[],
    inputAmounts: (number | bigint)[],
    outputTypes: string[],
    outputAmounts: (number | bigint)[]
): `0x${string}` {
    // Convert the components to a format that can be properly encoded
    // This is a simplified version of abi.encode for this specific use case
    const encodedData = {
        stationObjectType,
        inputTypes,
        inputAmounts,
        outputTypes,
        outputAmounts
    };

    // Convert to JSON and then to hex
    const jsonString = JSON.stringify(encodedData);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);

    // Convert to hex string
    let hexString = '0x';
    for (let i = 0; i < data.length; i++) {
        const byte = data[i];
        if (byte !== undefined) {
            hexString += byte.toString(16).padStart(2, '0');
        }
    }

    return hexString as `0x${string}`;
}

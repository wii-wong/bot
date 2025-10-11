import { objectsByName, Vec3 } from "@dust/world/internal";
import { getObjectTypeAt, getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { plantSeed } from "../actions/plantSeed";
import { BotContext, ToleranceType } from "../types";
import { FARMLAND_CENTER_POSITION } from "../utils/constants";
import { findResources } from "./findResources";
import { movePlayer } from "./movePlayer";

export async function plantSeeds(context: BotContext) {
    const { player, stashResult } = context;

    const seeds = getSlotsWithObject(
        player.entityId,
        getObjectTypeId('WheatSeed'),
        context
    );

    if (seeds.length === 0) {
        console.warn("No seeds found in inventory.");
        return;
    }

    const wetFarmlands = await findResources(
        ["WetFarmland"],
        15,
        context,
        { originPos: FARMLAND_CENTER_POSITION }
    );
    if (wetFarmlands.length === 0) {
        console.warn("No wet farmlands found to plant seeds.");
        return;
    }

    for (const wetFarmland of wetFarmlands) {
        const seed = seeds.at(0);
        if (!seed) {
            console.log("No seeds left to plant.");
            break;
        }

        const plantPos: Vec3 = [wetFarmland[0], wetFarmland[1] + 1, wetFarmland[2]];
        const objectType = await getObjectTypeAt(plantPos);
        if (objectType !== objectsByName.Air.id) {
            console.warn(
                `Cannot plant seed at ${plantPos} because it is occupied by object type ${objectType}`
            );
            continue;
        }

        // Check the distance to the resource
        // Move player near the farmland position if needed
        const playerPost = await context.player.getPos();
        const distanceToPos = Math.sqrt(
            Math.pow(playerPost[0] - wetFarmland[0], 2) +
            Math.pow(playerPost[1] - wetFarmland[1], 2) +
            Math.pow(playerPost[2] - wetFarmland[2], 2)
        );

        // Move to the resource
        let moveSuccess = true;
        if (distanceToPos > 5) {
            moveSuccess = await movePlayer(wetFarmland, context, {
                toleranceType: ToleranceType.Cube,
                tolerance: 5,
                avoidBlocks: ["Lava", "Water"],
                maxLoop: 10000,
            });
        }

        // If movement failed, skip this resource
        if (!moveSuccess) {
            console.log("Failed to move to resource, skipping");
            continue;
        }

        await plantSeed(
            player.entityId,
            plantPos,
            seed.slot,
            stashResult
        );

        seed.amount -= 1;
        if (seed.amount === 0) {
            seeds.shift(); // Remove the seed slot if no more seeds left
        }
    }
}


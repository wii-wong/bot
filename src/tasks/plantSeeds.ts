import { BotContext } from "../types";

export async function plantSeeds({ player, stashResult }: BotContext) {
    // const seeds = getSlotsWithObject(player.entityId, objectsByName.WheatSeed.id);
    // if (seeds.length === 0) {
    //     console.warn("No seeds found in inventory.");
    //     return;
    // }
    // const wetFarmlands = await getObjectsInArea(
    //     lowerFarmCoord,
    //     upperFarmCoord,
    //     objectsByName.WetFarmland.id
    // );
    // if (wetFarmlands.length === 0) {
    //     console.warn("No wet farmlands found to plant seeds.");
    //     return;
    // }

    // const promises = [];
    // for (const wetFarmland of wetFarmlands) {
    //     const seed = seeds.at(0);
    //     if (!seed) {
    //         // console.warn("No seeds left to plant.");
    //         break;
    //     }

    //     const plantPos: Vec3 = [wetFarmland[0], wetFarmland[1] + 1, wetFarmland[2]];
    //     const objectType = await getObjectTypeAt(plantPos);
    //     if (objectType !== objectsByName.Air.id) {
    //         // console.warn(
    //         //   `Cannot plant seed at ${plantPos} because it is occupied by object type ${objectType}`
    //         // );
    //         continue;
    //     }

    //     const promise = plantSeed(
    //         player.entityId,
    //         plantPos,
    //         seed.slot,
    //         stashResult
    //     );
    //     promises.push(promise);

    //     seed.amount -= 1;
    //     if (seed.amount === 0) {
    //         seeds.shift(); // Remove the seed slot if no more seeds left
    //     }
    // }
    // if (promises.length === 0) {
    //     console.warn("No seeds were planted.");
    //     return;
    // }

    // await Promise.all(promises);
}


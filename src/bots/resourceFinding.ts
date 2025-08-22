import { ObjectName } from "@dust/world/internal";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getOnAirObjectsInArea } from "../tasks/findObjects";
import { BotContext } from "../types";


export async function onAirResourceFindingBot(radius: number, objectType: ObjectName, context: BotContext) {
    const objectTypeId = getObjectTypeId(objectType);

    const playerPos = context.player.pos;
    const lowerCoord: [number, number, number] = [
        playerPos[0] - radius,
        playerPos[1] - radius,
        playerPos[2] - radius,
    ];
    const upperCoord: [number, number, number] = [
        playerPos[0] + radius,
        playerPos[1] + radius,
        playerPos[2] + radius,
    ];
    let positions = await getOnAirObjectsInArea(
        lowerCoord,
        upperCoord,
        objectTypeId
    );

    // rearrange positions from near to far based on player position
    positions.sort((a, b) => {
        const aDistance = Math.sqrt(
            Math.pow(a[0] - playerPos[0], 2) +
            Math.pow(a[1] - playerPos[1], 2) +
            Math.pow(a[2] - playerPos[2], 2)
        );
        const bDistance = Math.sqrt(
            Math.pow(b[0] - playerPos[0], 2) +
            Math.pow(b[1] - playerPos[1], 2) +
            Math.pow(b[2] - playerPos[2], 2)
        );
        return aDistance - bDistance;
    });

    console.log(`Found ${positions.length} positions of ${objectType}: `, positions);

    return positions;
}

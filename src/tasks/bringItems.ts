import { ObjectName, Vec3 } from "@dust/world/internal";
import { BotContext, ToleranceType } from "../types";
import { InteractWithChest } from "./InteractWithChest";
import { movePlayer } from "./movePlayer";

/**
 * @param context The bot context
 */

export type BringItemParams = {
    maxTotalItem: number;
    chestCoord: Vec3;
    itemName: ObjectName;
}

export async function bringItems(
    params: BringItemParams,
    context: BotContext
): Promise<void> {
    await movePlayer(params.chestCoord, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava", "Water"],
    });

    console.log(`Getting ${params.itemName} from chest...`);

    await InteractWithChest({
        chestCoord: params.chestCoord,
        action: 'withdraw',
        objectName: params.itemName,
        amount: params.maxTotalItem
    }, context);
}
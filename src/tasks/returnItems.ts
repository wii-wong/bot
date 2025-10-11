import { ObjectName, Vec3 } from "@dust/world/internal";
import { BotContext, ToleranceType } from "../types";
import { InteractWithChest } from "./InteractWithChest";
import { movePlayer } from "./movePlayer";

export type ReturnItemParams = {
    chestCoord: Vec3;
    itemName: ObjectName;
}

export async function returnItems(
    params: ReturnItemParams,
    context: BotContext
): Promise<void> {
    await movePlayer(params.chestCoord, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava", "Water"],
    });

    await InteractWithChest({
        chestCoord: params.chestCoord,
        action: 'deposit',
        objectName: params.itemName,
        amount: Number.MAX_SAFE_INTEGER,
    }, context);
}
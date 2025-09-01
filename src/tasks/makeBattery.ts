import { ObjectName } from "@dust/world/internal";
import { craft } from "../actions/craft";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext, SlotAmount, ToleranceType } from "../types";
import { POWER_STONE_POSITION } from "../utils/constants";
import { RECIPE_BATTERY } from "../utils/recipes";
import { movePlayer } from "./movePlayer";

export async function makeBattery(logType: ObjectName, context: BotContext): Promise<boolean> {
    await movePlayer(POWER_STONE_POSITION, context, {
        toleranceType: ToleranceType.Cube,
        tolerance: 5,
        avoidBlocks: ["Lava"],
    });

    const objectType = getObjectTypeId(logType);

    const craftBatteryOnce = async () => {
        const slots = getSlotsWithObject(context.player.entityId, objectType, context);
        console.log('slots: ', slots);
        for (const recipe of RECIPE_BATTERY) {
            if (recipe.inputs?.[0]?.[0] != 'AnyLog') {
                continue;
            }
            let inputCnt = 0;
            for (const slot of slots) {
                inputCnt += slot.amount;
            }
            if (inputCnt < recipe.inputs?.[0]?.[1]) {
                continue;
            }

            // Check if the total amount exceeds the recipe requirement
            const requiredAmount = recipe.inputs?.[0]?.[1];
            if (inputCnt > requiredAmount) {
                // Create adjusted slots that sum to exactly the required amount
                const adjustedSlots: SlotAmount[] = [];
                let remainingAmount: number = requiredAmount as number;

                for (const slot of slots) {
                    if (remainingAmount <= 0) break;

                    const amountToUse = Math.min(slot.amount, remainingAmount);
                    adjustedSlots.push({
                        slot: slot.slot,
                        amount: amountToUse
                    });

                    remainingAmount -= amountToUse;
                }

                if (remainingAmount > 0) {
                    console.log('not enough resources');
                    return false;
                }

                await craft(POWER_STONE_POSITION, recipe, adjustedSlots, context);
                return true;
            } else {
                // Use all slots as is since the total amount equals the requirement
                await craft(POWER_STONE_POSITION, recipe, slots, context);
                return true;
            }
        }
    }

    while (await craftBatteryOnce()) {
    }

    return false;
}
import { ObjectName, Vec3 } from "@dust/world/internal";
import { craft } from "../actions/craft";
import { energizeFF } from "../actions/energizeFF";
import { getObjectTypeId } from "../actions/getObjectTypeAt";
import { getSlotsWithObject } from "../actions/getSlotsWithObject";
import { BotContext } from "../types";
import { FORCE_FIELD_POSITION, POWER_STONE_POSITION } from "../utils/constants";
import { RECIPE_BATTERY } from "../utils/recipes";

export async function energizeBot(context: BotContext) {
  const searchOriginPoint: Vec3 = [200, 71, -2750];
  const searchRadius = 20;
  const searchItem: ObjectName = "OakLog";

  // const resourcePoints = await findResources([searchItem], searchRadius, context, {
  //   originPos: searchOriginPoint,
  //   filterObjectCategories: [ObjectCategory.Reachable]
  // });

  // for (const point of resourcePoints) {
  //   const energyPercent = getEnergyPercent(await context.player.getEnergy());
  //   console.log("energy percent: ", energyPercent);
  //   if (energyPercent < 8) {
  //     break;
  //   }

  //   const success = await movePlayer(point, context, {
  //     toleranceType: ToleranceType.Cube,
  //     tolerance: 5,
  //     avoidBlocks: ["Lava"],
  //     maxLoop: 10000,
  //   });
  //   if (!success) {
  //     continue;
  //   }

  //   await mineUntilDestroyed(point, context);
  // }

  // await movePlayer(POWER_STONE_POSITION, context, {
  //   toleranceType: ToleranceType.Cube,
  //   tolerance: 5,
  //   avoidBlocks: ["Lava"],
  // });

  const objectType = getObjectTypeId(searchItem);
  const slots = getSlotsWithObject(objectType, context);
  console.log('slots: ', slots);
  for (const recipe of RECIPE_BATTERY) {
    console.log('recipe: ', recipe);
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
    console.log('crafting: ', recipe);

    // Check if the total amount exceeds the recipe requirement
    const requiredAmount = recipe.inputs?.[0]?.[1];
    if (inputCnt > requiredAmount) {
      // Create adjusted slots that sum to exactly the required amount
      const adjustedSlots = [];
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

      console.log('adjusted slots to match recipe requirement: ', adjustedSlots);
      await craft(POWER_STONE_POSITION, recipe, adjustedSlots, context);
    } else {
      // Use all slots as is since the total amount equals the requirement
      await craft(POWER_STONE_POSITION, recipe, slots, context);
    }
  }

  const batterySlots = getSlotsWithObject(getObjectTypeId("Battery"), context);
  if (batterySlots.length == 0) {
    console.log('no battery found');
    return;
  }
  await energizeFF(FORCE_FIELD_POSITION, batterySlots, context);
}



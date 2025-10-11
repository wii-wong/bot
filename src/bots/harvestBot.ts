import { harvestSeeds } from "../tasks/harvest";
import { returnItems } from "../tasks/returnItems";
import { BotContext } from "../types";
import { SEEDS_CHEST_POSITION } from "../utils/constants";

export async function harvestBot(context: BotContext) {
  await harvestSeeds(context);

  await returnItems({
    chestCoord: SEEDS_CHEST_POSITION,
    itemName: 'Wheat',
  }, context);

  await returnItems({
    chestCoord: SEEDS_CHEST_POSITION,
    itemName: 'WheatSeed',
  }, context);
}


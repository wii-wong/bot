import { ObjectName } from "@dust/world/internal";
import { InteractWithChest } from "../tasks/InteractWithChest";
import { mineResources } from "../tasks/mineResources";
import { returnToolsToChest } from "../tasks/returnToolsToChest";
import { BotContext, WorldRegion } from "../types";
import { RESOURCE_CHEST_POSITION } from "../utils/constants";


/// CONSTANTS
const searchRadius = 20;
const searchRegion: WorldRegion = {
  topLeftCoord: [97, 69, -3005],
  bottomRightCoord: [266, 77, -2790],
}
const searchItem: ObjectName = "RedMushroomBlock";
const toolsAvailble = ["CopperAxe"] as ObjectName[];
const maxResourceCount = 420;


export async function collectingBot(context: BotContext) {
  // Step 1: Get tools from chest
  // await takeTools({ toolsAvailble, maxTotalTools: 3 }, context);

  // Step 2: Main mining loop
  await mineResources({ searchRegion, searchRadius, searchItem, toolsAvailble, maxResourceCount }, context);

  // Step 3: place resources into chest
  await InteractWithChest({ objectName: searchItem, chestCoord: RESOURCE_CHEST_POSITION, amount: 10e8, action: "deposit" }, context);

  // Step 4: Return all tools to the chest
  await returnToolsToChest(context, toolsAvailble);
}


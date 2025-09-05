import { ObjectName } from "@dust/world/internal";
import { InteractWithChest } from "../tasks/InteractWithChest";
import { mineResources } from "../tasks/mineResources";
import { movePlayer } from "../tasks/movePlayer";
import { returnToolsToChest } from "../tasks/returnToolsToChest";
import { takeTools } from "../tasks/takeTools";
import { BotContext, ToleranceType, WorldRegion } from "../types";
import { RESOURCE_CHEST_POSITION } from "../utils/constants";


/// CONSTANTS
const searchRadius = 5;
const searchRegion: WorldRegion = {
  topLeftCoord: [77, 66, -3010],
  bottomRightCoord: [100, 69, -2966],
}
const searchItem: ObjectName = "Sand";
const toolsAvailble = ["CopperAxe"] as ObjectName[];
const maxTotalTools = 2;


export async function collectingBot(context: BotContext) {
  // Step 1: Get tools from chest
  await takeTools({ toolsAvailble, maxTotalTools }, context);

  // Step 2: Main mining loop
  await mineResources({ searchRegion, searchRadius, searchItem, toolsAvailble, maxResourceCount: 880 - 640, ignoreTimeLimit: true }, context);

  // Step 3: place resources into chest
  await movePlayer(RESOURCE_CHEST_POSITION, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava", "Water"],
  });
  await InteractWithChest({ objectName: searchItem, chestCoord: RESOURCE_CHEST_POSITION, amount: 10e8, action: "deposit" }, context);

  // Step 4: Return all tools to the chest
  await returnToolsToChest(context, toolsAvailble);
}


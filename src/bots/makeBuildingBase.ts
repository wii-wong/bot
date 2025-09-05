import { ObjectName } from "@dust/world/internal";
import { makePlain } from "../tasks/makePlain";
import { returnToolsToChest } from "../tasks/returnToolsToChest";
import { takeTools } from "../tasks/takeTools";
import { BotContext, WorldRegion } from "../types";


/// CONSTANTS
const searchRegion: WorldRegion = {
  topLeftCoord: [310, 68, -2481],
  bottomRightCoord: [362, 68, -2458],
}
const toolsAvailble = ["CopperAxe"] as ObjectName[];


export async function makeBuildingBase(context: BotContext) {
  // Step 1: Get tools from chest
  await takeTools({ toolsAvailble, maxTotalTools: 2 }, context);

  // Step 2: Make plain
  await makePlain({
    searchRegion,
    withTools: toolsAvailble
  }, context);

  // Step 4: Return all tools to the chest
  await returnToolsToChest(context, toolsAvailble);
}


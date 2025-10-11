import { ObjectName } from "@dust/world/internal";
import { InteractWithChest } from "../tasks/InteractWithChest";
import { mineResources } from "../tasks/mineResources";
import { movePlayer } from "../tasks/movePlayer";
import { returnToolsToChest } from "../tasks/returnToolsToChest";
import { takeTools } from "../tasks/takeTools";
import { BotContext, ToleranceType, WorldRegion } from "../types";
import { RESOURCE_CHEST_POSITION } from "../utils/constants";


/// SAND
const searchRadius = 10;
const searchRegion: WorldRegion = {
  topLeftCoord: [75, 64, -3016],
  bottomRightCoord: [117, 69, -2951],
}
const searchItem: ObjectName = "Sand";
const toolsAvailble = ["DiamondPick"] as ObjectName[];
const maxTotalTools = 10;
const waitForTxn = false;

/// LOGS
// const searchRadius = 10;
// const searchRegion: WorldRegion = {
//   topLeftCoord: [250, 80, -3000],
//   bottomRightCoord: [800, 28, -2500],
// }
// const searchItem: ObjectName = "JungleLog";
// const toolsAvailble = ["IronPick", "CopperPick"] as ObjectName[];
// const maxTotalTools = 10;
// const waitForTxn = true;

/// GRASS
// const searchRadius = 8;
// const searchRegion: WorldRegion = {
//   topLeftCoord: [250, 80, -3000],
//   bottomRightCoord: [800, 28, -2500],
// }
// const searchItem: ObjectName = "Grass";
// const toolsAvailble = ["DiamondPick"] as ObjectName[];
// const maxTotalTools = 10;
// const waitForTxn = true;

export async function collectingBot(context: BotContext) {
  // Step 1: Get tools from chest
  await takeTools({ toolsAvailble, maxTotalTools }, context);

  // Step 2: Main mining loop
  await mineResources({ searchRegion, searchRadius, searchItem, toolsAvailble, ignoreTimeLimit: true, waitingForTxn: waitForTxn }, context);

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


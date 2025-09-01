import { ObjectName } from "@dust/world/internal";
import { energizeForceField } from "../tasks/energizeForceField";
import { makeBattery } from "../tasks/makeBattery";
import { mineResources } from "../tasks/mineResources";
import { returnToolsToChest } from "../tasks/returnToolsToChest";
import { takeTools } from "../tasks/takeTools";
import { BotContext, WorldRegion } from "../types";


/// CONSTANTS
const searchRadius = 20;
const searchRegion: WorldRegion = {
  topLeftCoord: [250, 80, -3000],
  bottomRightCoord: [800, 28, -2500],
}
const searchItem: ObjectName = "JungleLog";
const toolsAvailble = ["CopperAxe", "WoodenPick", "WoodenAxe"] as ObjectName[];


export async function energizeBot(context: BotContext) {
  // Step 1: Get tools from chest
  await takeTools(context, toolsAvailble);

  // Step 2: Main mining loop
  await mineResources(context, searchRegion, searchRadius, searchItem, toolsAvailble);

  // Step 3: Make battery and energize force field
  await makeBattery(searchItem, context);
  await energizeForceField(context);

  // Step 4: Return all tools to the chest
  await returnToolsToChest(context, toolsAvailble);
}


import { ObjectName, Vec3 } from "@dust/world/internal";
import { energizeForceField } from "../tasks/energizeForceField";
import { makeBattery } from "../tasks/makeBattery";
import { mineResources } from "../tasks/mineResources";
import { returnToolsToChest } from "../tasks/returnToolsToChest";
import { takeTools } from "../tasks/takeTools";
import { BotContext } from "../types";

type SearchRegion = {
  topLeftCoord: Vec3;
  bottomRightCoord: Vec3;
}


/// CONSTANTS
const searchRadius = 20;
const searchRegion: SearchRegion = {
  topLeftCoord: [250, 80, -2900],
  bottomRightCoord: [640, 28, -2680],
}
const searchItem: ObjectName = "OakLog";
const toolsAvailble = ["CopperAxe", "WoodenPick"] as ObjectName[];


export async function energizeBot(context: BotContext) {
  // Step 1: Get tools from chest
  await takeTools(context, toolsAvailble);

  // Step 2: Main mining loop
  await mineResources(context, searchRegion, searchRadius, searchItem, toolsAvailble);

  // Step 3: Make battery and energize force field
  await makeBattery(context);
  await energizeForceField(context);

  // Step 4: Return all tools to the chest
  await returnToolsToChest(context, toolsAvailble);
}


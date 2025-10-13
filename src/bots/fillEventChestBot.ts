import { ObjectName } from "@dust/world/internal";
import { InteractWithChest } from "../tasks/InteractWithChest";
import { movePlayer } from "../tasks/movePlayer";
import { BotContext, ToleranceType } from "../types";
import { EVENT_CHESTS } from "../utils/constants";

/// Constants
const Contents: Partial<Record<ObjectName, number>> = {
  "IronPick": 1,
  "Battery": 10,
  "FireFlower": 1,
};


export async function fillEventChestBot(context: BotContext) {
  for (const chest of EVENT_CHESTS) {
    await movePlayer(chest, context, {
      toleranceType: ToleranceType.Cube,
      tolerance: 5,
      avoidBlocks: ["Lava", "Water"],
    });
    for (const [objectName, count] of Object.entries(Contents)) {
      await InteractWithChest({
        chestCoord: chest,
        action: 'deposit',
        objectName: objectName as ObjectName,
        amount: count ?? Number.MAX_SAFE_INTEGER,
      }, context);
    }
  }
}


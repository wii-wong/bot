import { playerSleep } from "../actions/sleep";
import { movePlayer } from "../tasks/movePlayer";
import { BotContext, ToleranceType } from "../types";
import { BED_POSITION } from "../utils/constants";

export async function sleepBot(context: BotContext) {
  await movePlayer(BED_POSITION, context, {
    toleranceType: ToleranceType.Cube,
    tolerance: 5,
    avoidBlocks: ["Lava", "Water"],
  });
  await playerSleep(BED_POSITION, context);
}


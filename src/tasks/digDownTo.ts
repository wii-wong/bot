import { Vec3 } from "@dust/world/internal";
import { isBlockPassThrough } from "../actions/blockCategory";
import { getObjectName, getObjectTypeAt } from "../actions/getObjectTypeAt";
import { mineUntilDestroyed } from "../actions/mine";
import { move } from "../actions/move";
import { BotContext } from "../types";

/**
 * Digs down from the player's current position until reaching the block above the target
 * @param target The target position to dig down to
 * @param context The bot context containing player information
 */
export async function digDownTo(target: Vec3, context: BotContext) {
  // Continue digging until the player is just above the target
  while (true) {
    // Get the current player position
    const playerPos = await context.player.getPos();

    // Check if we've reached the position just above the target
    if (playerPos[1] === target[1] + 1 &&
      playerPos[0] === target[0] &&
      playerPos[2] === target[2]) {
      console.log(`Reached position above target: [${playerPos[0]}, ${playerPos[1]}, ${playerPos[2]}]`);
      break;
    }

    // Calculate the position of the block below the player
    const blockBelow: Vec3 = [playerPos[0], playerPos[1] - 1, playerPos[2]];

    // Mine the block below
    console.log(`Digging block below at [${blockBelow[0]}, ${blockBelow[1]}, ${blockBelow[2]}]`);
    console.log(`block type is: ${getObjectName(await getObjectTypeAt(blockBelow))}`)
    if (!isBlockPassThrough(await getObjectTypeAt(blockBelow))) {
      await mineUntilDestroyed(blockBelow, context);
    }
    await move([blockBelow], context);
    // Note: After mining, the player's position will be updated in the context
    // for the next iteration of the loop
  }
}

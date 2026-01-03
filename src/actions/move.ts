import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";
import { PLAYER_ACTION_DELAY } from "../utils/constants";

/**
 * Check if two positions are equal (within a small threshold)
 */
function isPositionEqual(pos1: Vec3, pos2: Vec3, threshold: number = 0.1): boolean {
  return (
    Math.abs(pos1[0] - pos2[0]) <= threshold &&
    Math.abs(pos1[1] - pos2[1]) <= threshold &&
    Math.abs(pos1[2] - pos2[2]) <= threshold
  );
}

export async function move(
  newPosition: Vec3[],
  context: BotContext
) {
  if (newPosition.length === 0) {
    console.log("Empty path provided to move function");
    return;
  }

  const targetPosition = newPosition[newPosition.length - 1];
  const MAX_MOVE_RETRIES = 5;
  let moveRetries = 0;
  let reachedEndPoint = false;

  while (!reachedEndPoint && moveRetries < MAX_MOVE_RETRIES) {
    console.log(
      `Moving path ${newPosition}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}`
    );

    try {
      const txHash = await worldContract.write.move([
        context.player.entityId,
        newPosition.map(p => packVec3(p))
      ]);
      await context.stashResult.waitForTransaction(txHash);

      // Wait a moment for the move to complete
      await new Promise(resolve => setTimeout(resolve, PLAYER_ACTION_DELAY));

      // Check if player reached the target position
      const currentPos = await context.player.getPos();
      if (currentPos && targetPosition) {
        reachedEndPoint = isPositionEqual(currentPos, targetPosition);
      } else {
        console.log("Warning: Could not get valid position data");
        reachedEndPoint = false;
      }

      if (!reachedEndPoint) {
        moveRetries++;
        console.log(`Player not at target position. Current: ${currentPos}, Expected: ${targetPosition}`);
        console.log(`Retrying move (attempt ${moveRetries}/${MAX_MOVE_RETRIES})`);
      } else {
        console.log(`Successfully reached position: ${targetPosition}`);
      }
    } catch (error) {
      console.log(`Move attempt ${moveRetries + 1} failed:`, error);
      moveRetries++;
    }
  }

  if (!reachedEndPoint) {
    console.log(`Failed to reach target position after ${MAX_MOVE_RETRIES} attempts`);
    throw new Error("Move failed: Could not reach target position");
  }
}
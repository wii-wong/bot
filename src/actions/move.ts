import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";

export async function move(
  newPosition: Vec3[],
  context: BotContext
) {
  console.log(
    `Moving path ${newPosition}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}`
  );
  const txHash = await worldContract.write.move([
    context.player.entityId,
    newPosition.map(p => packVec3(p))
  ]);
  await context.stashResult.waitForTransaction(txHash);
}
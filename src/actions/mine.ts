import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";

export async function mineUntilDestroyed(
  position: Vec3,
  context: BotContext
) {
  console.log(
    `Mining ${position}, energy: ${getEnergyPercent(context).toString()}`
  );
  const txHash = await worldContract.write.mineUntilDestroyed([
    context.player.entityId,
    packVec3(position),
    "0x0"
  ]);
  await context.stashResult.waitForTransaction(txHash);
}
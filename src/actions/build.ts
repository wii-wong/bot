import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";

export async function build(
  position: Vec3,
  slot: number,
  context: BotContext
) {
  console.log(
    `Put object in slot ${slot} at ${position}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}`
  );
  const txHash = await worldContract.write.build([
    context.player.entityId,
    packVec3(position),
    slot,
    "0x0"
  ]);
  await context.stashResult.waitForTransaction(txHash);
}

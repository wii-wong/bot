import { packVec3, Vec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { worldContract } from "../utils/chain";
import { getEnergyPercent } from "../utils/common";
import { getObjectName, getObjectTypeAt } from "./getObjectTypeAt";

export async function mineUntilDestroyed(
  position: Vec3,
  context: BotContext
) {
  console.log(
    `Mining ${position}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}, object is ${getObjectName(await getObjectTypeAt(position))}`
  );
  const txHash = await worldContract.write.mineUntilDestroyed([
    context.player.entityId,
    packVec3(position),
    "0x0"
  ]);
  await context.stashResult.waitForTransaction(txHash);
}

export async function mineUntilDestroyedWithTool(
  position: Vec3,
  slot: number,
  context: BotContext
) {
  console.log(
    `Mining ${position}, energy: ${getEnergyPercent(await context.player.getEnergy()).toString()}, object is ${getObjectName(await getObjectTypeAt(position))}`
  );
  try {
    const txHash = await worldContract.write.mineUntilDestroyed([
      context.player.entityId,
      packVec3(position),
      slot,
      "0x0"
    ]);
    await context.stashResult.waitForTransaction(txHash);
  } catch (error) {
    console.log("Mine failed!");
  }
}

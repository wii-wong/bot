import { encodeBlock, Recipe, Vec3 } from "@dust/world/internal";
import { BotContext, SlotAmount } from "../types";
import { worldContract } from "../utils/chain";
import { encodeRecipe } from "../utils/common";

export async function craft(
  station: Vec3,
  recipe: Recipe,
  slots: SlotAmount[],
  context: BotContext
) {
  console.log(`Filling bucket in slot ${slots}`);
  const txHash = await worldContract.write.craftWithStation([
    context.player.entityId,
    encodeBlock(station),
    encodeRecipe(recipe),
    slots,
  ]);
  console.log(`Crafting ${recipe.outputs} in slot ${slots}, txHash: ${txHash}`);
  await context.stashResult.waitForTransaction(txHash);
}

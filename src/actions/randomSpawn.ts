import { packVec3 } from "@dust/world/internal";
import { BotContext } from "../types";
import { publicClient, worldContract } from "../utils/chain";

export async function randomSpawn(
  context: BotContext
) {
  const txHash = await worldContract.write.randomSpawn([
    (await publicClient.getBlockNumber()) - 5n,
    packVec3(context.player.pos),
  ]);
  console.log(
    `Random spawn txHash: ${txHash}`
  );
  await context.stashResult.waitForTransaction(txHash);
  // await new Promise(resolve => setTimeout(resolve, MOCK_TX_AWAIT_TIME));
  console.log(
    `Random spawn done`
  );
}
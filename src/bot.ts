import { walletClient } from "./chain";
import { fillBuckets } from "./fillBuckets";
import { getPlayerInfo } from "./getPlayerInfo";
import { startStashSync } from "./startStashSync";

async function main() {
  console.log("🤖 Bot started...");
  const stashResult = await startStashSync();
  console.log("Stash sync completed!");

  const playerInfo = await getPlayerInfo(walletClient.account.address);
  console.log(
    `Player ${playerInfo.entityId} is at position ${playerInfo.pos} with energy ${playerInfo.getEnergy()}`
  );

  // Setup farm
  await fillBuckets(playerInfo);

  stashResult.stopSync();
  process.exit(0);
}

await main();

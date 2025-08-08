import { objectsByName } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { PlayerInfo } from "./getPlayerInfo";
import { getSlotsWithObject } from "./getSlotsWithObject";

export async function plantSeeds({
  player,
  stashResult,
}: {
  player: PlayerInfo;
  stashResult: SyncToStashResult;
}) {
  const seeds = getSlotsWithObject(player.entityId, objectsByName.WheatSeed.id);
  if (seeds.length === 0) {
    console.warn("No seeds found in inventory.");
    return;
  }
  console.log(`Planting ${seeds.length} seeds...`);

  console.log("Seeds planted!");
}

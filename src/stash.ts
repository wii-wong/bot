import mudConfig from "@dust/world/mud.config";
import { createStash, subscribeTable } from "@latticexyz/stash/internal";
import { SyncStep } from "@latticexyz/store-sync";
import { SyncProgress, syncToStash } from "@latticexyz/store-sync/internal";
import { chain, worldAddress, worldBlockNumber } from "./chain";

export const tables = {
  EntityObjectType: mudConfig.tables.EntityObjectType,
  InventorySlot: mudConfig.tables.InventorySlot,
  Energy: mudConfig.tables.Energy,
  SeedGrowth: mudConfig.tables.SeedGrowth,
};

export const stash = createStash({ namespaces: { "": { tables } } });

export async function syncStash() {
  console.log("Starting stash sync...");
  const filters = Object.values(tables).map((table) => ({
    tableId: table.tableId,
  }));

  const stashResult = await syncToStash({
    stash,
    indexerUrl: chain.indexerUrl,
    filters,
    startBlock: BigInt(worldBlockNumber),
    address: worldAddress,
    internal_clientOptions: {
      chain,
      validateBlockRange: true,
    },
  });

  await new Promise<void>((resolve) => {
    const unsubscribe = subscribeTable({
      stash,
      table: SyncProgress,
      subscriber: (updates) => {
        for (const update of updates) {
          if (update.current?.step === SyncStep.LIVE) {
            console.log("Sync complete!");
            unsubscribe();
            resolve();
          } else {
            console.log(`Sync progress: ${update.current?.percentage}%`);
          }
        }
      },
    });
  });

  console.log("Stash sync completed!");

  return stashResult;
}

import {
  TableQuery,
  getSnapshot,
  syncToStash,
} from "@latticexyz/store-sync/internal";
import { Table } from "@latticexyz/store/internal";
import pRetry from "p-retry";
import { chain, worldAddress, worldBlockNumber } from "./chain";
import { stash, tables } from "./stash";

export async function startStashSync() {
  const filters = Object.values(tables).map(
    (table) =>
      ({
        table,
        toBlock: undefined,
        sql: selectAll(table),
      }) satisfies TableQuery
  );

  const indexerUrl = "https://indexer.mud.redstonechain.com";

  console.log(
    `Fetching snapshot from ${indexerUrl} for ${worldAddress} on chain ${chain.id}`
  );
  const snapshot = await pRetry(
    async () =>
      indexerUrl
        ? getSnapshot({
            indexerUrl,
            storeAddress: worldAddress,
            chainId: chain.id,
            filters,
          })
        : undefined,
    {
      retries: 5,
      onFailedAttempt: (error) =>
        console.error("failed to get snapshot, retrying...", { error }),
    }
  );

  if (!snapshot?.initialBlockLogs) {
    throw new Error("No initial block logs found in snapshot");
  }

  console.log(
    `Hydrating stash with ${snapshot.initialBlockLogs.logs.length} logs to block ${snapshot.initialBlockLogs.blockNumber}`
  );

  const stashResult = await syncToStash({
    stash,
    indexerUrl,
    // If initial block logs are provided, the sync stack will start syncing after the last block in the initial block logs
    startBlock: BigInt(worldBlockNumber),
    address: worldAddress,
    initialBlockLogs: snapshot?.initialBlockLogs,
    internal_clientOptions: {
      chain,
      validateBlockRange: true,
      pollingInterval: 500,
    },
    enableHydrationChunking: false,
  });
  return stashResult;
}

function selectAll(table: Table) {
  return `select ${Object.keys(table.schema)
    .map((key) => `"${key}"`)
    .join(", ")} from ${table.name};`;
}

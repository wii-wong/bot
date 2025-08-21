import { encodeBlock, Vec3 } from "@dust/world/internal";
import { stash, tables } from "../utils/stash";

export async function isFullyGrown(
  wheatSeed: Vec3,
  latestTimestamp: bigint
): Promise<boolean> {
  const seedGrowthRecord = stash.getRecord({
    table: tables.SeedGrowth,
    key: { entityId: encodeBlock(wheatSeed) },
  });
  if (!seedGrowthRecord) {
    return true;
  }
  return seedGrowthRecord.fullyGrownAt < latestTimestamp;
}
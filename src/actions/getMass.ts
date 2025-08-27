import { Vec3, encodeBlock } from "@dust/world/internal";
import { stash, tables } from "../utils/stash";

export async function getMass(pos: Vec3): Promise<bigint> {
  const massRecord = stash.getRecord({
    table: tables.Mass,
    key: { entityId: encodeBlock(pos) },
  });
  if (!massRecord) {
    return 0n;
  }
  return massRecord.mass;
}

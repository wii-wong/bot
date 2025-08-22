import { encodeBlock, getTerrainBlockType, objects, Vec3 } from "@dust/world/internal";
import { publicClient, worldAddress } from "../utils/chain";
import { stash, tables } from "../utils/stash";

export async function getObjectTypeAt(pos: Vec3): Promise<number> {
  const objectTypeRecord = stash.getRecord({
    table: tables.EntityObjectType,
    key: { entityId: encodeBlock(pos) },
  });
  let objectTypeId = objectTypeRecord?.objectType;
  if (!objectTypeId) {
    objectTypeId = await getTerrainBlockType(publicClient, worldAddress, pos);
  }
  return objectTypeId;
}

export function getObjectTypeId(objectType: string): number {
  const objectTypeId = (objects.find(e => e.name === objectType))?.id;
  if (!objectTypeId) {
    throw new Error(`objectType ${objectType} not found`);
  }
  return objectTypeId;
}

export function getObjectType(objectTypeId: number): string {
  const objectType = (objects.find(e => e.id === objectTypeId))?.name;
  if (!objectType) {
    throw new Error(`objectTypeId ${objectTypeId} not found`);
  }
  return objectType;
}
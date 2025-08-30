import { encodeBlock, getTerrainBlockType, ObjectName, objects, Vec3, voxelToChunkPos } from "@dust/world/internal";
import { publicClient, worldAddress } from "../utils/chain";
import { stash, tables } from "../utils/stash";
import { getBlockTypeFromChunkData, getChunkData } from "./getChunkData";

const chunkDataStore: Map<string, string> = new Map();

function getChunkCoordKey(chunkCoord: Vec3) {
  return `${chunkCoord[0]},${chunkCoord[1]},${chunkCoord[2]}`;
}

export async function getObjectTypeAtByChunkData(pos: Vec3): Promise<number> {
  const chunkCoord: Vec3 = voxelToChunkPos(pos) as Vec3;
  const chunkCoordKey = getChunkCoordKey(chunkCoord);
  let chunkData = chunkDataStore.get(chunkCoordKey);
  if (!chunkData) {
    chunkData = await getChunkData(chunkCoord);
    chunkDataStore.set(chunkCoordKey, chunkData);
    return getBlockTypeFromChunkData(chunkData, pos);
  }
  return getBlockTypeFromChunkData(chunkData, pos);
}

export async function getObjectTypeAt(pos: Vec3): Promise<number> {
  const objectTypeRecord = stash.getRecord({
    //@ts-ignore
    table: tables.EntityObjectType,
    key: { entityId: encodeBlock(pos) },
  });
  let objectTypeId = objectTypeRecord?.objectType;
  if (!objectTypeId) {
    try {
      objectTypeId = await getTerrainBlockType(publicClient, worldAddress, pos);
    } catch (error) {
      console.log(`Chunk not exist at position[${pos.join(", ")}]`);
      // Return a default value (0 typically represents air/empty space in voxel games)
      return 0; // Null
      // Re-throw other errors
    }
  }
  return objectTypeId;
}

export function getObjectTypeId(objectType: ObjectName): number {
  const objectTypeId = (objects.find(e => e.name === objectType))?.id;
  if (!objectTypeId) {
    throw new Error(`objectType ${objectType} not found`);
  }
  return objectTypeId;
}

export function getObjectName(objectTypeId: number): ObjectName {
  const objectType = (objects.find(e => e.id === objectTypeId))?.name;
  if (!objectType) {
    throw new Error(`objectTypeId ${objectTypeId} not found`);
  }
  return objectType;
}
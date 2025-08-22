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
    try {
      objectTypeId = await getTerrainBlockType(publicClient, worldAddress, pos);
    } catch (error) {
      // Handle the "Chunk not explored" error
      if (error instanceof Error && error.message.includes("Chunk not explored")) {
        console.log(`Chunk not explored at position [${pos.join(", ")}]`);
        // Return a default value (0 typically represents air/empty space in voxel games)
        return 0; // Null
      }
      // Re-throw other errors
      throw error;
    }
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

export function getObjectName(objectTypeId: number): string {
  const objectType = (objects.find(e => e.id === objectTypeId))?.name;
  if (!objectType) {
    throw new Error(`objectTypeId ${objectTypeId} not found`);
  }
  return objectType;
}
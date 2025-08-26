import { getChunkBytecode, readTerrainBlockType, Vec3 } from "@dust/world/internal";
import { publicClient, worldAddress } from "../utils/chain";
import { FALLBACK_CHUNK_BYTECODE } from "../utils/constants";

export async function getChunkData(
  chunkPos: Vec3,
): Promise<string> {
  let chunkData = FALLBACK_CHUNK_BYTECODE;
  try {
    chunkData = await getChunkBytecode(publicClient, worldAddress, chunkPos);
  } catch (error) {
    console.log(`getChunkBytecode error at chunk[${chunkPos.join(", ")}]`);
  }
  return chunkData;
}

export function getBlockTypeFromChunkData(
  chunkData: string,
  coords: Vec3,
): number {
  let blockType = 0;
  try {
    blockType = readTerrainBlockType(chunkData, coords);
  } catch (error) {
    console.log(`readTerrainBlockType error at position[${coords.join(", ")}]`);
  }
  return blockType;
}
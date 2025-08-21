import { Vec3 } from "@dust/world/internal";
import { getObjectTypeAt } from "../actions/getObjectTypeAt";

export async function getObjectsInArea(
  [lowerX, lowerY, lowerZ]: Vec3,
  [upperX, upperY, upperZ]: Vec3,
  objectTypeId: number
): Promise<Vec3[]> {
  const positions: Vec3[] = [];
  for (let x = lowerX; x <= upperX; x++) {
    for (let y = lowerY; y <= upperY; y++) {
      for (let z = lowerZ; z <= upperZ; z++) {
        const coord: Vec3 = [x, y, z];
        const objectType = await getObjectTypeAt(coord);
        if (objectType !== objectTypeId) {
          continue;
        }
        positions.push(coord);
      }
    }
  }
  return positions;
}

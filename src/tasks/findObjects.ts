import { Vec3 } from "@dust/world/internal";
import { isBlockPassThrough } from "../actions/blockCategory";
import { getObjectTypeAt } from "../actions/getObjectTypeAt";

export async function getOnAirObjectsInArea(
  [lowerX, lowerY, lowerZ]: Vec3,
  [upperX, upperY, upperZ]: Vec3,
  objectTypeId: number
): Promise<Vec3[]> {
  const positions: Vec3[] = [];
  // Track which (x,z) coordinates have blocks in air to skip checking below them
  const skipColumns: Set<string> = new Set();

  // Iterate from top to bottom on Y-axis
  for (let x = lowerX; x <= upperX; x++) {
    for (let z = lowerZ; z <= upperZ; z++) {
      // Create a key for this column
      const columnKey = `${x},${z}`;

      for (let y = upperY; y >= lowerY; y--) {
        // Skip if this column has already been marked to skip
        if (skipColumns.has(columnKey)) {
          continue;
        }

        const coord: Vec3 = [x, y, z];
        const objectType = await getObjectTypeAt(coord);

        // If object type is 0, skip the entire column
        if (objectType === 0) {
          skipColumns.add(columnKey);
          continue;
        }

        // Check if this block is in the air by checking if the block above is pass-through
        if (y < upperY) {
          const blockAbove = await getObjectTypeAt([x, y + 1, z]);
          const isInAir = isBlockPassThrough(blockAbove);
          const isPassThrough = isBlockPassThrough(objectType);

          // If this block is in the air, mark this column to skip all blocks below
          if (isInAir && !isPassThrough) {
            skipColumns.add(columnKey);
          }
        }

        if (objectType !== objectTypeId) {
          continue;
        }

        positions.push(coord);
      }
    }
  }

  return positions;
}

/**ref
 * Vec::Y: vertical direction
 * if (onTheAir) {
        // call isBlockPassThrough to verify if the block on the top is pass through
        positions = positions.filter(async (position) => {
            const topBlockTypeId = await getObjectTypeAt([position[0], position[1] + 1, position[2]]);
            return isBlockPassThrough(topBlockTypeId);
        });
    }
 */
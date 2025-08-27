// import { categories } from "@dust/world/internal";

import { ObjectName, Vec3 } from "@dust/world/internal";
import { getObjectName, getObjectTypeAt } from "../actions/getObjectTypeAt";
import { isBlockPassThrough } from "../tasks/blockCategory";
import { BotContext, MovePlayerOptions, ToleranceType } from "../types";

// Define Node interface for pathfinding
interface Node {
  position: Vec3;
  g: number; // Cost from start to current node
  h: number; // Heuristic cost from current node to target
  f: number; // Total cost (g + h)
  parent: Node | null; // Reference to parent node for path reconstruction
}

// Helper function to calculate Manhattan distance (heuristic)
function heuristic(a: Vec3, b: Vec3): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

// Helper function to calculate horizontal distance (Manhattan distance ignoring y-axis)
function horizontalDistance(a: Vec3, b: Vec3): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[2] - b[2], 2));
}

// Helper function to calculate cube distance (Manhattan distance in 3D)
function cubeDistance(a: Vec3, b: Vec3): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
}

// Helper function to check if two positions are equal
function posEqual(a: Vec3, b: Vec3): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

// Helper function to get a unique string key for a position
function posToKey(pos: Vec3): string {
  return `${pos[0]},${pos[1]},${pos[2]}`;
}

// Helper function to check if a position is valid for movement
async function isValidPosition(pos: Vec3, avoidBlocks: ObjectName[]): Promise<boolean> {
  // Check if the block at pos is passable
  const blockTypeId = await getObjectTypeAt(pos);
  // If objecttype is 0, it means it has exceeded the world boundary
  if (blockTypeId === 0) {
    return false;
  }
  const isPassable = isBlockPassThrough(blockTypeId);

  // Check if the block above pos is passable (player height is 2 blocks)
  const posAbove: Vec3 = [pos[0], pos[1] + 1, pos[2]];
  const blockAboveTypeId = await getObjectTypeAt(posAbove);
  // If objecttype is 0, it means it has exceeded the world boundary
  if (blockAboveTypeId === 0) {
    return false;
  }
  const isAbovePassable = isBlockPassThrough(blockAboveTypeId);

  // Check if the block below has a solid surface (to prevent falling)
  const posBelow: Vec3 = [pos[0], pos[1] - 1, pos[2]];
  const blockBelowTypeId = await getObjectTypeAt(posBelow);
  // If objecttype is 0, it means it has exceeded the world boundary
  if (blockBelowTypeId === 0) {
    return false;
  }

  // Check if the block below is Lava (prevent moving on top of Lava)
  try {
    const blockBelowName = getObjectName(blockBelowTypeId);
    if (avoidBlocks.includes(blockBelowName)) {
      return false;
    }
  } catch (error) {
    console.log(`Error checking block below: ${error}`);
    return false;
  }

  const isBelowSolid = !isBlockPassThrough(blockBelowTypeId);

  return isPassable && isAbovePassable && isBelowSolid;
}

export async function pathFinding(
  target: Vec3,
  context: BotContext,
  options: MovePlayerOptions
): Promise<Vec3[]> {
  const playerPos = await context.player.getPos();

  // If start and target are the same, return empty path
  if (posEqual(playerPos, target)) {
    return [];
  }

  // Initialize stack for DFS and visited set
  const stack: Node[] = [];
  const visited = new Set<string>();

  // Set a maximum iteration limit to prevent infinite loops
  const maxIterations = 30000;
  let iterations = 0;

  // Create start node
  const startNode: Node = {
    position: playerPos,
    g: 0,
    h: heuristic(playerPos, target),
    f: heuristic(playerPos, target),
    parent: null
  };

  // Add start node to stack
  stack.push(startNode);

  // Main DFS loop
  while (stack.length > 0 && iterations < maxIterations) {
    iterations++;

    // Get the current node from the top of the stack (DFS)
    const currentNode = stack.pop();
    console.log(`current pos: ${currentNode?.position} -> ${target}`);
    if (!currentNode) {
      break;
    }

    // Skip if we've already visited this node
    const nodeKey = posToKey(currentNode.position);
    if (visited.has(nodeKey)) {
      continue;
    }

    // Mark as visited
    visited.add(nodeKey);

    // If we reached the target or are within tolerance distance, reconstruct and return the path
    if (posEqual(currentNode.position, target) ||
      (options.toleranceType === ToleranceType.Horizontal && horizontalDistance(currentNode.position, target) <= options.tolerance) ||
      (options.toleranceType === ToleranceType.Cube && cubeDistance(currentNode.position, target) <= options.tolerance)) {
      const path: Vec3[] = [];
      let current: Node | null = currentNode;

      while (current !== null) {
        path.unshift(current.position);
        current = current.parent;
      }

      return path;
    }

    // Get potential neighbor positions
    const cardinalDirections: Vec3[] = [
      [currentNode.position[0] + 1, currentNode.position[1], currentNode.position[2]], // PositiveX
      [currentNode.position[0] - 1, currentNode.position[1], currentNode.position[2]], // NegativeX
      [currentNode.position[0], currentNode.position[1] + 1, currentNode.position[2]], // PositiveY
      [currentNode.position[0], currentNode.position[1] - 1, currentNode.position[2]], // NegativeY
      [currentNode.position[0], currentNode.position[1], currentNode.position[2] + 1], // PositiveZ
      [currentNode.position[0], currentNode.position[1], currentNode.position[2] - 1], // NegativeZ
    ];

    const edgeDirections: Vec3[] = [
      [currentNode.position[0] + 1, currentNode.position[1] + 1, currentNode.position[2]], // PositiveXPositiveY
      [currentNode.position[0] + 1, currentNode.position[1] - 1, currentNode.position[2]], // PositiveXNegativeY
      [currentNode.position[0] - 1, currentNode.position[1] + 1, currentNode.position[2]], // NegativeXPositiveY
      [currentNode.position[0] - 1, currentNode.position[1] - 1, currentNode.position[2]], // NegativeXNegativeY
      [currentNode.position[0] + 1, currentNode.position[1], currentNode.position[2] + 1], // PositiveXPositiveZ
      [currentNode.position[0] + 1, currentNode.position[1], currentNode.position[2] - 1], // PositiveXNegativeZ
      [currentNode.position[0] - 1, currentNode.position[1], currentNode.position[2] + 1], // NegativeXPositiveZ
      [currentNode.position[0] - 1, currentNode.position[1], currentNode.position[2] - 1], // NegativeXNegativeZ
      [currentNode.position[0], currentNode.position[1] + 1, currentNode.position[2] + 1], // PositiveYPositiveZ
      [currentNode.position[0], currentNode.position[1] + 1, currentNode.position[2] - 1], // PositiveYNegativeZ
      [currentNode.position[0], currentNode.position[1] - 1, currentNode.position[2] + 1], // NegativeYPositiveZ
      [currentNode.position[0], currentNode.position[1] - 1, currentNode.position[2] - 1], // NegativeYNegativeZ
    ];

    const cornerDirections: Vec3[] = [
      [currentNode.position[0] + 1, currentNode.position[1] + 1, currentNode.position[2] + 1], // PositiveXPositiveYPositiveZ
      [currentNode.position[0] + 1, currentNode.position[1] + 1, currentNode.position[2] - 1], // PositiveXPositiveYNegativeZ
      [currentNode.position[0] + 1, currentNode.position[1] - 1, currentNode.position[2] + 1], // PositiveXNegativeYPositiveZ
      [currentNode.position[0] + 1, currentNode.position[1] - 1, currentNode.position[2] - 1], // PositiveXNegativeYNegativeZ
      [currentNode.position[0] - 1, currentNode.position[1] + 1, currentNode.position[2] + 1], // NegativeXPositiveYPositiveZ
      [currentNode.position[0] - 1, currentNode.position[1] + 1, currentNode.position[2] - 1], // NegativeXPositiveYNegativeZ
      [currentNode.position[0] - 1, currentNode.position[1] - 1, currentNode.position[2] + 1], // NegativeXNegativeYPositiveZ
      [currentNode.position[0] - 1, currentNode.position[1] - 1, currentNode.position[2] - 1], // NegativeXNegativeYNegativeZ
    ];

    const allDirections = [...cardinalDirections, ...edgeDirections, ...cornerDirections];

    // Collect valid neighbors
    const neighbors: { pos: Vec3, distance: number }[] = [];

    for (const neighborPos of allDirections) {
      const neighborKey = posToKey(neighborPos);

      // Skip if already visited
      if (visited.has(neighborKey)) {
        continue;
      }

      // Check if the neighbor position is valid for movement
      if (!(await isValidPosition(neighborPos, options.avoidBlocks))) {
        continue;
      }

      // Calculate distance to target for sorting
      const distanceToTarget = heuristic(neighborPos, target);
      neighbors.push({
        pos: neighborPos,
        distance: distanceToTarget
      });
    }

    // Sort neighbors by distance to target (closest first)
    neighbors.sort((a, b) => a.distance - b.distance);

    // Add neighbors to stack in reverse order (so closest is popped first)
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      if (!neighbor) continue;

      const neighborPos = neighbor.pos;
      const distanceToTarget = neighbor.distance;

      // Create neighbor node
      const neighborNode: Node = {
        position: neighborPos,
        g: currentNode.g + 1, // Simple step cost
        h: distanceToTarget,
        f: currentNode.g + 1 + distanceToTarget,
        parent: currentNode
      };

      // Add to stack
      stack.push(neighborNode);
    }
  }

  // No path found or max iterations reached
  if (iterations >= maxIterations) {
    console.log("Pathfinding reached maximum iterations limit");
  }
  return [];
}
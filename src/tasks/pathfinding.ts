// import { categories } from "@dust/world/internal";

import { Vec3 } from "@dust/world/internal";
import { isBlockPassThrough } from "../actions/blockCategory";
import { getObjectTypeAt } from "../actions/getObjectTypeAt";
import { BotContext } from "../types";

// Helper function to calculate Manhattan distance (heuristic)
function heuristic(a: Vec3, b: Vec3): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

// Helper function to calculate horizontal distance (ignoring y-axis)
function horizontalDistance(a: Vec3, b: Vec3): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[2] - b[2]);
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
async function isValidPosition(pos: Vec3): Promise<boolean> {
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
  const isBelowSolid = !isBlockPassThrough(blockBelowTypeId);

  return isPassable && isAbovePassable && isBelowSolid;
}

// Helper function to get valid neighbors of a position
async function getNeighbors(pos: Vec3): Promise<Vec3[]> {
  const neighbors: Vec3[] = [];

  // Cardinal directions (6)
  const cardinalDirections: Vec3[] = [
    [pos[0] + 1, pos[1], pos[2]], // PositiveX
    [pos[0] - 1, pos[1], pos[2]], // NegativeX
    [pos[0], pos[1] + 1, pos[2]], // PositiveY
    [pos[0], pos[1] - 1, pos[2]], // NegativeY
    [pos[0], pos[1], pos[2] + 1], // PositiveZ
    [pos[0], pos[1], pos[2] - 1], // NegativeZ
  ];

  // Edge directions (12)
  const edgeDirections: Vec3[] = [
    [pos[0] + 1, pos[1] + 1, pos[2]], // PositiveXPositiveY
    [pos[0] + 1, pos[1] - 1, pos[2]], // PositiveXNegativeY
    [pos[0] - 1, pos[1] + 1, pos[2]], // NegativeXPositiveY
    [pos[0] - 1, pos[1] - 1, pos[2]], // NegativeXNegativeY
    [pos[0] + 1, pos[1], pos[2] + 1], // PositiveXPositiveZ
    [pos[0] + 1, pos[1], pos[2] - 1], // PositiveXNegativeZ
    [pos[0] - 1, pos[1], pos[2] + 1], // NegativeXPositiveZ
    [pos[0] - 1, pos[1], pos[2] - 1], // NegativeXNegativeZ
    [pos[0], pos[1] + 1, pos[2] + 1], // PositiveYPositiveZ
    [pos[0], pos[1] + 1, pos[2] - 1], // PositiveYNegativeZ
    [pos[0], pos[1] - 1, pos[2] + 1], // NegativeYPositiveZ
    [pos[0], pos[1] - 1, pos[2] - 1], // NegativeYNegativeZ
  ];

  // Corner directions (8)
  const cornerDirections: Vec3[] = [
    [pos[0] + 1, pos[1] + 1, pos[2] + 1], // PositiveXPositiveYPositiveZ
    [pos[0] + 1, pos[1] + 1, pos[2] - 1], // PositiveXPositiveYNegativeZ
    [pos[0] + 1, pos[1] - 1, pos[2] + 1], // PositiveXNegativeYPositiveZ
    [pos[0] + 1, pos[1] - 1, pos[2] - 1], // PositiveXNegativeYNegativeZ
    [pos[0] - 1, pos[1] + 1, pos[2] + 1], // NegativeXPositiveYPositiveZ
    [pos[0] - 1, pos[1] + 1, pos[2] - 1], // NegativeXPositiveYNegativeZ
    [pos[0] - 1, pos[1] - 1, pos[2] + 1], // NegativeXNegativeYPositiveZ
    [pos[0] - 1, pos[1] - 1, pos[2] - 1], // NegativeXNegativeYNegativeZ
  ];

  // Combine all directions
  const allDirections = [...cardinalDirections, ...edgeDirections, ...cornerDirections];

  // Check each direction for validity
  for (const neighbor of allDirections) {
    if (await isValidPosition(neighbor)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

export async function pathFinding(
  target: Vec3,
  context: BotContext,
  horizontalDistanceTolerance: number = 5
): Promise<Vec3[]> {
  const playerPos = context.player.pos;

  // If start and target are the same, return empty path
  if (posEqual(playerPos, target)) {
    return [];
  }

  // Initialize stack for DFS and visited set
  const stack: Node[] = [];
  const visited = new Set<string>();

  // Set a maximum iteration limit to prevent infinite loops
  const maxIterations = 10000;
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

    // If we reached the target or are within 5 blocks of it horizontally (ignoring y-axis), reconstruct and return the path
    if (posEqual(currentNode.position, target) || horizontalDistance(currentNode.position, target) <= horizontalDistanceTolerance) {
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
      if (!(await isValidPosition(neighborPos))) {
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
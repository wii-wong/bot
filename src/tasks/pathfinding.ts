// import { categories } from "@dust/world/internal";

import { Vec3 } from "@dust/world/internal";
import { isBlockPassThrough } from "../actions/blockCategory";
import { getObjectTypeAt } from "../actions/getObjectTypeAt";
import { BotContext } from "../types";

/*
世界是基于minecraft的。
Given a start position and an end position (Vec3), use A* algorithm to plan the path
Note: The world is a 3D grid, and the path is planned in the grid space
The world has gravity, 这意味着如果下方没有实体block，玩家会下落(路径规划不允许掉落)
Direction: Y is the vertical (gravity) direction
X and Z are the horizontal directions
Player 占据的坐标是 (x, y, z) 和 (x, y+1, z)

call isBlockPassThrough() to verify if the block is pass through

所有的可移动方向为：
Direction: [
      // Cardinal directions (6)
      "PositiveX",
      "NegativeX",
      "PositiveY",
      "NegativeY",
      "PositiveZ",
      "NegativeZ",
      // Edge directions (12)
      "PositiveXPositiveY",
      "PositiveXNegativeY",
      "NegativeXPositiveY",
      "NegativeXNegativeY",
      "PositiveXPositiveZ",
      "PositiveXNegativeZ",
      "NegativeXPositiveZ",
      "NegativeXNegativeZ",
      "PositiveYPositiveZ",
      "PositiveYNegativeZ",
      "NegativeYPositiveZ",
      "NegativeYNegativeZ",
      // Corner directions (8)
      "PositiveXPositiveYPositiveZ",
      "PositiveXPositiveYNegativeZ",
      "PositiveXNegativeYPositiveZ",
      "PositiveXNegativeYNegativeZ",
      "NegativeXPositiveYPositiveZ",
      "NegativeXPositiveYNegativeZ",
      "NegativeXNegativeYPositiveZ",
      "NegativeXNegativeYNegativeZ",
    ],

    call getObjectTypeAt() to get the type of the block at some position

 */

// Node interface for A* algorithm
interface Node {
  position: Vec3;
  g: number; // Cost from start to current node
  h: number; // Heuristic (estimated cost from current to target)
  f: number; // Total cost (g + h)
  parent: Node | null;
}

// Helper function to calculate Manhattan distance (heuristic)
function heuristic(a: Vec3, b: Vec3): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
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
  const isPassable = isBlockPassThrough(blockTypeId);

  // Check if the block above pos is passable (player height is 2 blocks)
  const posAbove: Vec3 = [pos[0], pos[1] + 1, pos[2]];
  const blockAboveTypeId = await getObjectTypeAt(posAbove);
  const isAbovePassable = isBlockPassThrough(blockAboveTypeId);

  // Check if the block below has a solid surface (to prevent falling)
  const posBelow: Vec3 = [pos[0], pos[1] - 1, pos[2]];
  const blockBelowTypeId = await getObjectTypeAt(posBelow);
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
  context: BotContext
): Promise<Vec3[]> {
  const playerPos = context.player.pos;

  // If start and target are the same, return empty path
  if (posEqual(playerPos, target)) {
    return [];
  }

  // Check if target position is valid
  if (!(await isValidPosition(target))) {
    console.log("Target position is not valid for movement");
    return [];
  }

  // Initialize open and closed sets
  const openSet: Node[] = [];
  const closedSet = new Set<string>();

  // Set a maximum iteration limit to prevent infinite loops
  const maxIterations = 1000;
  let iterations = 0;

  // Create start node
  const startNode: Node = {
    position: playerPos,
    g: 0,
    h: heuristic(playerPos, target),
    f: heuristic(playerPos, target),
    parent: null
  };

  // Add start node to open set
  openSet.push(startNode);

  // Main A* loop
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      // Make sure both nodes exist before comparing
      const currentNode = openSet[currentIndex];
      const nextNode = openSet[i];
      if (currentNode && nextNode && nextNode.f < currentNode.f) {
        currentIndex = i;
      }
    }

    // Get the current node (guaranteed to exist since openSet.length > 0)
    const currentNode = openSet[currentIndex];
    if (!currentNode) {
      // This should never happen, but TypeScript needs this check
      break;
    }

    // If we reached the target, reconstruct and return the path
    if (posEqual(currentNode.position, target)) {
      const path: Vec3[] = [];
      let current: Node | null = currentNode;

      while (current !== null) {
        path.unshift(current.position);
        current = current.parent;
      }

      return path;
    }

    // Move current node from open to closed set
    openSet.splice(currentIndex, 1);
    closedSet.add(posToKey(currentNode.position));

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

    // Process each potential neighbor
    for (const neighborPos of allDirections) {
      const neighborKey = posToKey(neighborPos);

      // Skip if neighbor is in closed set
      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Check if the neighbor position is valid for movement
      if (!(await isValidPosition(neighborPos))) {
        continue;
      }

      // Calculate g score for this neighbor
      // Use Euclidean distance for more accurate movement cost
      const dx = neighborPos[0] - currentNode.position[0];
      const dy = neighborPos[1] - currentNode.position[1];
      const dz = neighborPos[2] - currentNode.position[2];
      const moveCost = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const tentativeG = currentNode.g + moveCost;

      // Find if neighbor is already in open set
      const existingNeighborIndex = openSet.findIndex(node =>
        node && posEqual(node.position, neighborPos)
      );

      if (existingNeighborIndex === -1) {
        // Neighbor is not in open set, add it
        const h = heuristic(neighborPos, target);
        openSet.push({
          position: neighborPos,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: currentNode
        });
      } else {
        const existingNeighbor = openSet[existingNeighborIndex];
        if (existingNeighbor && tentativeG < existingNeighbor.g) {
          // Found a better path to an existing neighbor
          existingNeighbor.g = tentativeG;
          existingNeighbor.f = tentativeG + existingNeighbor.h;
          existingNeighbor.parent = currentNode;
        }
      }
    }
  }

  // No path found or max iterations reached
  if (iterations >= maxIterations) {
    console.log("Pathfinding reached maximum iterations limit");
  }
  return [];
}
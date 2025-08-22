
世界是基于minecraft的。

Note: The world is a 3D grid, and the path is planned in the grid space
The world has gravity, 这意味着如果下方没有实体block，玩家会下落
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

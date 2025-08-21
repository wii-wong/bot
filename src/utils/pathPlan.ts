// import { categories } from "@dust/world/internal";

/*
世界是基于minecraft的。
Given a start position and an end position (Vec3), use A* algorithm to plan the path
Note: The world is a 2D grid, and the path is planned in the grid space
The world has gravity, 这意味着如果下方没有实体block，玩家会下落
Direction: Y is the vertical (gravity) direction
X and Z are the horizontal directions
Player 占据的坐标是 (x, y, z) 和 (x, y+1, z)
categories.passThrough 中的 block 可以被 pass through

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

 */
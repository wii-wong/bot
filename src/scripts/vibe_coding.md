*.dust file content format

File with .dust extension is designed for architectural structure in Dust World (refer to /vibe_coding.md in root directory). 
 
With this file, bot can automatically construct buildings in Dust World.

Following is the format of .dust file:

- First line describes the size of the building.
  - Format: `width,height,depth`
  - `width`, `height`, `depth`: Size of the building in x, y, z direction.

- Each line represents a voxel.

- Format: `x,y,z,material`
  - `x`, `y`, `z`: Coordinates of the voxel. (x, y, z) is the offset from the bottom left corner of the building. And should not be negative.
  - `material`: Material id of the voxel. (refer to `objects` exported by `@dust/world/dist/ts/objects.js`)

- Direction:
  - x: positive direction is East
  - y: positive direction is up
  - z: positive direction is South

- Arrange:
  - Arrange the lines with x-axis first, then z-axis, finally y-axis

- Example:
  - `2, 2, 2`  represents a building with 2x2x2 voxels reservation.
  - `0,0,0,11` represents a voxel at (0, 0, 0) with material id 11.
  - `1,0,0,11` represents a voxel at (1, 0, 0) with material id 11.
  - `0,1,0,11` represents a voxel at (0, 1, 0) with material id 11.
import {
  ObjectName,
  Vec3
} from "@dust/world/internal";
import { getObjectTypeAt, getObjectTypeId } from "../actions/getObjectTypeAt";
import { BotContext, FindResourcesOptions } from "../types";
import { getObjectCategory } from "./blockCategory";

export async function findResources(objectName: ObjectName, radius: number, context: BotContext, options: FindResourcesOptions) {
  const { filterObjectCategories, originPos } = options;
  const targetObjectType = getObjectTypeId(objectName);

  const pos = originPos ?? await context.player.getPos();

  const startPos: Vec3 = [pos[0] - radius, pos[1] - radius, pos[2] - radius];
  const endPos: Vec3 = [pos[0] + radius, pos[1] + radius, pos[2] + radius];

  const res: Vec3[] = [];

  for (let x = startPos[0]; x <= endPos[0]; x++) {
    for (let y = startPos[1]; y <= endPos[1]; y++) {
      for (let z = startPos[2]; z <= endPos[2]; z++) {
        const objectType = await getObjectTypeAt([x, y, z]);
        if (objectType === targetObjectType) {
          const categories = await getObjectCategory([x, y, z]);
          if (filterObjectCategories) {
            for (const filterObjectCategory of filterObjectCategories) {
              if (categories.includes(filterObjectCategory)) {
                res.push([x, y, z]);
              }
            }
          } else {
            res.push([x, y, z]);
          }
        }
      }
    }
  }

  // sort by distance
  res.sort((a, b) => {
    const aDist = Math.sqrt(Math.pow(a[0] - pos[0], 2) + Math.pow(a[1] - pos[1], 2) + Math.pow(a[2] - pos[2], 2));
    const bDist = Math.sqrt(Math.pow(b[0] - pos[0], 2) + Math.pow(b[1] - pos[1], 2) + Math.pow(b[2] - pos[2], 2));
    return aDist - bDist;
  });

  console.log("findResources", res);

  return res;
}



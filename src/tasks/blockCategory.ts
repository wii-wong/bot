import { categories, Vec3 } from "@dust/world/internal";
import { getObjectName, getObjectTypeAt } from "../actions/getObjectTypeAt";
import { ObjectCategory } from "../types";
import { WorldBoundary } from "../utils/constants";

export function isBlockPassThrough(objectTypeId: number) {
    const objectType = getObjectName(objectTypeId);
    return categories.PassThrough.objects.includes(objectType as any);
}

export async function isBlockOnSurface(pos: Vec3): Promise<boolean> {
    for (let height = pos[1] + 1; height < WorldBoundary.Y_MAX; height++) {
        const objectType = await getObjectTypeAt([pos[0], height, pos[2]]);
        if (objectType === 0) {
            continue;
        }
        if (!isBlockPassThrough(objectType)) {
            return false;
        }
    }
    return true;
}

function getNeighbors6(pos: Vec3): Vec3[] {
    return [
        [pos[0] + 1, pos[1], pos[2]],
        [pos[0] - 1, pos[1], pos[2]],
        [pos[0], pos[1] + 1, pos[2]],
        [pos[0], pos[1] - 1, pos[2]],
        [pos[0], pos[1], pos[2] + 1],
        [pos[0], pos[1], pos[2] - 1],
    ];
}

export async function isBlockReachable(pos: Vec3): Promise<boolean> {
    for (const neighbor of getNeighbors6(pos)) {
        const objectType = await getObjectTypeAt(neighbor);
        if (isBlockPassThrough(objectType)) {
            return true;
        }
    }
    return false;
}

export async function isMineable(pos: Vec3): Promise<boolean> {
    const objectType = await getObjectTypeAt(pos);
    const objectName = getObjectName(objectType);
    return categories.Block.objects.includes(objectName as any);
}

export async function getObjectCategory(pos: Vec3): Promise<ObjectCategory[]> {
    const categories: ObjectCategory[] = [];
    if (await isBlockOnSurface(pos)) {
        categories.push(ObjectCategory.OnSurface);
    }
    if (await isBlockReachable(pos)) {
        categories.push(ObjectCategory.Reachable);
    }
    return categories;
}
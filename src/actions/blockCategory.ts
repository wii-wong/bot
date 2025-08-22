import { categories } from "@dust/world/internal";
import { getObjectType } from "./getObjectTypeAt";

export function isBlockPassThrough(objectTypeId: number) {
    const objectType = getObjectType(objectTypeId);
    return categories.PassThrough.objects.includes(objectType as any);
}
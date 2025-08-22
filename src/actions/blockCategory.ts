import { categories } from "@dust/world/internal";
import { getObjectName } from "./getObjectTypeAt";

export function isBlockPassThrough(objectTypeId: number) {
    const objectType = getObjectName(objectTypeId);
    return categories.PassThrough.objects.includes(objectType as any);
}
import { Vec3 } from "@dust/world/internal";

export const maxPlayerInventorySlots = 36;

export const waterCoord: Vec3 = [888, 62, -1361];

export const lowerFarmCoord: Vec3 = [883, 62, -1367];
export const upperFarmCoord: Vec3 = [892, 63, -1362];

export const MAX_PLAYER_ENERGY = 817600000000000000n;

export const MOVE_PLAYER_DELAY = 1000;

export const MAX_ENTITY_INFLUENCE_RADIUS = 10;

export const BED_POSITION: Vec3 = [226, 71, -2679];

export const enum WorldBoundary {
    Y_MIN = -64,
    Y_MAX = 320,
}

export const CHUNK_SIZE = 16;

export const FALLBACK_CHUNK_BYTECODE = "0x" + "0".repeat(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE * 2);

export const MAX_CONNECTED_DISTANCE = 5;
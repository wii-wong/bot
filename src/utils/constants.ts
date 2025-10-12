import { Vec3 } from "@dust/world/internal";

export const maxPlayerInventorySlots = 36;
export const maxChestInventorySlots = 27;

export const waterCoord: Vec3 = [155, 62, -2611];

export const FARMLAND_CENTER_POSITION: Vec3 = [207, 77, -2618];

export const MAX_PLAYER_ENERGY = 817600000000000000n;

export const MOVE_PLAYER_DELAY = 1000;
export const CHUNK_COMMITMENT_DELAY_TIME = 5000;

export const MAX_ENTITY_INFLUENCE_RADIUS = 10;

export const BED_POSITION: Vec3 = [226, 71, -2679];
export const SPAWN_TILE: Vec3 = [223, 71, -2681];
export const POWER_STONE_POSITION: Vec3 = [224, 71, -2677];
export const FORCE_FIELD_POSITION: Vec3 = [226, 71, -2680];
export const LAVA_POSITION: Vec3 = [265, 76, -2666];
export const SEEDS_CHEST_POSITION: Vec3 = [223, 71, -2682];
export const BUCKET_CHEST_POSITION: Vec3 = [224, 71, -2682];
export const TOOL_CHEST_POSITION: Vec3 = [227, 71, -2682];
export const RESOURCE_CHEST_POSITION: Vec3 = [228, 71, -2682];
export const VWA_CHEST_POSITION: Vec3 = [229, 71, -2683];

export const enum WorldBoundary {
    Y_MIN = -64,
    Y_MAX = 320,
}

export const CHUNK_SIZE = 16;

export const FALLBACK_CHUNK_BYTECODE = "0x" + "0".repeat(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE * 2);

export const MAX_CONNECTED_DISTANCE = 5;

export const LAVA_MOVE_ENERGY_COST = MAX_PLAYER_ENERGY / 10n;
export const WATER_MOVE_ENERGY_COST = MAX_PLAYER_ENERGY / 4000n;
export const MOVE_ENERGY_COST = 25550000000000n;

export const DEFAULT_MINE_ENERGY_COST = 8100000000000000n;
export const TOOL_MINE_ENERGY_COST = 255500000000000n;
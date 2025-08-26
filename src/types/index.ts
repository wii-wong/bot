import { ObjectName, Vec3 } from "@dust/world/internal";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { Hex } from "viem";

export type PlayerInfo = {
    entityId: Hex;
    getPos: () => Promise<Vec3>;
    getEnergy: () => bigint;
};

export type BotContext = {
    stashResult: SyncToStashResult;
    player: PlayerInfo;
};

export enum ToleranceType {
    Horizontal = 1,
    Cube = 2,
}

export type MovePlayerOptions = {
    toleranceType: ToleranceType;
    tolerance: number;
    avoidBlocks: ObjectName[];
}

export enum ObjectCategory {
    Reachable = 1,
}

export type FindResourcesOptions = {
    filterObjectCategories?: ObjectCategory[];
    originPos?: Vec3;
}
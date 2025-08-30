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
    maxLoop?: number;
    fastMode?: boolean;
    ignoreEnergy?: boolean;
}

export enum ObjectCategory {
    Reachable = 1,
    OnSurface = 2,
}

export type FindResourcesOptions = {
    filterObjectCategories?: ObjectCategory[];
    originPos?: Vec3;
}

export type SlotAmount = {
    slot: number;
    amount: number;
}

export type SlotTransfer = {
    slotFrom: number;
    slotTo: number;
    amount: number;
}

export type InteractWithChestParam = {
    chestCoord: Vec3;
    action: 'withdraw' | 'deposit';
    objectName: ObjectName;
    amount: number;
}
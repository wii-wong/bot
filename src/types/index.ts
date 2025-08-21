import { SyncToStashResult } from "@latticexyz/store-sync/internal";
import { PlayerInfo } from "../actions/getPlayerInfo";

export type BotContext = {
    player: PlayerInfo;
    stashResult: SyncToStashResult;
};
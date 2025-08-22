import { BotContext } from "../types";
import { MAX_PLAYER_ENERGY } from "./constants";

export function getEnergyPercent(context: BotContext) {
    return Number((context.player.getEnergy() * 100n) / MAX_PLAYER_ENERGY)
}

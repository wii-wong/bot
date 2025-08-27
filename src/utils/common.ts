import { MAX_PLAYER_ENERGY } from "./constants";

export function getEnergyPercent(energy: bigint) {
    return Number((energy * 100n) / MAX_PLAYER_ENERGY)
}

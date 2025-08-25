import { encodePlayer, Vec3 } from "@dust/world/internal";
import mudConfig from "@dust/world/mud.config";
import { bigIntMax } from "@latticexyz/common/utils";
import { getRecord } from "@latticexyz/store/internal";
import { Hex } from "viem";
import { PlayerInfo } from "../types";
import { publicClient, worldAddress } from "../utils/chain";
import { stash } from "../utils/stash";

export async function getPlayerInfo(address: Hex): Promise<PlayerInfo> {
  const playerEntityId = encodePlayer(address);

  // Fetching a table record from the RPC
  const getPos = async () => {
    const posRecord = await getRecord(publicClient, {
      address: worldAddress,
      table: mudConfig.tables.EntityPosition,
      key: {
        entityId: playerEntityId,
      },
    });
    const playerPos: Vec3 = [posRecord.x, posRecord.y, posRecord.z];
    return playerPos;
  };

  const getEnergy = () => {
    // Fetching a table record from stash
    const energyRecord = stash.getRecord({
      table: mudConfig.tables.Energy,
      key: {
        entityId: playerEntityId,
      },
    });
    if (!energyRecord) {
      return 0n;
    }
    const currentTime = BigInt(Date.now());

    const energy = (() => {
      const lastUpdatedTime = energyRecord.lastUpdatedTime * 1000n;
      const elapsed = (currentTime - lastUpdatedTime) / 1000n;

      const energyDrained = elapsed * energyRecord.drainRate;

      return bigIntMax(0n, energyRecord.energy - energyDrained);
    })();

    return energy;
  };

  return {
    entityId: playerEntityId,
    getPos,
    getEnergy,
  };
}

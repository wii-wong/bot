import mudConfig from "@dust/world/mud.config";
import { createStash } from "@latticexyz/stash/internal";

export const tables = {
  EntityObjectType: mudConfig.tables.EntityObjectType,
  InventorySlot: mudConfig.tables.InventorySlot,
  Energy: mudConfig.tables.Energy,
};

export const stash = createStash({ namespaces: { "": { tables } } });

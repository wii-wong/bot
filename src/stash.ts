import mudConfig from "@dust/world/mud.config";
import { createStash } from "@latticexyz/stash/internal";

export const tables = {
  EntityObjectType: mudConfig.tables.EntityObjectType,
};

export const stash = createStash({ namespaces: { "": { tables } } });

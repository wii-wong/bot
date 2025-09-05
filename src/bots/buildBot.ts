import { Vec3 } from "@dust/world/internal";
import console from "console";
import * as fs from "fs";
import { getObjectName } from "../actions/getObjectTypeAt";
import { buildWithTemplate } from "../tasks/buildWithTemplate";
import { InteractWithChest } from "../tasks/InteractWithChest";
import { BotContext } from "../types";
import { RESOURCE_CHEST_POSITION } from "../utils/constants";


/// CONSTANTS
const OFFSET: Vec3 = [310, 68, -2481];
const TEMPLATE_FILE_PATH = "src/scripts/output/bitly.dust";
const TEMPLATE_BLOCK_COUNT = "src/scripts/output/bitly_blockcount.json";


/**
 * Reads a JSON file and returns its parsed content
 * @param filePath Path to the JSON file
 * @returns Parsed JSON content
 */
async function readJsonFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading JSON file: ${filePath}`, err);
        reject(err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseErr) {
        console.error(`Error parsing JSON file: ${filePath}`, parseErr);
        reject(parseErr);
      }
    });
  });
}

export async function buildBot(context: BotContext) {
  // Step 1: Get resources from chest
  const blockCount = await readJsonFile(TEMPLATE_BLOCK_COUNT);

  // Withdraw each block type from the chest
  for (const [blockIdStr, count] of Object.entries(blockCount)) {
    const blockId = parseInt(blockIdStr, 10);
    const objectName = getObjectName(blockId);

    console.log(`Withdrawing ${count} of ${objectName} (ID: ${blockId}) from chest`);

    await InteractWithChest({
      chestCoord: RESOURCE_CHEST_POSITION,
      action: "withdraw",
      objectName: objectName,
      amount: count as number,
    }, context);
  }

  // Step 2: Build with template
  await buildWithTemplate({
    offset: OFFSET,
    templateFile: TEMPLATE_FILE_PATH
  }, context);
}


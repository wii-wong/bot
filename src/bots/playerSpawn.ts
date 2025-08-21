import { randomSpawn } from "../actions/randomSpawn";
import { BotContext } from "../types";


export async function playerSpawn(context: BotContext) {
    await randomSpawn(context);
}

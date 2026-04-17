import { eat } from "../actions/eat";
import { BotContext } from "../types";

export async function eatFoodBot(slot: number, amount: number, context: BotContext) {
  await eat(slot, amount, context);
  console.log(`Finished eating ${amount} food from slot ${slot}`);
}

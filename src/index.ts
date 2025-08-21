import { farmingBot } from "./bots/farmingBot";

async function main() {
  await farmingBot();
}

main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});

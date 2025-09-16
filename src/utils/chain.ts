import IWorldAbi from "@dust/world/out/IWorld.sol/IWorld.abi";
import worldsJson from "@dust/world/worlds.json";
import { createBurnerAccount } from "@latticexyz/common";
import { transactionQueue } from "@latticexyz/common/actions";
import {
  redstone as redstoneChain,
  type MUDChain,
} from "@latticexyz/common/chains";
import dotenv from "dotenv";
import {
  ClientConfig,
  createPublicClient,
  createWalletClient,
  fallback,
  getContract,
  Hex,
  http,
  PublicClient,
  webSocket,
} from "viem";

dotenv.config();

export const redstone = {
  ...redstoneChain,
  // rpcUrls: {
  //   ...redstoneChain.rpcUrls,
  //   wiresaw: {
  //     http: ["https://wiresaw.redstonechain.com"],
  //     webSocket: ["wss://wiresaw.redstonechain.com"],
  //   },
  // },
  // indexerUrl: "https://indexer.alpha.dustproject.org",
} satisfies MUDChain;


export const chain = redstone;

const clientOptions = {
  chain: chain,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 2_000,
} as const satisfies ClientConfig;

export const worldAddress = worldsJson[chain.id]?.address as Hex;
export const worldBlockNumber = worldsJson[chain.id]?.blockNumber ?? 0;

export const publicClient = createPublicClient(clientOptions) as PublicClient;

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}
if (!worldAddress) {
  throw new Error("World address is not defined for the current chain");
}

export const walletClient = createWalletClient({
  ...clientOptions,
  account: createBurnerAccount(privateKey as Hex),
}).extend(transactionQueue());

export const worldContract = getContract({
  address: worldAddress as Hex,
  abi: IWorldAbi,
  client: { public: publicClient, wallet: walletClient },
});

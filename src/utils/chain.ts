import IWorldAbi from "@dust/world/out/IWorld.sol/IWorld.abi";
import { createBurnerAccount } from "@latticexyz/common";
import { transactionQueue } from "@latticexyz/common/actions";
import {
  type MUDChain
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

export const dustchain = {
  id: 55378,
  name: "DUST Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.dustproject.org"],
      webSocket: ["wss://rpc.dustproject.org"],
    },
    wiresaw: {
      http: ["https://rpc.dustproject.org"],
      webSocket: ["wss://rpc.dustproject.org"],
    },
  },
} satisfies MUDChain;


export const chain = dustchain;

const clientOptions = {
  chain: chain,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 2_000,
} as const satisfies ClientConfig;

export const worldAddress = "0x253eb85B3C953bFE3827CC14a151262482E7189C"; // worldsJson[chain.id]?.address as Hex;
export const worldBlockNumber = 1200000; // worldsJson[chain.id]?.blockNumber ?? 0;

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

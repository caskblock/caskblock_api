import dotenv from "dotenv";
import * as nearAPI from "near-api-js";
import { Account, InMemorySigner, KeyPair } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { JsonRpcProvider } from "near-api-js/lib/providers";
import { mbjs } from "@mintbase-js/sdk";
// import Stripe from "stripe";

dotenv.config();

const portEnv = process.env.PORT || "8888";

async function connect(
  accountId: string,
  privateKey: string,
  network: string
): Promise<Account> {
  const keyStore = new InMemoryKeyStore();
  await keyStore.setKey(network, accountId, KeyPair.fromString(privateKey));

  const provider = new JsonRpcProvider({
    url: `https://rpc.${network}.near.org`,
  });

  const signer = new InMemorySigner(keyStore);

  const account = new Account(
    {
      networkId: network,
      provider,
      signer,
      jsvmAccountId: "",
    },
    accountId
  );

  return account;
}

function readEnvVar(name: string): string {
  const envVar = process.env[name];
  if (!envVar) throw new Error(`${name} is not defined`);
  return envVar;
}

export const config = (() => {
  const actorAccountId = readEnvVar("ACTOR_ACCOUNT_ID");
  const actorSecretKey = readEnvVar("ACTOR_SECRET_KEY");
  const nearNetwork = readEnvVar("NEAR_NETWORK");

  mbjs.config({ network: nearNetwork });

  return {
    port: parseInt(portEnv),
    keys: mbjs.keys,
    getActorAccount: async () =>
      connect(actorAccountId, actorSecretKey, nearNetwork)
  };
})();
export default config;

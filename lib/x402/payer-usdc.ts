import "server-only";

import { Horizon, Keypair } from "@stellar/stellar-sdk";

import { CIRCLE_TESTNET_USDC_ISSUER } from "@/lib/stellar-expert";

const MIN_USDC = 0.001;

export type PayerUsdc = {
  publicKey: string;
  balance: string;
};

export async function requirePayerUsdc(
  secret: string,
): Promise<PayerUsdc | { error: string; hint: string; publicKey: string }> {
  const payer = Keypair.fromSecret(secret);
  const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
  const account = await horizon.loadAccount(payer.publicKey());
  const usdc = account.balances.find(
    (b) =>
      b.asset_type !== "native" &&
      b.asset_type !== "liquidity_pool_shares" &&
      b.asset_code === "USDC" &&
      b.asset_issuer === CIRCLE_TESTNET_USDC_ISSUER,
  );

  if (!usdc) {
    return {
      error: "Payer has no Circle testnet USDC trustline",
      hint: "Run node scripts/setup.mjs, then fund the payer at faucet.circle.com",
      publicKey: payer.publicKey(),
    };
  }

  if (parseFloat(usdc.balance) < MIN_USDC) {
    return {
      error: `Payer USDC balance is ${usdc.balance}`,
      hint: `Need at least ${MIN_USDC} USDC. Friendbot only funds XLM. Use the Circle faucet.`,
      publicKey: payer.publicKey(),
    };
  }

  return { publicKey: payer.publicKey(), balance: usdc.balance };
}

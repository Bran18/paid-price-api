import dotenv from "dotenv";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { Horizon, Keypair } from "@stellar/stellar-sdk";

dotenv.config({ path: ".env.local" });
dotenv.config();

const NETWORK = process.env.STELLAR_NETWORK ?? "stellar:testnet";
const secret = process.env.STELLAR_SECRET_KEY?.trim();
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const MIN_USDC = 0.001;

if (!secret) {
  console.error(
    "Set STELLAR_SECRET_KEY in .env.local (payer with USDC trustline + balance)",
  );
  process.exit(1);
}

const payer = Keypair.fromSecret(secret);
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
const account = await horizon.loadAccount(payer.publicKey());
const usdc = account.balances.find(
  (b) =>
    b.asset_type !== "native" &&
    b.asset_code === "USDC" &&
    b.asset_issuer === USDC_ISSUER,
);

if (!usdc) {
  console.error(
    `Payer ${payer.publicKey()} has no Circle testnet USDC trustline.\nRe-run: node scripts/setup.mjs`,
  );
  process.exit(1);
}

if (parseFloat(usdc.balance) < MIN_USDC) {
  console.error(`Payer USDC balance is ${usdc.balance} (need at least ${MIN_USDC}).
The x402 payment is $0.001 Circle USDC. Friendbot only funds XLM.

1. Open https://faucet.circle.com/
2. Select Stellar testnet
3. Paste: ${payer.publicKey()}
4. Complete the captcha, then run npm run buy again`);
  process.exit(1);
}

const signer = createEd25519Signer(secret, NETWORK);

const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: NETWORK, client: new ExactStellarScheme(signer) }],
});

const url = `${baseUrl.replace(/\/$/, "")}/price/xlm`;
console.log(`GET ${url}`);
console.log(`Payer ${payer.publicKey()} USDC ${usdc.balance}`);

const res = await fetchWithPayment(url);
console.log(`Status: ${res.status}`);
const text = await res.text();
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text);
}

const paymentResponse = res.headers.get("PAYMENT-RESPONSE");
if (paymentResponse) {
  const { decodePaymentResponseHeader } = await import("@x402/fetch");
  const settled = decodePaymentResponseHeader(paymentResponse);
  if (settled.transaction) {
    console.log(
      `StellarExpert: https://stellar.expert/explorer/testnet/tx/${settled.transaction}`,
    );
  }
}

if (!res.ok) {
  process.exit(1);
}


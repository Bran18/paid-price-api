import "server-only";

import {
  decodePaymentResponseHeader,
  wrapFetchWithPaymentFromConfig,
} from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";

import {
  CIRCLE_TESTNET_USDC_ISSUER,
  stellarExpertAccountUrl,
  stellarExpertAssetUrl,
  stellarExpertTxUrl,
} from "@/lib/stellar-expert";
import { STELLAR_NETWORK } from "@/lib/x402/config";
import { requirePayerUsdc } from "@/lib/x402/payer-usdc";
import type { XlmPriceQuote } from "@/lib/reflector/quote";

export type PaidQuoteResult = {
  quote: XlmPriceQuote;
  payment: {
    success: boolean;
    transaction: string;
    payer?: string;
    network: string;
    amount?: string;
    explorerTx: string;
    explorerPayer: string;
    explorerRecipient?: string;
    explorerUsdc: string;
  };
  payerUsdc: string;
};

export async function buyXlmPrice(origin: string): Promise<
  | { ok: true; data: PaidQuoteResult }
  | { ok: false; status: number; error: string; hint?: string; payer?: string }
> {
  const secret = process.env.STELLAR_SECRET_KEY?.trim();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "STELLAR_SECRET_KEY is not set",
      hint: "Add the payer S… key to .env.local (same account you funded with USDC).",
    };
  }

  const funded = await requirePayerUsdc(secret);
  if ("error" in funded) {
    return {
      ok: false,
      status: 402,
      error: funded.error,
      hint: funded.hint,
      payer: funded.publicKey,
    };
  }

  const signer = createEd25519Signer(secret, STELLAR_NETWORK);
  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      { network: STELLAR_NETWORK, client: new ExactStellarScheme(signer) },
    ],
  });

  const url = `${origin.replace(/\/$/, "")}/price/xlm`;
  const res = await fetchWithPayment(url);
  const text = await res.text();

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: text.slice(0, 500) || `Paid request failed (${res.status})`,
    };
  }

  const quote = JSON.parse(text) as XlmPriceQuote;
  const header = res.headers.get("PAYMENT-RESPONSE");
  const settled = header ? decodePaymentResponseHeader(header) : null;
  const hash = settled?.transaction ?? "";
  const recipient = process.env.STELLAR_RECIPIENT?.trim();

  return {
    ok: true,
    data: {
      quote,
      payerUsdc: funded.balance,
      payment: {
        success: settled?.success ?? res.ok,
        transaction: hash,
        payer: settled?.payer ?? funded.publicKey,
        network: String(settled?.network ?? STELLAR_NETWORK),
        amount: settled?.amount,
        explorerTx: hash ? stellarExpertTxUrl(hash) : "",
        explorerPayer: stellarExpertAccountUrl(
          settled?.payer ?? funded.publicKey,
        ),
        explorerRecipient: recipient
          ? stellarExpertAccountUrl(recipient)
          : undefined,
        explorerUsdc: stellarExpertAssetUrl("USDC", CIRCLE_TESTNET_USDC_ISSUER),
      },
    },
  };
}

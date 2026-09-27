"use client";

import { useState } from "react";

import ResultModal from "@/components/result-modal";

const PRICE_PATH = "/price/xlm";

type Accepts = {
  scheme?: string;
  network?: string;
  amount?: string;
  asset?: string;
  payTo?: string;
  extra?: { areFeesSponsored?: boolean };
};

type PaymentRequired = {
  x402Version?: number;
  error?: string;
  resource?: { url?: string; description?: string };
  accepts?: Accepts[];
};

type Quote = {
  asset: string;
  price: string;
  timestamp: string;
  source: string;
  base: string;
  decimals: number;
  oracle: string;
};

type PaidResult = {
  quote: Quote;
  payment: {
    transaction: string;
    payer?: string;
    amount?: string;
    explorerTx: string;
    explorerPayer: string;
    explorerRecipient?: string;
    explorerUsdc: string;
  };
  payerUsdc: string;
};

function decodePaymentRequired(header: string | null): PaymentRequired | undefined {
  if (!header) return undefined;
  try {
    return JSON.parse(atob(header)) as PaymentRequired;
  } catch {
    return undefined;
  }
}

function usdcFromAtomic(amount: string | undefined): string {
  if (!amount) return "$0.001";
  const n = Number(amount) / 10_000_000;
  return `$${n.toFixed(3)} USDC`;
}

export default function Walkthrough() {
  const [challenge, setChallenge] = useState<PaymentRequired | null>(null);
  const [unpaidStatus, setUnpaidStatus] = useState<number | null>(null);
  const [paid, setPaid] = useState<PaidResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [busy, setBusy] = useState<"unpaid" | "paid" | null>(null);
  const [modal, setModal] = useState<"unpaid" | "paid" | "error" | null>(null);

  async function askWithoutPaying() {
    setBusy("unpaid");
    setError(null);
    setHint(null);
    setPaid(null);
    setModal(null);
    try {
      const res = await fetch(PRICE_PATH, { cache: "no-store" });
      setUnpaidStatus(res.status);
      const required = decodePaymentRequired(res.headers.get("PAYMENT-REQUIRED"));
      setChallenge(required ?? null);
      if (res.status !== 402) {
        setError(`Expected HTTP 402, got ${res.status}`);
        setHint("The unpaid probe should be refused until USDC payment is attached.");
        setModal("error");
        return;
      }
      setModal("unpaid");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setModal("error");
    } finally {
      setBusy(null);
    }
  }

  async function payAndFetch() {
    setBusy("paid");
    setError(null);
    setHint(null);
    setModal(null);
    try {
      const res = await fetch("/api/demo-pay", { method: "POST" });
      const data = (await res.json()) as PaidResult & {
        error?: string;
        hint?: string;
        payer?: string;
      };
      if (!res.ok) {
        setError(data.error ?? `Payment failed (${res.status})`);
        setHint(data.hint ?? null);
        setModal("error");
        return;
      }
      setPaid(data);
      setModal("paid");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setModal("error");
    } finally {
      setBusy(null);
    }
  }

  const offer = challenge?.accepts?.[0];

  return (
    <div className="space-y-8">
      <ol className="grid gap-4 sm:grid-cols-3">
        <li className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Step 1
          </p>
          <p className="mt-1 font-medium">Ask Without Paying</p>
          <p className="mt-1 text-sm text-zinc-400">
            The API must refuse and tell you the price in a 402.
          </p>
        </li>
        <li className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Step 2
          </p>
          <p className="mt-1 font-medium">Pay $0.001 USDC</p>
          <p className="mt-1 text-sm text-zinc-400">
            This page pays from the testnet key in{" "}
            <code className="text-zinc-300">.env.local</code>. Network fees are
            sponsored.
          </p>
        </li>
        <li className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Step 3
          </p>
          <p className="mt-1 font-medium">Read the Quote</p>
          <p className="mt-1 text-sm text-zinc-400">
            After settlement, Reflector Pulse returns XLM and you can open the
            tx on StellarExpert.
          </p>
        </li>
      </ol>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={askWithoutPaying}
          disabled={busy !== null}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
        >
          {busy === "unpaid" ? "Asking…" : "1. Request Without Payment"}
        </button>
        <button
          type="button"
          onClick={payAndFetch}
          disabled={busy !== null}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50"
        >
          {busy === "paid" ? "Paying…" : "2. Pay and Get XLM Price"}
        </button>
      </div>

      <p className="text-sm text-zinc-500" aria-live="polite">
        {busy === "unpaid"
          ? "Requesting the unpaid price…"
          : busy === "paid"
            ? "Settling USDC, then fetching Reflector…"
            : "Results open in a dialog so the next step stays in focus."}
      </p>

      <ResultModal
        open={modal === "unpaid" && unpaidStatus === 402 && challenge !== null}
        title="Payment Required"
        onClose={() => setModal(null)}
      >
        <p className="font-mono text-sm text-amber-300">HTTP {unpaidStatus}</p>
        <p className="text-sm leading-relaxed text-zinc-400">
          No price yet. The server answered Payment Required instead of the
          quote. A paying agent reads this challenge, signs a USDC transfer, and
          retries.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-zinc-500">Price</dt>
            <dd className="font-medium tabular-nums">
              {usdcFromAtomic(offer?.amount)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Network</dt>
            <dd className="font-medium">{offer?.network ?? "stellar:testnet"}</dd>
          </div>
          <div className="sm:col-span-2 min-w-0">
            <dt className="text-zinc-500">Recipient</dt>
            <dd className="break-all font-mono text-xs">
              {offer?.payTo ? (
                <a
                  className="text-emerald-400 underline hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
                  href={`https://stellar.expert/explorer/testnet/account/${offer.payTo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {offer.payTo}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">Fees</dt>
            <dd className="font-medium">
              {offer?.extra?.areFeesSponsored
                ? "Sponsored by OZ Channels (payer needs USDC, not XLM for fees)"
                : "Payer pays network fees"}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            setModal(null);
            void payAndFetch();
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          Pay and Get XLM Price
        </button>
      </ResultModal>

      <ResultModal
        open={modal === "paid" && paid !== null}
        title="Price Quote"
        onClose={() => setModal(null)}
      >
        {paid && (
          <>
            <p className="text-pretty text-3xl font-semibold tracking-tight tabular-nums">
              1 {paid.quote.asset} = {paid.quote.price} {paid.quote.base}
            </p>
            <p className="text-sm text-zinc-400">
              From {paid.quote.source} at {paid.quote.timestamp}
            </p>
            <div className="flex flex-wrap gap-2">
              {paid.payment.explorerTx && (
                <a
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-emerald-400"
                  href={paid.payment.explorerTx}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Payment on StellarExpert
                </a>
              )}
              <a
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400"
                href={paid.payment.explorerPayer}
                target="_blank"
                rel="noopener noreferrer"
              >
                Payer Account
              </a>
              {paid.payment.explorerRecipient && (
                <a
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400"
                  href={paid.payment.explorerRecipient}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Recipient Account
                </a>
              )}
              <a
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400"
                href={paid.payment.explorerUsdc}
                target="_blank"
                rel="noopener noreferrer"
              >
                Testnet USDC
              </a>
            </div>
            {paid.payment.transaction && (
              <p className="break-all font-mono text-xs text-zinc-500">
                Tx {paid.payment.transaction}
              </p>
            )}
          </>
        )}
      </ResultModal>

      <ResultModal
        open={modal === "error" && error !== null}
        title="Couldn’t Complete This Step"
        onClose={() => setModal(null)}
      >
        <p className="text-sm text-zinc-200">{error}</p>
        {hint && <p className="text-sm text-zinc-400">{hint}</p>}
        {hint?.includes("Circle") && (
          <a
            className="inline-block text-emerald-400 underline hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Circle Testnet Faucet
          </a>
        )}
      </ResultModal>
    </div>
  );
}

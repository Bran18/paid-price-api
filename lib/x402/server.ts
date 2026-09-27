import "server-only";

import { HTTPFacilitatorClient } from "@x402/core/server";
import { x402ResourceServer } from "@x402/next";
import { ExactStellarScheme } from "@x402/stellar/exact/server";
import { Keypair, StrKey } from "@stellar/stellar-sdk";

import {
  FACILITATOR_URL,
  PRICE_ROUTE,
  PRICE_USDC,
  STELLAR_NETWORK,
} from "./config";

function resolveRecipient(): string {
  const raw = (process.env.STELLAR_RECIPIENT ?? "").trim().replace(/['"]/g, "");
  if (!raw) return "";

  if (raw.startsWith("S")) {
    try {
      const pub = Keypair.fromSecret(raw).publicKey();
      console.warn(
        `STELLAR_RECIPIENT is a secret key — derived public key: ${pub.slice(0, 8)}...`,
      );
      return pub;
    } catch {
      console.error(
        "STELLAR_RECIPIENT looks like a secret key but failed to parse — disabling x402",
      );
      return "";
    }
  }

  if (!StrKey.isValidEd25519PublicKey(raw)) {
    console.error(
      `STELLAR_RECIPIENT is not a valid Stellar public key — disabling x402: ${raw.slice(0, 8)}...`,
    );
    return "";
  }

  return raw;
}

const payTo = resolveRecipient();

function createResourceServer(): x402ResourceServer | null {
  if (!payTo) return null;

  const apiKey = process.env.OZ_API_KEY?.trim();
  if (!apiKey) {
    console.error("OZ_API_KEY is required for x402 — disabling paid route");
    return null;
  }

  const facilitator = new HTTPFacilitatorClient({
    url: FACILITATOR_URL,
    createAuthHeaders: async () => {
      const headers = { Authorization: `Bearer ${apiKey}` };
      return { verify: headers, settle: headers, supported: headers };
    },
  });

  return new x402ResourceServer(facilitator).register(
    STELLAR_NETWORK,
    new ExactStellarScheme(),
  );
}

const resourceServer = createResourceServer();

export function isX402Ready(): boolean {
  return resourceServer !== null && payTo.length > 0;
}

export function getPayTo(): string {
  return payTo;
}

export function getResourceServer(): x402ResourceServer {
  if (!resourceServer) {
    throw new Error("x402 resource server is not configured");
  }
  return resourceServer;
}

export function getPriceRouteConfig() {
  return {
    [PRICE_ROUTE]: {
      accepts: {
        scheme: "exact" as const,
        price: PRICE_USDC,
        network: STELLAR_NETWORK,
        payTo,
      },
      description: "Current XLM price from Reflector Pulse (USDC-settled)",
    },
  };
}

export const X402_UNAVAILABLE_BODY = {
  error:
    "x402 payment middleware unavailable — set STELLAR_RECIPIENT and OZ_API_KEY",
};

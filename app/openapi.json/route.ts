import { NextResponse } from "next/server";

import { PRICE_ROUTE, PRICE_USDC, STELLAR_NETWORK } from "@/lib/x402/config";
import { getPayTo, isX402Ready } from "@/lib/x402/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const document = {
    openapi: "3.1.0",
    info: {
      title: "Paid XLM Price API",
      version: "0.1.0",
      description:
        "Advisory discovery only. Runtime 402 Payment Required responses are authoritative for price, asset, network, and settlement terms.",
    },
    paths: {
      [PRICE_ROUTE]: {
        get: {
          operationId: "getXlmPrice",
          summary: "Current XLM price from Reflector Pulse",
          description:
            "Returns XLM/USDC (or feed base) after x402 USDC payment is verified and settled.",
          "x-payment-info": {
            advisory: true,
            offers: isX402Ready()
              ? [
                  {
                    scheme: "exact",
                    network: STELLAR_NETWORK,
                    price: PRICE_USDC,
                    payTo: getPayTo(),
                  },
                ]
              : [],
          },
          responses: {
            "200": {
              description: "Price quote",
            },
            "402": {
              description: "Payment required — use headers/body from live response",
            },
            "502": {
              description: "Oracle missing or stale after payment gate",
            },
            "503": {
              description: "Seller payment configuration unavailable",
            },
          },
        },
      },
    },
    servers: [{ url: baseUrl }],
  };

  return NextResponse.json(document);
}

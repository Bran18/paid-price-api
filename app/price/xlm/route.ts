import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";

import { fetchXlmPriceQuote } from "@/lib/reflector/quote";
import {
  getPriceRouteConfig,
  getResourceServer,
  isX402Ready,
  X402_UNAVAILABLE_BODY,
} from "@/lib/x402/server";

export const dynamic = "force-dynamic";

async function handler(_request: NextRequest): Promise<NextResponse> {
  const quote = await fetchXlmPriceQuote();

  if (!quote) {
    return NextResponse.json(
      {
        error: "Reflector returned no current XLM price (missing or stale)",
        hint:
          "Payment was not settled because this response is not successful. Retry when the feed is fresh.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json(quote);
}

let protectedGet:
  | ((request: NextRequest) => Promise<NextResponse>)
  | undefined;

function getProtectedGet() {
  if (!isX402Ready()) {
    return undefined;
  }
  protectedGet ??= withX402(
    handler,
    getPriceRouteConfig(),
    getResourceServer(),
  );
  return protectedGet;
}

export async function GET(request: NextRequest) {
  const guarded = getProtectedGet();
  if (!guarded) {
    return NextResponse.json(X402_UNAVAILABLE_BODY, { status: 503 });
  }

  return guarded(request);
}

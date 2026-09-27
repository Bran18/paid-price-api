import { NextRequest, NextResponse } from "next/server";

import { resolveAppOrigin } from "@/lib/x402/app-origin";
import { buyXlmPrice } from "@/lib/x402/buy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const origin = resolveAppOrigin(request);

  try {
    const result = await buyXlmPrice(origin);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          hint: result.hint,
          payer: result.payer,
        },
        { status: result.status },
      );
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[demo-pay]", error);
    const message = error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json(
      {
        error: message,
        hint:
          "See Vercel function logs. Common fixes: set production env vars, fund payer USDC, set VERCEL_AUTOMATION_BYPASS_SECRET if Deployment Protection is enabled.",
        origin,
      },
      { status: 500 },
    );
  }
}

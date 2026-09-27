import { NextRequest, NextResponse } from "next/server";

import { buyXlmPrice } from "@/lib/x402/buy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.nextUrl.origin;

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
    const message = error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

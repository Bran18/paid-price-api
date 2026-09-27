import "server-only";

import { getPulseClient, getPulseContractId } from "./client";
import { XLM_ORACLE_TICKER } from "./constants";
import { formatOraclePrice } from "./format-price";

export type XlmPriceQuote = {
  asset: "XLM";
  price: string;
  timestamp: string;
  source: "Reflector";
  base: string;
  decimals: number;
  oracle: string;
  rawPrice: string;
};

export async function fetchXlmPriceQuote(): Promise<XlmPriceQuote | null> {
  const client = getPulseClient();

  const [decimals, baseAsset, data] = await Promise.all([
    client.decimals(),
    client.base(),
    client.lastPrice(XLM_ORACLE_TICKER),
  ]);

  if (!data) {
    return null;
  }

  const baseLabel =
    baseAsset.tag === "Other"
      ? baseAsset.values[0]
      : baseAsset.values[0].slice(0, 4) + "…";

  const formatted = formatOraclePrice(data.price, decimals);

  return {
    asset: "XLM",
    price: formatted,
    timestamp: new Date(Number(data.timestamp) * 1000).toISOString(),
    source: "Reflector",
    base: baseLabel,
    decimals,
    oracle: getPulseContractId(),
    rawPrice: data.price.toString(),
  };
}

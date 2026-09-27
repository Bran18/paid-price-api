export const STELLAR_NETWORK: `${string}:${string}` =
  (process.env.STELLAR_NETWORK ?? "stellar:testnet") as `${string}:${string}`;

export const FACILITATOR_URL =
  process.env.FACILITATOR_URL ??
  "https://channels.openzeppelin.com/x402/testnet";

export const PRICE_ROUTE = "/price/xlm";

export const PRICE_USDC = process.env.X402_PRICE ?? "$0.001";

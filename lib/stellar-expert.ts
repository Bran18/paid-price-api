import { STELLAR_NETWORK } from "@/lib/x402/config";

export function stellarExpertNetwork(
  caip: string = STELLAR_NETWORK,
): "testnet" | "public" {
  return caip === "stellar:pubnet" ? "public" : "testnet";
}

export function stellarExpertTxUrl(
  hash: string,
  caip: string = STELLAR_NETWORK,
): string {
  return `https://stellar.expert/explorer/${stellarExpertNetwork(caip)}/tx/${hash}`;
}

export function stellarExpertAccountUrl(
  account: string,
  caip: string = STELLAR_NETWORK,
): string {
  return `https://stellar.expert/explorer/${stellarExpertNetwork(caip)}/account/${account}`;
}

export function stellarExpertAssetUrl(
  code: string,
  issuer: string,
  caip: string = STELLAR_NETWORK,
): string {
  return `https://stellar.expert/explorer/${stellarExpertNetwork(caip)}/asset/${code}-${issuer}`;
}

export const CIRCLE_TESTNET_USDC_ISSUER =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

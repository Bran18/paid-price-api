/** External CEX/DEX Pulse on testnet — XLM via `lastPrice("XLM")`. */
export const PULSE_CEX_DEX_TESTNET_CONTRACT_ID =
  process.env.REFLECTOR_PULSE_CONTRACT_ID?.trim() ??
  "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63";

export const REFLECTOR_RPC_URL =
  process.env.REFLECTOR_RPC_URL?.trim() ??
  "https://soroban-testnet.stellar.org";

export const REFLECTOR_NETWORK_PASSPHRASE =
  process.env.REFLECTOR_NETWORK_PASSPHRASE?.trim() ??
  "Test SDF Network ; September 2015";

export const XLM_ORACLE_TICKER = "XLM";

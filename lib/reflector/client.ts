import "server-only";

import { PulseClient } from "@reflector/contract-client";

import {
  PULSE_CEX_DEX_TESTNET_CONTRACT_ID,
  REFLECTOR_NETWORK_PASSPHRASE,
  REFLECTOR_RPC_URL,
} from "./constants";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local (any funded G… works for read simulations).`,
    );
  }
  return value;
}

function createPulseClient(): PulseClient {
  return new PulseClient({
    publicKey: requiredEnv("REFLECTOR_PUBLIC_KEY"),
    rpcUrl: REFLECTOR_RPC_URL,
    contractId: PULSE_CEX_DEX_TESTNET_CONTRACT_ID,
    networkPassphrase: REFLECTOR_NETWORK_PASSPHRASE,
  });
}

let pulseClient: PulseClient | undefined;

export function getPulseClient(): PulseClient {
  pulseClient ??= createPulseClient();
  return pulseClient;
}

export function getPulseContractId(): string {
  return PULSE_CEX_DEX_TESTNET_CONTRACT_ID;
}

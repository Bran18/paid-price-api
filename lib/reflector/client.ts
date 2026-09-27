import "server-only";

import { PulseClient } from "@reflector/contract-client";

import {
  PULSE_CEX_DEX_TESTNET_CONTRACT_ID,
  REFLECTOR_NETWORK_PASSPHRASE,
  REFLECTOR_RPC_URL,
} from "./constants";
import { resolveReflectorPublicKey } from "./public-key";

function createPulseClient(): PulseClient {
  return new PulseClient({
    publicKey: resolveReflectorPublicKey(),
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

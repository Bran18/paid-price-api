import "server-only";

import { Keypair, StrKey } from "@stellar/stellar-sdk";

/** Any valid G… for Pulse simulations (not signed). */
export function resolveReflectorPublicKey(): string {
  const explicit = process.env.REFLECTOR_PUBLIC_KEY?.trim();
  if (explicit && StrKey.isValidEd25519PublicKey(explicit)) {
    return explicit;
  }

  const recipient = process.env.STELLAR_RECIPIENT?.trim().replace(/['"]/g, "");
  if (recipient && StrKey.isValidEd25519PublicKey(recipient)) {
    return recipient;
  }

  const secret = process.env.STELLAR_SECRET_KEY?.trim();
  if (secret?.startsWith("S")) {
    try {
      return Keypair.fromSecret(secret).publicKey();
    } catch {
      // fall through
    }
  }

  throw new Error(
    "Missing REFLECTOR_PUBLIC_KEY. Set any valid Stellar G… in Vercel env (or STELLAR_RECIPIENT / STELLAR_SECRET_KEY).",
  );
}

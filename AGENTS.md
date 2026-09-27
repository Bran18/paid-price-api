# Agent guide — Paid XLM Price API

## Product

- **Paid route:** `GET /price/xlm` (x402 USDC on `stellar:testnet`)
- **Data:** Reflector Pulse `lastPrice("XLM")` on testnet CEX/DEX oracle (`CCYOZ…` by default)
- **Payer:** `scripts/buy-price.mjs` or `POST /api/demo-pay` (Node/server; browser does not sign auth entries without wallet glue)

## Flow and extension ideas

Read [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) for Mermaid user flows, the verify/settle sequence, external references, and a **jump-in** table of improvements.

## Before changing code

1. **Raven** (`user-stellar-raven`) — current Stellar docs, prior art, skill sections
2. **Skills** — `agentic-payments` (x402), `reflector` (feeds + deployments), `data` (RPC), `assets` (USDC issuer vs SAC)
3. **Never invent** Pulse contract IDs — verify [reflector.network/pulse](https://reflector.network/pulse) and [oracle providers](https://developers.stellar.org/docs/data/oracles/oracle-providers)

## Fail-closed rules

- Missing/invalid `STELLAR_RECIPIENT` or `OZ_API_KEY` → **503**, never a free quote
- Stale/missing oracle after payment gate → **502**, not a fabricated price
- `payTo` is classic `G…`; settlement asset is USDC SAC (`@x402/stellar` constants)

## References

- [stellar/x402-stellar](https://github.com/stellar/x402-stellar)
- [reflector-market-board](../reflector-market-board) (Pulse client patterns in this monorepo folder)

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

import Walkthrough from "@/components/walkthrough";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            x402 + Reflector
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Paid XLM price API
          </h1>
          <p className="max-w-2xl text-zinc-400 leading-relaxed">
            This API sells one number: the current XLM price from Reflector
            Pulse. You cannot read it until a{" "}
            <strong className="font-medium text-zinc-200">
              $0.001 USDC
            </strong>{" "}
            payment settles on Stellar testnet.
          </p>
        </header>
        <Walkthrough />
      </main>
    </div>
  );
}

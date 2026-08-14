import { Pause, Square } from "lucide-react";

/* ponytail: static duration — a live ticker needs a real shift API to be
   truthful. Wire to the shift endpoint (and make the buttons act) when it exists. */
export function ShiftCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-brand-deep p-5 text-white">
      <div>
        <h2 className="text-base font-bold">Shift Kasir</h2>
        <p className="mt-1 text-xs text-white/70">Kasir: Andi · mulai 08:00</p>
      </div>

      <p className="mt-6 font-mono text-4xl font-bold tabular-nums">01:24:08</p>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="Jeda shift"
          className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
        >
          <Pause aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Akhiri shift"
          className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
        >
          <Square aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

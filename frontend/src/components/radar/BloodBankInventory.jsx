import Link from 'next/link';
import { AlertTriangle, Droplet } from 'lucide-react';

const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export function BloodBankInventory() {
  return (
    <section className="glass-card p-5 md:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush"><Droplet /></span>
        <div>
          <p className="section-kicker">Emergency blood bank</p>
          <h2 className="mt-1 font-display text-xl font-bold">Blood availability</h2>
          <p className="mt-2 max-w-2xl text-sm opacity-75">
            Live inventory and donor requests are not available in the current backend API. Contact a listed hospital to confirm stock.
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {groups.map((group) => (
          <div key={group} className="rounded-xl border border-taupe bg-white/60 p-3 text-center">
            <strong className="block">{group}</strong>
            <span className="text-[10px] opacity-60">No live data</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs"><AlertTriangle className="mr-1 inline h-4 w-4" /> Call emergency services for urgent situations.</p>
        <Link className="btn btn-primary btn-sm rounded-full" href="/care-radar">Find hospitals</Link>
      </div>
    </section>
  );
}

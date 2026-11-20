import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SafetyPage() {
  return (
    <main className="page-shell max-w-4xl space-y-4">
      <header className="glass-card p-6"><p className="section-kicker">Safety first</p><h1 className="page-heading mt-2">Clinical limitations</h1></header>
      <section className="glass-card space-y-4 p-6 text-sm leading-7">
        <p><ShieldCheck className="mr-2 inline h-5 w-5" /> MEDINEXA AI is a prototype for preliminary care navigation. It does not provide a medical diagnosis or replace a qualified clinician.</p>
        <p><AlertTriangle className="mr-2 inline h-5 w-5" /> For life-threatening symptoms or severe injury, contact local emergency services immediately. In Bangladesh, call 999.</p>
        <p>AI-generated responses can be incomplete. Use the guidance only as an initial aid and seek professional care when needed.</p>
      </section>
    </main>
  );
}

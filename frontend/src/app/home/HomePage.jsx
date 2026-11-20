import Link from 'next/link';
import { Activity, ArrowRight, ShieldAlert } from 'lucide-react';
import { HeroVideoPortal } from '@/components/hero/HeroVideoPortal';
import { FannedFeatureArc } from '@/components/hero/FannedFeatureArc';
import { InjuryScanner } from '@/components/scanner/InjuryScanner';
import { SpatialCareRadar } from '@/components/radar/SpatialCareRadar';
import { BloodBankInventory } from '@/components/radar/BloodBankInventory';
import { DoctorDirectory } from '@/components/radar/DoctorDirectory';
import { TriageChatbot } from '@/components/chatbot/TriageChatbot';
import { DashboardPreview } from '@/components/ui/DashboardPreview';

const sectionHeading = 'mb-5 flex flex-wrap items-end justify-between gap-3';

export function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <p className="section-kicker text-center">The next dimension of connected care</p>
        <h1 className="hero-headline">Care that sees beyond.</h1>
        <div className="hero-portal-shell">
          <div className="hero-wordmark" aria-hidden="true">MEDINEXA</div>
          <HeroVideoPortal />
          <FannedFeatureArc />
        </div>
        <div id="about" className="hero-after-arc">
          <p className="hero-subtitle">From the first scan to the right specialist. One intelligent care ecosystem.</p>
          <p className="hero-caption">One connected ecosystem. Every step of your care.</p>
          <div className="hero-actions">
            <Link href="/injury-studio" className="btn btn-primary rounded-full"><Activity size={16} /> Start Free Assessment</Link>
            <Link href="/care-radar" className="btn btn-outline rounded-full">Explore Spatial AI <ArrowRight size={15} /></Link>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-blush bg-blush/40 px-4 py-2 text-xs">
            <ShieldAlert size={15} /> Immediate life threat? Call local emergency services now (Bangladesh: <strong>999</strong>).
          </p>
        </div>
      </section>

      <div id="features" className="home-sections">
        <section id="injury-studio" className="home-section">
          <div className={sectionHeading}>
            <div><p className="section-kicker">AI injury vision</p><h2 className="page-heading">First-Aid Studio</h2></div>
            <Link href="/injury-studio" className="btn btn-ghost btn-sm rounded-full">Open scanner <ArrowRight size={14} /></Link>
          </div>
          <InjuryScanner />
        </section>

        <section id="care-radar" className="home-section">
          <div className={sectionHeading}>
            <div><p className="section-kicker">Location-aware discovery</p><h2 className="page-heading">Care Radar</h2></div>
            <Link href="/care-radar" className="btn btn-ghost btn-sm rounded-full">Open care map <ArrowRight size={14} /></Link>
          </div>
          <SpatialCareRadar />
        </section>

        <section id="doctors" className="home-section">
          <div className={sectionHeading}>
            <div><p className="section-kicker">Verified specialist directory</p><h2 className="page-heading">Find a Doctor</h2></div>
            <Link href="/doctors" className="btn btn-ghost btn-sm rounded-full">Browse directory <ArrowRight size={14} /></Link>
          </div>
          <DoctorDirectory compact />
        </section>

        <section id="blood-bank" className="home-section">
          <BloodBankInventory />
        </section>

        <section id="dashboard" className="home-section">
          <div className={sectionHeading}><div><p className="section-kicker">Your care at a glance</p><h2 className="page-heading">Health Dashboard</h2></div></div>
          <DashboardPreview />
        </section>

        <section id="chatbot" className="home-section">
          <div className={sectionHeading}><div><p className="section-kicker">24/7 health chat</p><h2 className="page-heading">MEDINEXA AI Triage Bot</h2></div></div>
          <TriageChatbot compact />
        </section>
      </div>
    </main>
  );
}

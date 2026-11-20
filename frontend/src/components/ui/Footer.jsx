import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-inner">
        <div>
          <Link href="/" className="brand-lockup">
            <span className="brand-mark"><HeartPulse aria-hidden="true" /></span>
            <span><strong>MEDINEXA</strong><small>AI</small></span>
          </Link>
          <p>Connected care tools for safer first steps and finding the right medical support.</p>
        </div>
        <div className="footer-links">
          <Link href="/injury-studio">Injury Studio</Link>
          <Link href="/care-radar">Care Radar</Link>
          <Link href="/doctors">Doctors</Link>
          <Link href="/chatbot">AI Chat</Link>
        </div>
        <p className="medical-disclaimer">
          MEDINEXA AI is a prototype and does not provide a medical diagnosis. In Bangladesh, call 999 for emergencies.
        </p>
      </div>
    </footer>
  );
}

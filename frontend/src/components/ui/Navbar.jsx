'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Find Doctors', href: '/doctors' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const signOut = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="site-header">
      <div className="navbar medinexa-navbar">
        <Link href="/" className="brand-lockup" aria-label="MEDINEXA AI home">
          <span className="brand-mark"><Activity aria-hidden="true" /></span>
          <span><strong>MEDINEXA</strong><small>AI</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link className="btn btn-primary btn-sm rounded-full" href="/dashboard">Dashboard</Link>
              <button type="button" className="btn btn-outline btn-sm rounded-full" onClick={signOut}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-primary btn-sm rounded-full" href="/register">Get Started <span aria-hidden="true">→</span></Link>
              <Link className="btn btn-outline btn-sm rounded-full" href="/login">Login</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-circle mobile-menu-button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-nav glass-card" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
          {!user ? (
            <>
              <Link href="/register" onClick={() => setMenuOpen(false)}>Get Started</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button type="button" onClick={signOut}>Log out</button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

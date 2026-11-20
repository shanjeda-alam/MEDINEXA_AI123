'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';

const demos = [
  ['user@medinexa.ai', 'User123!', 'Patient'],
  ['doctor@medinexa.ai', 'Doctor123!', 'Doctor'],
  ['admin@medinexa.ai', 'Admin123!', 'Admin'],
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Sign-in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <GlassCard className="space-y-5">
        <div className="text-center">
          <span className="orb-avatar mx-auto"><Activity /></span>
          <p className="section-kicker mt-3">Welcome back</p>
          <h1 className="mt-1 font-display text-2xl font-bold">Sign in to MEDINEXA AI</h1>
          <p className="mt-2 text-sm opacity-70">Access your patient portal, doctor desk, or admin suite.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {demos.map(([demoEmail, demoPassword, role]) => (
            <button key={role} type="button" className="btn btn-outline btn-xs rounded-full" onClick={() => { setEmail(demoEmail); setPassword(demoPassword); }}>{role} demo</button>
          ))}
        </div>
        {error && <p role="alert" className="error-message">{error}</p>}
        <form className="space-y-4" onSubmit={submit}>
          <label className="form-control"><span>Email</span><input className="input input-bordered" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="form-control"><span>Password</span><input className="input input-bordered" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button type="submit" className="btn btn-primary w-full rounded-full" disabled={loading}>{loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} /></>}</button>
        </form>
        <p className="text-center text-xs opacity-70">New to MEDINEXA? <Link className="font-bold underline" href="/register">Create an account</Link></p>
      </GlassCard>
    </main>
  );
}

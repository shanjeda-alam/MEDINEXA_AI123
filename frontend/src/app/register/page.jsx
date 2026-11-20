'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'user', country: 'BD' });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!consent) {
      setError('Please accept the safety agreement before creating an account.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
      router.push('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <GlassCard className="space-y-5">
        <div className="text-center">
          <p className="section-kicker">Create your medical ID</p>
          <h1 className="mt-1 font-display text-2xl font-bold">Join MEDINEXA AI</h1>
          <p className="mt-2 text-sm opacity-70">Set up an account for care navigation and preliminary triage.</p>
        </div>
        {error && <p role="alert" className="error-message">{error}</p>}
        <form className="space-y-4" onSubmit={submit}>
          <label className="form-control"><span>Full name</span><input className="input input-bordered" required minLength={2} value={form.full_name} onChange={change('full_name')} /></label>
          <label className="form-control"><span>Email</span><input className="input input-bordered" type="email" required value={form.email} onChange={change('email')} /></label>
          <label className="form-control"><span>Password</span><input className="input input-bordered" type="password" minLength={6} required value={form.password} onChange={change('password')} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="form-control"><span>Phone (optional)</span><input className="input input-bordered" type="tel" value={form.phone} onChange={change('phone')} /></label>
            <label className="form-control"><span>Country</span><select className="select select-bordered" value={form.country} onChange={change('country')}><option value="BD">Bangladesh</option><option value="US">United States</option><option value="UK">United Kingdom</option><option value="IN">India</option></select></label>
          </div>
          <label className="form-control"><span>Register as</span><select className="select select-bordered" value={form.role} onChange={change('role')}><option value="user">Patient / User</option><option value="doctor">Medical Doctor</option></select></label>
          <label className="flex items-start gap-3 text-xs leading-relaxed"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I understand MEDINEXA AI is a preliminary guidance platform, not a medical diagnosis service. In an emergency, I will contact local emergency services.</span></label>
          <button type="submit" className="btn btn-primary w-full rounded-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="text-center text-xs opacity-70">Already registered? <Link className="font-bold underline" href="/login">Sign in</Link></p>
      </GlassCard>
    </main>
  );
}

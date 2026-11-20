'use client';

import { useEffect, useState } from 'react';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function ProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', country: 'BD', language: 'en' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', phone: user.phone || '', country: user.country || 'BD', language: user.language || 'en' });
  }, [user]);

  const change = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await userAPI.updateProfile(form);
      setNotice('Profile successfully updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Profile changes could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell max-w-3xl space-y-5">
      <header className="glass-card p-6"><p className="section-kicker">Account settings</p><h1 className="page-heading mt-2">Profile & consent</h1></header>
      {notice && <p role="status" className="success-message">{notice}</p>}
      {error && <p role="alert" className="error-message">{error}</p>}
      <form className="glass-card space-y-4 p-5 md:p-7" onSubmit={submit}>
        <label className="form-control"><span>Full name</span><input className="input input-bordered" required value={form.full_name} onChange={change('full_name')} /></label>
        <label className="form-control"><span>Email</span><input className="input input-bordered" disabled value={user?.email || ''} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-control"><span>Phone</span><input className="input input-bordered" type="tel" value={form.phone} onChange={change('phone')} /></label>
          <label className="form-control"><span>Emergency country</span><select className="select select-bordered" value={form.country} onChange={change('country')}><option value="BD">Bangladesh (999)</option><option value="US">United States (911)</option><option value="UK">United Kingdom (999)</option><option value="IN">India (112)</option></select></label>
        </div>
        <label className="form-control"><span>Preferred language</span><input className="input input-bordered" value={form.language} onChange={change('language')} /></label>
        <button type="submit" className="btn btn-primary rounded-full" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
      </form>
    </main>
  );
}

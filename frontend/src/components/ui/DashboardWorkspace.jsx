'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, CalendarDays, Hospital, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { appointmentAPI, assessmentAPI, userAPI } from '@/lib/api';

export function DashboardWorkspace() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([userAPI.getDashboard(), appointmentAPI.list(), assessmentAPI.list()])
      .then(([dashboard, appointmentData, assessmentData]) => {
        if (!active) return;
        setStats(dashboard.data);
        setAppointments(appointmentData.data.slice(0, 3));
        setAssessments(assessmentData.data.slice(0, 3));
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.detail || 'Dashboard data could not be loaded.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="page-shell space-y-5">
      <section className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div><p className="section-kicker">Patient dashboard</p><h1 className="page-heading mt-2">Welcome, {user?.full_name || 'patient'}</h1><p className="text-sm opacity-70">Your account data and care activity from MEDINEXA services.</p></div>
        <Link href="/injury-studio" className="btn btn-primary rounded-full"><Activity size={16} /> New screening</Link>
      </section>

      <section className="glass-card grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="section-kicker">Medical ID</p><h2 className="mt-1 font-display text-xl font-bold">{user?.full_name}</h2><p className="text-xs opacity-70">ID · {user?.id} · {user?.email}</p></div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="rounded-xl border border-taupe bg-white/55 p-3"><span>Blood group</span><strong className="mt-1 block">Not provided</strong></div>
          <div className="rounded-xl border border-taupe bg-white/55 p-3"><span>Emergency donor</span><strong className="mt-1 block">Not configured</strong></div>
        </div>
      </section>

      {error && <p role="alert" className="error-message">{error}</p>}
      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={CalendarDays} label="Upcoming appointments" value={stats?.upcoming_appointments} loading={loading} />
        <Metric icon={Activity} label="AI assessments" value={stats?.total_assessments} loading={loading} />
        <Metric icon={Hospital} label="Saved hospitals" value={stats?.saved_hospitals} loading={loading} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ActivityList title="Recent appointments" empty="No appointments yet." items={appointments.map((item) => `${item.doctor_name || 'Specialist'} · ${new Date(item.date_time).toLocaleString()}`)} href="/dashboard/user/appointments" />
        <ActivityList title="Recent injury screenings" empty="No screenings yet." items={assessments.map((item) => `${item.urgency.replaceAll('_', ' ')} · ${new Date(item.created_at).toLocaleDateString()}`)} href="/injury-studio" />
      </section>
      <section className="rounded-2xl border border-blush bg-blush/40 p-4 text-xs"><ShieldCheck className="mr-1 inline h-4 w-4" /> Blood group and donor availability are not part of the current profile API, so they are not shown as live values.</section>
    </main>
  );
}

function Metric({ icon: Icon, label, value, loading }) {
  return <article className="glass-card p-5"><Icon className="mb-3 h-5 w-5" /><p className="text-xs opacity-70">{label}</p><strong className="font-display text-2xl">{loading ? '…' : value ?? 0}</strong></article>;
}

function ActivityList({ title, empty, items, href }) {
  return <section className="glass-card p-5"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-display font-bold">{title}</h2><Link href={href} className="text-xs font-bold underline">View all</Link></div>{items.length ? <ul className="space-y-2">{items.map((item, index) => <li key={`${index}-${item}`} className="rounded-xl bg-white/55 p-3 text-xs">{item}</li>)}</ul> : <p className="text-sm opacity-65">{empty}</p>}</section>;
}

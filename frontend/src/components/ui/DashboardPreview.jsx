'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, CalendarDays, Hospital, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/api';

export function DashboardPreview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'user') return;
    userAPI.getDashboard()
      .then(({ data }) => setStats(data))
      .catch((requestError) => setError(requestError.response?.data?.detail || 'Dashboard metrics could not be loaded.'));
  }, [user]);

  return (
    <div className="glass-card p-5 md:p-7">
      {user ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-seafoam/55"><UserRound /></span>
              <div><p className="section-kicker">Medical ID</p><h3 className="font-display text-lg font-bold">{user.full_name}</h3><p className="text-xs opacity-70">Patient ID · {user.id} · Blood group not provided</p></div>
            </div>
            <Link href="/dashboard" className="btn btn-primary btn-sm rounded-full">Open dashboard</Link>
          </div>
          {error && <p role="alert" className="error-message mt-4">{error}</p>}
          {user.role === 'user' && stats && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric icon={CalendarDays} label="Upcoming visits" value={stats.upcoming_appointments} />
              <Metric icon={Activity} label="AI assessments" value={stats.total_assessments} />
              <Metric icon={Hospital} label="Saved hospitals" value={stats.saved_hospitals} />
            </div>
          )}
          {user.role !== 'user' && <p className="mt-4 text-sm opacity-70">Role: {user.role}. Open your workspace to view role-specific tools.</p>}
        </>
      ) : (
        <div className="text-center">
          <p className="section-kicker">Personal health dashboard</p>
          <h3 className="mt-2 font-display text-xl font-bold">Sign in to view your medical workspace</h3>
          <p className="mt-2 text-sm opacity-70">Your dashboard metrics come from your authenticated account and existing backend APIs.</p>
          <Link className="btn btn-primary mt-4 rounded-full" href="/login">Sign in</Link>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-seafoam/60 bg-white/55 p-4"><Icon className="mb-2 h-5 w-5" /><p className="text-xs opacity-70">{label}</p><strong className="font-display text-2xl">{value ?? 0}</strong></div>;
}

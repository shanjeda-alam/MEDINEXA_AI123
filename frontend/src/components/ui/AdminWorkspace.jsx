'use client';

import { useEffect, useState } from 'react';
import { Activity, Building2, CalendarDays, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { adminAPI } from '@/lib/api';

export function AdminWorkspace() {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboard, pending] = await Promise.all([adminAPI.getDashboard(), adminAPI.getPendingDoctors()]);
      setStats(dashboard.data);
      setPendingDoctors(pending.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Admin data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const verifyDoctor = async (id, status) => {
    setError('');
    try {
      await adminAPI.verifyDoctor(id, { status });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Doctor verification could not be updated.');
    }
  };

  const metrics = stats ? [
    ['Users', stats.total_users, Users],
    ['Doctors', stats.total_doctors, Stethoscope],
    ['Hospitals', stats.total_hospitals, Building2],
    ['Appointments', stats.total_appointments, CalendarDays],
    ['Assessments', stats.total_assessments, Activity],
    ['Pending verification', stats.pending_verifications, ShieldCheck],
  ] : [];

  return (
    <main className="page-shell space-y-5">
      <header className="glass-card p-6"><p className="section-kicker">Platform governance</p><h1 className="page-heading mt-2">Administration</h1><p className="text-sm opacity-70">Review platform statistics and verify medical credentials.</p></header>
      {error && <p role="alert" className="error-message">{error}</p>}
      {loading ? <p className="glass-card p-6 text-center">Loading administration data…</p> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(([label, value, Icon]) => <article className="glass-card p-4" key={label}><Icon className="mb-2 h-5 w-5" /><p className="text-xs opacity-70">{label}</p><strong className="font-display text-2xl">{value}</strong></article>)}
        </div>
      )}
      <section className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-bold">Doctor verification queue</h2><span className="badge badge-outline">{pendingDoctors.length} pending</span></div>
        {loading ? <p className="text-sm opacity-70">Loading doctors…</p> : pendingDoctors.length === 0 ? <p className="text-sm opacity-70">No pending verification requests.</p> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Doctor</th><th>Specialty / qualification</th><th>Hospital</th><th>Actions</th></tr></thead>
              <tbody>{pendingDoctors.map((doctor) => <tr key={doctor.id}>
                <td>{doctor.full_name}<br /><span className="opacity-60">{doctor.email}</span></td>
                <td>{doctor.specialty?.name || 'Specialty not listed'}<br /><span className="opacity-60">{doctor.qualifications}</span></td>
                <td>{doctor.hospital_name || 'Independent'}</td>
                <td><div className="flex gap-2"><button type="button" className="btn btn-primary btn-xs rounded-full" onClick={() => verifyDoctor(doctor.id, 'approved')}>Approve</button><button type="button" className="btn btn-outline btn-xs rounded-full" onClick={() => verifyDoctor(doctor.id, 'rejected')}>Reject</button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

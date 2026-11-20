'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Stethoscope, Users } from 'lucide-react';
import { doctorAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function DoctorWorkspace() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, appointmentsResponse] = await Promise.all([
        doctorAPI.getDashboard(),
        doctorAPI.getAppointments(),
      ]);
      setStats(statsResponse.data);
      setAppointments(appointmentsResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Doctor workspace could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setError('');
    try {
      await doctorAPI.updateAppointmentStatus(id, { status });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Appointment status could not be updated.');
    }
  };

  return (
    <main className="page-shell space-y-5">
      <header className="glass-card p-6"><p className="section-kicker">Doctor clinical workspace</p><h1 className="page-heading mt-2">Dr. {user?.full_name}</h1><p className="text-sm opacity-70">Review patient appointment requests and update their status.</p></header>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={CalendarDays} label="Confirmed visits" value={stats?.upcoming_appointments} />
        <Metric icon={Clock3} label="Pending requests" value={stats?.total_assessments} />
        <Metric icon={Users} label="Appointments" value={appointments.length} />
      </div>
      <section className="glass-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Patient consultation queue</h2>
        {loading ? <p className="text-sm opacity-70">Loading appointments…</p> : appointments.length === 0 ? <p className="text-sm opacity-70">No appointment requests available.</p> : (
          <div className="divide-y divide-seafoam/55">
            {appointments.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div><h3 className="font-bold">{item.patient_name || 'Patient'}</h3><p className="mt-1 text-xs opacity-70">{new Date(item.date_time).toLocaleString()} · {item.consultation_type.replaceAll('_', ' ')}</p>{item.reason && <p className="mt-1 text-xs">Reason: {item.reason}</p>}</div>
              <div className="flex flex-wrap items-center gap-2"><span className="badge badge-outline">{item.status}</span>
                {item.status === 'requested' && <><button type="button" className="btn btn-primary btn-xs rounded-full" onClick={() => updateStatus(item.id, 'confirmed')}>Confirm</button><button type="button" className="btn btn-outline btn-xs rounded-full" onClick={() => updateStatus(item.id, 'rejected')}>Decline</button></>}
                {item.status === 'confirmed' && <button type="button" className="btn btn-primary btn-xs rounded-full" onClick={() => updateStatus(item.id, 'completed')}>Mark completed</button>}
              </div>
            </article>)}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <article className="glass-card p-4"><Icon className="mb-2 h-5 w-5" /><p className="text-xs opacity-70">{label}</p><strong className="font-display text-2xl">{value ?? '—'}</strong></article>;
}

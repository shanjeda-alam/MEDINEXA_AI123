'use client';

import { useEffect, useState } from 'react';
import { appointmentAPI, doctorAPI } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

export function UserAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [type, setType] = useState('in_person');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [appointmentResult, doctorResult] = await Promise.all([appointmentAPI.list(), doctorAPI.list()]);
      setAppointments(appointmentResult.data);
      setDoctors(doctorResult.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Appointments could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      try {
        const [appointmentResult, doctorResult] = await Promise.all([appointmentAPI.list(), doctorAPI.list()]);
        if (!active) return;
        setAppointments(appointmentResult.data);
        setDoctors(doctorResult.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.detail || 'Appointments could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetch();
    const preselected = new URLSearchParams(window.location.search).get('doctor_id');
    if (preselected) {
      setDoctorId(preselected);
      setShowModal(true);
    }
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await appointmentAPI.create({
        doctor_id: Number(doctorId),
        date_time: new Date(dateTime).toISOString(),
        consultation_type: type,
        reason,
      });
      setNotice('Appointment request sent.');
      setShowModal(false);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not request this appointment.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment request?')) return;
    try {
      await appointmentAPI.cancel(id);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not cancel this appointment.');
    }
  };

  return (
    <main className="page-shell space-y-5">
      <header className="glass-card flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="section-kicker">Patient portal</p><h1 className="page-heading mt-2">My appointments</h1></div><button type="button" className="btn btn-primary rounded-full" onClick={() => setShowModal(true)}>Book appointment</button></header>
      {error && <p role="alert" className="error-message">{error}</p>}
      {notice && <p role="status" className="success-message">{notice}</p>}
      {loading ? <p className="glass-card p-6 text-center">Loading appointments…</p> : appointments.length === 0 ? <p className="glass-card p-8 text-center text-sm">No appointments booked yet.</p> : (
        <div className="space-y-3">
          {appointments.map((item) => <article key={item.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-4">
            <div><h2 className="font-bold">{item.doctor_name || 'Specialist'}</h2><p className="mt-1 text-xs opacity-70">{new Date(item.date_time).toLocaleString()} · {item.consultation_type.replaceAll('_', ' ')}</p>{item.reason && <p className="mt-1 text-xs">Reason: {item.reason}</p>}</div>
            <div className="flex items-center gap-2"><span className="badge badge-outline">{item.status}</span>{!['cancelled', 'completed'].includes(item.status) && <button className="btn btn-outline btn-xs rounded-full" type="button" onClick={() => cancel(item.id)}>Cancel</button>}</div>
          </article>)}
        </div>
      )}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Request an appointment">
        <form className="space-y-4" onSubmit={submit}>
          <label className="form-control"><span>Doctor</span><select className="select select-bordered" required value={doctorId} onChange={(event) => setDoctorId(event.target.value)}><option value="">Choose a doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name} · {doctor.specialty?.name || 'Specialist'}</option>)}</select></label>
          <label className="form-control"><span>Date and time</span><input className="input input-bordered" required type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} /></label>
          <label className="form-control"><span>Consultation mode</span><select className="select select-bordered" value={type} onChange={(event) => setType(event.target.value)}><option value="in_person">In person</option><option value="telehealth">Telehealth</option></select></label>
          <label className="form-control"><span>Reason (optional)</span><textarea className="textarea textarea-bordered" value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          <button type="submit" className="btn btn-primary w-full rounded-full" disabled={saving}>{saving ? 'Requesting…' : 'Send appointment request'}</button>
        </form>
      </Modal>
    </main>
  );
}

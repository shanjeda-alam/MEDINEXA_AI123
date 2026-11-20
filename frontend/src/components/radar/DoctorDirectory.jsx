'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CalendarDays, CheckCircle2, MapPin, Search, Stethoscope } from 'lucide-react';
import { appointmentAPI, doctorAPI } from '@/lib/api';
import { getDoctorImage } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';

export function DoctorDirectory({ compact = false }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [query, setQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [dateTime, setDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specialtyError, setSpecialtyError] = useState('');
  const [notice, setNotice] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    doctorAPI.getSpecialties()
      .then(({ data }) => setSpecialties(data))
      .catch((requestError) => setSpecialtyError(requestError.response?.data?.detail || 'Specialty filters could not be loaded.'));
  }, []);

  useEffect(() => {
    let active = true;
    const params = {};
    if (specialty) params.specialty = specialty;
    if (consultationType) params.consultation_type = consultationType;
    if (query) params.search = query;
    setLoading(true);
    setError('');
    doctorAPI.list(params)
      .then(({ data }) => { if (active) setDoctors(data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.detail || 'Doctors could not be loaded. Check the backend connection.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [consultationType, query, specialty]);

  const bookAppointment = async (event) => {
    event.preventDefault();
    if (!selectedDoctor || !dateTime) return;
    setBooking(true);
    setError('');
    setNotice('');
    try {
      await appointmentAPI.create({
        doctor_id: selectedDoctor.id,
        date_time: new Date(dateTime).toISOString(),
        consultation_type: consultationType || 'in_person',
        reason,
      });
      setNotice('Appointment request sent successfully.');
      setSelectedDoctor(null);
      setDateTime('');
      setReason('');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not request this appointment.');
    } finally {
      setBooking(false);
    }
  };

  const visibleDoctors = compact ? doctors.slice(0, 3) : doctors;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="glass-card grid gap-3 p-4 md:grid-cols-[1.3fr_1fr_1fr]">
          <label className="form-control">
            <span>Search doctors</span>
            <span className="relative"><Search className="absolute left-3 top-3 h-4 w-4 opacity-50" /><input className="input input-bordered pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or credentials" /></span>
          </label>
          <label className="form-control">
            <span>Specialty</span>
            <select className="select select-bordered" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
              <option value="">All specialties</option>
              {specialties.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span>Consultation</span>
            <select className="select select-bordered" value={consultationType} onChange={(event) => setConsultationType(event.target.value)}>
              <option value="">Any mode</option><option value="in_person">In person</option><option value="telehealth">Telehealth</option>
            </select>
          </label>
        </div>
      )}

      {error && <p role="alert" className="error-message">{error}</p>}
      {specialtyError && !error && <p role="alert" className="error-message">{specialtyError}</p>}
      {notice && <p role="status" className="success-message">{notice}</p>}
      {loading ? <p className="glass-card p-6 text-center text-sm">Loading verified doctors…</p> : null}
      {!loading && !error && doctors.length === 0 && <p className="glass-card p-8 text-center text-sm">No doctors match these filters.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleDoctors.map((doctor, index) => (
          <article key={doctor.id} className="doctor-card glass-card p-5">
            <div className="flex items-start gap-3">
              <img className="doctor-avatar" src={doctor.avatar_url || getDoctorImage(index)} alt="" />
              <div className="min-w-0">
                <h3 className="font-display font-bold">{doctor.full_name}</h3>
                <p className="text-xs font-semibold">{doctor.specialty?.name || 'General Practitioner'}</p>
                {doctor.is_verified && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold"><CheckCircle2 size={12} /> Verified</span>}
              </div>
            </div>
            <div className="space-y-2 text-xs opacity-75">
              <p><Award className="mr-1 inline h-3.5 w-3.5" /> {doctor.experience_years} years · {doctor.qualifications || 'Qualifications not listed'}</p>
              {doctor.hospital_name && <p><MapPin className="mr-1 inline h-3.5 w-3.5" /> {doctor.hospital_name}</p>}
              {doctor.consultation_fee != null && <p>Consultation fee: ৳{doctor.consultation_fee} BDT</p>}
            </div>
            {user ? (
              <button type="button" className="btn btn-primary btn-sm mt-auto rounded-full" onClick={() => setSelectedDoctor(doctor)}>
                <CalendarDays size={15} /> Book Appointment
              </button>
            ) : (
              <Link className="btn btn-primary btn-sm mt-auto rounded-full" href="/login">Sign in to book</Link>
            )}
          </article>
        ))}
      </div>

      {compact && <Link className="btn btn-outline btn-sm rounded-full" href="/doctors"><Stethoscope size={15} /> View all doctors</Link>}

      <Modal open={Boolean(selectedDoctor)} onClose={() => setSelectedDoctor(null)} title={`Book ${selectedDoctor?.full_name || 'an appointment'}`}>
        <form className="space-y-4" onSubmit={bookAppointment}>
          <label className="form-control"><span>Date and time</span><input className="input input-bordered" required type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} /></label>
          <label className="form-control"><span>Consultation mode</span><select className="select select-bordered" value={consultationType || 'in_person'} onChange={(event) => setConsultationType(event.target.value)}><option value="in_person">In person</option><option value="telehealth">Telehealth</option></select></label>
          <label className="form-control"><span>Reason (optional)</span><textarea className="textarea textarea-bordered" value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          <button type="submit" className="btn btn-primary w-full rounded-full" disabled={booking}>{booking ? 'Requesting…' : 'Request appointment'}</button>
        </form>
      </Modal>
    </div>
  );
}

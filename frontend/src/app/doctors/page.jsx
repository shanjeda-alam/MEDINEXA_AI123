import { DoctorDirectory } from '@/components/radar/DoctorDirectory';

export default function DoctorsPage() {
  return <main className="page-shell space-y-5"><header className="glass-card p-5"><p className="section-kicker">Verified specialist directory</p><h1 className="page-heading mt-2">Smart Doctors</h1><p className="text-sm opacity-70">Filter doctors and request appointments through the existing appointment API.</p></header><DoctorDirectory /></main>;
}

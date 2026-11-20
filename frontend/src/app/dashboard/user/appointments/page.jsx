import { UserAppointments } from '@/components/ui/UserAppointments';
import { ProtectedGate } from '@/components/ui/ProtectedGate';

export default function UserAppointmentsPage() {
  return <ProtectedGate allowedRoles={['user', 'doctor', 'admin']}><UserAppointments /></ProtectedGate>;
}

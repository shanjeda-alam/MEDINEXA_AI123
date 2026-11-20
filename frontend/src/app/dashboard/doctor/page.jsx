import { DoctorWorkspace } from '@/components/ui/DoctorWorkspace';
import { ProtectedGate } from '@/components/ui/ProtectedGate';

export default function DoctorDashboardPage() {
  return <ProtectedGate allowedRoles={['doctor', 'admin']}><DoctorWorkspace /></ProtectedGate>;
}

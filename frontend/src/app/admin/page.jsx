import { AdminWorkspace } from '@/components/ui/AdminWorkspace';
import { ProtectedGate } from '@/components/ui/ProtectedGate';

export default function AdminPage() {
  return <ProtectedGate allowedRoles={['admin']}><AdminWorkspace /></ProtectedGate>;
}

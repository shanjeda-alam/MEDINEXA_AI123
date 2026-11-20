import { ProfileSettings } from '@/components/ui/ProfileSettings';
import { ProtectedGate } from '@/components/ui/ProtectedGate';

export default function UserProfilePage() {
  return <ProtectedGate allowedRoles={['user', 'doctor', 'admin']}><ProfileSettings /></ProtectedGate>;
}

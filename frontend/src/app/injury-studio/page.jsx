import { InjuryScanner } from '@/components/scanner/InjuryScanner';
import { ProtectedGate } from '@/components/ui/ProtectedGate';

export default function InjuryStudioPage() {
  return <ProtectedGate allowedRoles={['user', 'doctor', 'admin']}><main className="page-shell space-y-4"><header className="glass-card p-5"><p className="section-kicker">AI injury vision</p><h1 className="page-heading mt-2">Injury Studio</h1><p className="text-sm opacity-70">Describe the injury and upload an optional photo for the existing preliminary assessment service.</p></header><InjuryScanner /></main></ProtectedGate>;
}

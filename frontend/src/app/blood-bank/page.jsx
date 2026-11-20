import { BloodBankInventory } from '@/components/radar/BloodBankInventory';

export default function BloodBankPage() {
  return <main className="page-shell space-y-5"><header className="glass-card p-5"><p className="section-kicker">Emergency support</p><h1 className="page-heading mt-2">Blood Bank</h1></header><BloodBankInventory /></main>;
}

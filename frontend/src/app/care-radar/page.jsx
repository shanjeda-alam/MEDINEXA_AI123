import { SpatialCareRadar } from '@/components/radar/SpatialCareRadar';
import { BloodBankInventory } from '@/components/radar/BloodBankInventory';

export default function CareRadarPage() {
  return <main className="page-shell space-y-5"><header className="glass-card p-5"><p className="section-kicker">GPS care discovery</p><h1 className="page-heading mt-2">Care Radar & Hospitals</h1><p className="text-sm opacity-70">Search the existing verified hospital directory and use device location for distance sorting.</p></header><SpatialCareRadar /><BloodBankInventory /></main>;
}

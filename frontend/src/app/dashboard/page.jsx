'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardWorkspace } from '@/components/ui/DashboardWorkspace';
import { ProtectedGate } from '@/components/ui/ProtectedGate';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'doctor') router.replace('/dashboard/doctor');
    if (user?.role === 'admin') router.replace('/admin');
  }, [router, user]);

  if (!loading && user && user.role !== 'user') return <div className="page-loading">Opening your role workspace…</div>;
  return <ProtectedGate allowedRoles={['user']}><DashboardWorkspace /></ProtectedGate>;
}

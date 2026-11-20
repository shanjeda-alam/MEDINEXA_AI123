'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function ProtectedGate({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (allowedRoles && !allowedRoles.includes(user.role)))) {
      router.replace('/login');
    }
  }, [allowedRoles, loading, pathname, router, user]);

  if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <div className="page-loading" role="status">Checking your secure session…</div>;
  }

  return children;
}

'use client';

import { AuthProvider } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';

export function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <LocationProvider>{children}</LocationProvider>
    </AuthProvider>
  );
}

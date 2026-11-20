'use client';

import { createContext, useContext, useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const location = useGeolocation();
  const value = useMemo(() => location, [location]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocationContext must be used within LocationProvider');
  return context;
}

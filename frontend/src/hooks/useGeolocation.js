'use client';

import { useCallback, useState } from 'react';

export function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setStatus('Locating nearby facilities...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ lat: coords.latitude, lng: coords.longitude });
        setStatus('Sorted by proximity to your device location.');
        setLoading(false);
      },
      () => {
        setStatus('Location access denied. Displaying the general directory.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { coordinates, status, loading, requestLocation };
}

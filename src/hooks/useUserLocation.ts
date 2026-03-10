import { useState, useEffect } from 'react';

export type LocationPermission = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface UserLocationState {
  permission: LocationPermission;
  location: UserLocation | null;
  error: string | null;
  isLoading: boolean;
  request: () => void;
}

export function useUserLocation(): UserLocationState {
  const [permission, setPermission] = useState<LocationPermission>('prompt');
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = () => {
    if (!navigator.geolocation) {
      setPermission('unavailable');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setPermission('granted');
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied');
          setError('Location access denied by user.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPermission('unavailable');
          setError('Location information is unavailable.');
        } else {
          setPermission('unavailable');
          setError('Location request timed out.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-prompt on mount
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    if (!navigator.geolocation) {
      setPermission('unavailable');
      return;
    }

    // Check existing permission state without prompting
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          request(); // Already granted — fetch immediately
        } else if (result.state === 'denied') {
          setPermission('denied');
          setError('Location access denied. Enable in browser settings.');
        }
        // 'prompt' — wait for user to click
      });
    }
  }, []);

  return { permission, location, error, isLoading, request };
}
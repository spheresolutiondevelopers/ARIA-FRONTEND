'use client';

import React from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';

// Uses OpenStreetMap via iframe — no API key required
function MapEmbed({ lat, lng }: { lat: number; lng: number }) {
  const zoom = 15;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height: '180px' }}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        title="User current location"
      />
      {/* Overlay coords */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </div>
      {/* Link to full map */}
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-cyan hover:text-white transition-colors"
      >
        Open map ↗
      </a>
    </div>
  );
}

export const UserLocationMap: React.FC = () => {
  const { permission, location, error, isLoading, request } = useUserLocation();

  return (
    <div className="flex flex-col gap-3">
      {/* ── Granted: show map ── */}
      {permission === 'granted' && location && (
        <MapEmbed lat={location.lat} lng={location.lng} />
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center h-28 rounded-lg bg-bg-deep border border-border">
          <span className="text-xs text-text-muted animate-pulse">Acquiring location…</span>
        </div>
      )}

      {/* ── Prompt: ask user ── */}
      {permission === 'prompt' && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 h-28 rounded-lg bg-bg-deep border border-border border-dashed px-4 text-center">
          <p className="text-xs text-text-secondary">
            Allow location access to display your current position on the map.
          </p>
          <button
            onClick={request}
            className="px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/40 text-cyan text-xs font-semibold hover:bg-cyan/20 transition-colors"
          >
            Enable Location
          </button>
        </div>
      )}

      {/* ── Denied ── */}
      {permission === 'denied' && (
        <div className="flex flex-col items-center justify-center gap-2 h-28 rounded-lg bg-bg-deep border border-red-500/30 px-4 text-center">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-xs text-text-secondary">
            Location access denied.
          </p>
          <p className="text-xs text-text-muted">
            Enable in your browser settings and reload.
          </p>
        </div>
      )}

      {/* ── Unavailable / error ── */}
      {permission === 'unavailable' && (
        <div className="flex flex-col items-center justify-center gap-2 h-28 rounded-lg bg-bg-deep border border-amber-500/30 px-4 text-center">
          <span className="text-amber-400 text-lg">◎</span>
          <p className="text-xs text-text-secondary">Local service not configured.</p>
          <p className="text-xs text-text-muted">{error ?? 'No connection to location services.'}</p>
        </div>
      )}
    </div>
  );
};
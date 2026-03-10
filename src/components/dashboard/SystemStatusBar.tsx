'use client';

import React from 'react';
import { useSystemStatus, ServiceState } from '@/hooks/useSystemStatus';

// ── Per-service config ────────────────────────────────────────────────────────

const SERVICES = [
  { key: 'gemini',   label: 'Gemini Live' },
  { key: 'maps',     label: 'Maps'        },
  { key: 'firebase', label: 'Firebase'    },
] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ state }: { state: ServiceState }) {
  const base = 'inline-block w-2 h-2 rounded-full flex-shrink-0';
  const styles: Record<ServiceState, string> = {
    connected: `${base} bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)] animate-pulse`,
    checking:  `${base} bg-amber-400 opacity-70 animate-pulse`,
    degraded:  `${base} bg-amber-400`,
    error:     `${base} bg-red-500`,
  };
  return <span className={styles[state]} />;
}

function ServicePill({
  label,
  state,
}: {
  label: string;
  state: ServiceState;
}) {
  const textColor: Record<ServiceState, string> = {
    connected: 'text-emerald-400',
    checking:  'text-amber-400',
    degraded:  'text-amber-400',
    error:     'text-red-400',
  };
  const subLabel: Record<ServiceState, string> = {
    connected: 'Connected',
    checking:  'Checking…',
    degraded:  'Degraded',
    error:     'Unavailable',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-card">
      <StatusDot state={state} />
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className={`text-xs font-semibold ${textColor[state]}`}>
        {subLabel[state]}
      </span>
    </div>
  );
}

function SystemReadyPill({ state }: { state: ServiceState }) {
  const isReady = state === 'connected';
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
        isReady
          ? 'border-emerald-500/40 bg-emerald-500/10'
          : 'border-border bg-bg-card'
      }`}
    >
      <StatusDot state={state} />
      <span
        className={`text-xs font-semibold tracking-wide ${
          isReady ? 'text-emerald-400' : 'text-amber-400'
        }`}
      >
        {isReady ? 'System Ready' : state === 'checking' ? 'Initialising…' : 'System Degraded'}
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export const SystemStatusBar: React.FC = () => {
  const status = useSystemStatus();

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Per-service pills */}
      {SERVICES.map(({ key, label }) => (
        <ServicePill
          key={key}
          label={label}
          state={status[key as keyof typeof status] as ServiceState}
        />
      ))}

      {/* Divider */}
      <span className="hidden sm:block w-px h-4 bg-border mx-1" />

      {/* System ready summary */}
      <SystemReadyPill state={status.overall} />

      {/* Response time — only show once loaded */}
      {status.responseTimeMs !== null && (
        <span className="text-xs text-text-muted ml-auto">
          {status.responseTimeMs} ms
        </span>
      )}
    </div>
  );
};
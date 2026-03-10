import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type ServiceState = 'checking' | 'connected' | 'degraded' | 'error';

export interface SystemStatus {
  gemini: ServiceState;
  maps: ServiceState;
  firebase: ServiceState;
  overall: ServiceState;
  sessionId: string | null;
  responseTimeMs: number | null;
  isLoading: boolean;
  lastChecked: Date | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function parseCheckValue(value: string | undefined): ServiceState {
  if (!value) return 'error';
  if (value === 'healthy') return 'connected';
  if (value.startsWith('unconfigured')) return 'degraded';
  return 'error';
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSystemStatus(pollIntervalMs = 30_000): SystemStatus {
  const [status, setStatus] = useState<SystemStatus>({
    gemini: 'checking',
    maps: 'checking',
    firebase: 'checking',
    overall: 'checking',
    sessionId: null,
    responseTimeMs: null,
    isLoading: true,
    lastChecked: null,
  });

  const sessionCreated = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Create session once on mount ──────────────────────────────────────────
  const createSession = useCallback(async () => {
    if (sessionCreated.current) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_type: 'dashboard' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      sessionCreated.current = true;
      setStatus(prev => ({ ...prev, sessionId: data.session_id ?? null }));
    } catch {
      // Non-blocking — dashboard still works without a session id
    }
  }, []);

  // ── Poll health endpoint ──────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const checks = data.checks ?? {};
      const overall: ServiceState =
        data.status === 'healthy'
          ? 'connected'
          : data.status === 'degraded'
          ? 'degraded'
          : 'error';

      setStatus(prev => ({
        ...prev,
        gemini: parseCheckValue(checks.gemini),
        maps: parseCheckValue(checks.maps),
        firebase: parseCheckValue(checks.firebase),
        overall,
        responseTimeMs: data.response_time_ms ?? null,
        isLoading: false,
        lastChecked: new Date(),
      }));
    } catch {
      setStatus(prev => ({
        ...prev,
        gemini: 'error',
        maps: 'error',
        firebase: 'error',
        overall: 'error',
        isLoading: false,
        lastChecked: new Date(),
      }));
    }
  }, []);

  useEffect(() => {
    checkHealth();
    createSession();

    intervalRef.current = setInterval(checkHealth, pollIntervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkHealth, createSession, pollIntervalMs]);

  return status;
}
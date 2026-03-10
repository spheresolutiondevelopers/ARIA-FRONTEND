 
// ── Session ───────────────────────────────────────────────────────────────────

export type SessionType = 'navigation' | 'coach' | 'dashboard';

export interface DeviceInfo {
  userAgent: string;
  screenSize?: string;
  platform?: string;
  language?: string;
}

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

/** POST /api/v1/sessions/start  →  request body */
export interface SessionStartRequest {
  session_type: SessionType;
  device_info?: DeviceInfo;
  location?: Location;
}

/** POST /api/v1/sessions/start  →  response body */
export interface SessionResponse {
  session_id: string;
  message: string;
}

/** GET /api/v1/sessions/{session_id}  →  response body */
export interface SessionHistoryResponse {
  session: Record<string, unknown>;
  navigation_data: Record<string, unknown>[];
  coaching_data: Record<string, unknown>[];
  events: Record<string, unknown>[];
}

// ── Health ────────────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthChecks {
  firebase: string;
  gemini: string;
  maps: string;
}

/** GET /api/v1/health  →  response body */
export interface HealthResponse {
  status: HealthStatus;
  timestamp: number;
  environment: string;
  version: string;
  checks: HealthChecks;
  response_time_ms: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface RouteRequest {
  origin: Location;
  destination: Location;
  mode?: 'walking' | 'driving' | 'transit';
  alternatives?: boolean;
  units?: 'metric' | 'imperial';
}

export interface RouteResponse {
  route: Record<string, unknown>;
  message: string;
}

// ── SOS ───────────────────────────────────────────────────────────────────────

export interface SOSRequest {
  location: Location;
  location_accuracy: number;
  session_id?: string;
  mode: 'navigation' | 'coach' | 'unknown';
  trigger_method: 'button' | 'voice' | 'auto';
  alert_type: 'fall' | 'medical' | 'test' | 'other';
  contacts?: string[];
  message?: string;
}

export interface SOSResponse {
  alert_id: string;
  message: string;
  sms_sent: boolean;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export interface ErrorResponse {
  error: string;
  message: string;
  status_code: number;
}
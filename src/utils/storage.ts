import type { CampusEvent, UserSession } from '../types';
import { SEED_EVENTS } from '../data/seedEvents';

const STORAGE_KEYS = {
  EVENTS: 'campuspulse_events_v1',
  RSVPS: 'campuspulse_rsvps_v1',
  SESSION: 'campuspulse_session_v1',
  GEMINI_KEY: 'campuspulse_gemini_api_key',
} as const;

export function loadEvents(): CampusEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
      return SEED_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as CampusEvent[];
    }
    return SEED_EVENTS;
  } catch {
    return SEED_EVENTS;
  }
}

export function saveEvents(events: CampusEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export function resetEventsToSeed(): CampusEvent[] {
  saveEvents(SEED_EVENTS);
  saveRsvps([]);
  return SEED_EVENTS;
}

export function loadRsvps(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RSVPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function saveRsvps(rsvpIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvpIds));
  } catch {
    // Ignore storage quota issues gracefully
  }
}

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if (parsed && (parsed.role === 'student' || parsed.role === 'organiser')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedGeminiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveGeminiKey(key: string): void {
  try {
    if (!key.trim()) {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
    }
  } catch {
    // Ignore storage errors
  }
}

export function formatEventDate(dateStr: string): string {
  if (!dateStr) return 'TBD';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatEventTime(timeStr: string): string {
  if (!timeStr) return 'TBD';
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

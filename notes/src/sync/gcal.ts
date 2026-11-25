import { CalendarEventInput, getCalendarWindow } from '../core/calendar';

type GCalApiEvent = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: {
    date?: string;
    dateTime?: string;
  };
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: {
              access_token?: string;
              expires_in?: number;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

const TOKEN_STORAGE_KEY = 'daily-notes-gcal-token-v1';

const getCachedToken = (clientId: string): string | null => {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      clientId: string;
      token: string;
      expiresAt: number;
    };
    if (
      parsed.clientId === clientId &&
      parsed.token &&
      Date.now() < parsed.expiresAt - 60_000
    ) {
      return parsed.token;
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

const setCachedToken = (
  clientId: string,
  token: string,
  expiresInSec = 3600
): void => {
  try {
    sessionStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({
        clientId,
        token,
        expiresAt: Date.now() + expiresInSec * 1000,
      })
    );
  } catch {
    // ignore storage errors
  }
};

const loadGisScript = (): Promise<void> => {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google GIS')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google GIS'));
    document.head.appendChild(script);
  });
};

export const requestCalendarToken = async (
  clientId: string,
  allowPopup = true
): Promise<string> => {
  const trimmedId = clientId.trim();
  if (!trimmedId) {
    throw new Error('Google Client ID not configured');
  }

  const cached = getCachedToken(trimmedId);
  if (cached) {
    return cached;
  }
  if (!allowPopup) {
    throw new Error('Calendar not connected yet (tap Connect Calendar)');
  }

  await loadGisScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services unavailable');
  }

  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: trimmedId,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(
            new Error(
              resp.error_description || resp.error || 'Calendar auth cancelled'
            )
          );
        } else {
          setCachedToken(trimmedId, resp.access_token, resp.expires_in ?? 3600);
          resolve(resp.access_token);
        }
      },
      error_callback: (err) => {
        reject(new Error(err.message || err.type || 'Google OAuth popup blocked'));
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
};

const formatEventDateTime = (
  dateTimeStr: string,
  timeZone?: string
): { date: string; time: string } | null => {
  const dt = new Date(dateTimeStr);
  if (Number.isNaN(dt.getTime())) return null;

  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).formatToParts(dt);
      const y = parts.find((p) => p.type === 'year')?.value;
      const m = parts.find((p) => p.type === 'month')?.value;
      const d = parts.find((p) => p.type === 'day')?.value;
      const hh = parts.find((p) => p.type === 'hour')?.value;
      const mm = parts.find((p) => p.type === 'minute')?.value;
      if (y && m && d && hh && mm) {
        return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
      }
    } catch {
      // Fall through to offset/local formatting
    }
  }

  // If browser default is used and Google sent an explicit ±HH:MM offset,
  // preserve the event's wall-clock date/time instead of shifting to OS offset.
  const offsetMatch = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?[+-]\d{2}:\d{2}$/.exec(
    dateTimeStr
  );
  if (offsetMatch) {
    return { date: offsetMatch[1], time: offsetMatch[2] };
  }

  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
};

export const fetchPrimaryCalendarEvents = async (
  accessToken: string,
  todayStr: string,
  timeZone?: string
): Promise<CalendarEventInput[]> => {
  const { startDate, endDateExclusive } = getCalendarWindow(todayStr);
  const timeMin = new Date(`${startDate}T00:00:00`).toISOString();
  const timeMax = new Date(`${endDateExclusive}T00:00:00`).toISOString();

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeMin,
    timeMax,
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Google Calendar API ${res.status}`);
  }

  const data = (await res.json()) as { items?: GCalApiEvent[] };
  const events: CalendarEventInput[] = [];

  for (const ev of data.items ?? []) {
    if (ev.status === 'cancelled' || !ev.id) continue;
    let date = ev.start?.date;
    let time: string | undefined;

    if (!date && ev.start?.dateTime) {
      const formatted = formatEventDateTime(ev.start.dateTime, timeZone);
      if (formatted) {
        date = formatted.date;
        time = formatted.time;
      }
    }

    if (!date) continue;
    events.push({
      id: ev.id,
      title: ev.summary?.trim() || '(No title)',
      date,
      time,
      location: ev.location?.trim(),
      htmlLink: ev.htmlLink,
    });
  }

  return events;
};

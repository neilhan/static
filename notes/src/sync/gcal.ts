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
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

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

export const requestCalendarToken = async (clientId: string): Promise<string> => {
  if (!clientId.trim()) {
    throw new Error('Google Client ID not configured');
  }
  await loadGisScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Google Identity Services unavailable');
  }

  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error || 'Calendar auth cancelled'));
        } else {
          resolve(resp.access_token);
        }
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
};

export const fetchPrimaryCalendarEvents = async (
  accessToken: string,
  todayStr: string
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
      const dt = new Date(ev.start.dateTime);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      date = `${y}-${m}-${d}`;
      time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
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

import { HistoryAction, HistoryEntry, ItemStatus, JournalItem } from './types';
import { isNumericId } from './ulid';

const HISTORY_LINE_RE = /^-\s+(\S+)\s+·\s+(\S+)\s+·\s+(.+?)\s+→\s+(.+)$/;

const unquote = (val: string): string => {
  const trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseFrontmatter = (block: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = unquote(value);
  }
  return result;
};

export type ParsedMarkdownItem = Omit<
  JournalItem,
  'parentId' | 'container' | 'dirty' | 'updatedAt' | 'remoteSha'
>;

export const parseItemMarkdown = (
  raw: string,
  path: string
): ParsedMarkdownItem | null => {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return null;
  }

  const endFmIdx = normalized.indexOf('\n---\n', 4);
  if (endFmIdx === -1) {
    return null;
  }

  const fmBlock = normalized.slice(4, endFmIdx);
  const fm = parseFrontmatter(fmBlock);
  if (!fm.id) {
    return null;
  }

  const rest = normalized.slice(endFmIdx + 5).replace(/^\n+/, '');
  const lines = rest.split('\n');

  let title = '';
  let bodyStartIdx = 0;
  if (lines[0]?.startsWith('# ')) {
    title = lines[0].slice(2).trim();
    bodyStartIdx = 1;
  }

  const remainingLines = lines.slice(bodyStartIdx);
  const historyHeaderIdx = remainingLines.findIndex(
    (line) => line.trim() === '## History'
  );

  let bodyLines: string[];
  const history: HistoryEntry[] = [];

  if (historyHeaderIdx === -1) {
    bodyLines = remainingLines;
  } else {
    bodyLines = remainingLines.slice(0, historyHeaderIdx);
    for (const hLine of remainingLines.slice(historyHeaderIdx + 1)) {
      const match = HISTORY_LINE_RE.exec(hLine.trim());
      if (match) {
        history.push({
          action: match[1] as HistoryAction,
          timestamp: match[2],
          from: match[3],
          to: match[4],
        });
      }
    }
  }

  const body = bodyLines.join('\n').trim();
  const fileSlug = path.split('/').pop()?.replace(/\.md$/i, '') ?? 'item';
  const status: ItemStatus =
    fm.status === 'done' || fm.status === 'archived' ? fm.status : 'open';
  const parsedOrder = Number(fm.order);

  return {
    id: fm.id,
    slug: fm.slug || fileSlug,
    status,
    order: Number.isFinite(parsedOrder) ? parsedOrder : 1,
    created: fm.created || new Date().toISOString().slice(0, 10),
    title: title || fm.slug || fileSlug,
    body,
    history,
    ...(fm.time ? { time: fm.time } : {}),
    ...(fm.collapsed === 'true' ? { collapsed: true } : {}),
    ...(fm.calendar ? { calendar: fm.calendar } : {}),
    ...(fm.calendarUrl ? { calendarUrl: fm.calendarUrl } : {}),
    path,
  };
};

export const serializeItemMarkdown = (item: ParsedMarkdownItem): string => {
  const idLine = isNumericId(item.id) ? `id: ${item.id}` : `id: "${item.id}"`;
  const fmLines = [
    '---',
    idLine,
    `status: ${item.status}`,
    `order: ${item.order}`,
    `created: ${item.created}`,
    `slug: ${item.slug}`,
  ];

  if (item.collapsed) {
    fmLines.push('collapsed: true');
  }
  if (item.calendar) {
    fmLines.push(`calendar: ${item.calendar}`);
  }
  if (item.calendarUrl) {
    fmLines.push(`calendarUrl: ${item.calendarUrl}`);
  }
  if (item.time) {
    fmLines.push(`time: ${item.time}`);
  }
  fmLines.push('---');

  const sections: string[] = [fmLines.join('\n'), `# ${item.title}`];

  if (item.body.trim()) {
    sections.push(item.body.trim());
  }

  if (item.history.length > 0) {
    const historyLines = [
      '## History',
      ...item.history.map(
        (h) => `- ${h.action} · ${h.timestamp} · ${h.from} → ${h.to}`
      ),
    ];
    sections.push(historyLines.join('\n'));
  }

  return `${sections.join('\n\n')}\n`;
};

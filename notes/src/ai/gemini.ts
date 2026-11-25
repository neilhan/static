import { containerToSortDate } from '../core/tree';
import { ContainerRef, ItemStatus, JournalItem } from '../core/types';

export type GeminiToolExecutor = {
  searchItems: (query: string) => JournalItem[];
  listDay: (date: string) => JournalItem[];
  listOverdue: () => JournalItem[];
  listNotes: () => JournalItem[];
  getItem: (id: string) => JournalItem | null;
  createItem: (args: {
    title: string;
    body?: string;
    containerKind: ContainerRef['kind'];
    containerKey: string;
    time?: string;
  }) => JournalItem;
  updateItem: (args: {
    id: string;
    title?: string;
    body?: string;
    time?: string;
  }) => JournalItem | null;
  moveItem: (args: {
    id: string;
    containerKind: ContainerRef['kind'];
    containerKey: string;
  }) => JournalItem | null;
  setStatus: (args: { id: string; status: ItemStatus }) => JournalItem | null;
  deleteItem: (id: string) => boolean;
};

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { name: string; response: { result: unknown } } };

type GeminiContent = {
  role: 'user' | 'model';
  parts: GeminiPart[];
};

const TOOL_DECLARATIONS = [
  {
    name: 'search_items',
    description: 'Search journal items by title or body text.',
    parameters: {
      type: 'OBJECT',
      properties: { query: { type: 'STRING' } },
      required: ['query'],
    },
  },
  {
    name: 'list_day',
    description: 'List non-archived items for a given date (YYYY-MM-DD).',
    parameters: {
      type: 'OBJECT',
      properties: { date: { type: 'STRING' } },
      required: ['date'],
    },
  },
  {
    name: 'list_overdue',
    description: 'List past-dated open non-calendar items.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'list_notes',
    description: 'List open/done items in the Notes container.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'create_item',
    description: 'Create a new journal item in a day, week, month, year, or notes container.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        body: { type: 'STRING' },
        containerKind: { type: 'STRING', enum: ['day', 'week', 'month', 'year', 'notes'] },
        containerKey: { type: 'STRING' },
        time: { type: 'STRING' },
      },
      required: ['title', 'containerKind', 'containerKey'],
    },
  },
  {
    name: 'update_item',
    description: 'Update title, body, or time of an existing item by id.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING' },
        title: { type: 'STRING' },
        body: { type: 'STRING' },
        time: { type: 'STRING' },
      },
      required: ['id'],
    },
  },
  {
    name: 'move_item',
    description: 'Move an item (and its subtree) to another day or period container.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING' },
        containerKind: { type: 'STRING', enum: ['day', 'week', 'month', 'year', 'notes'] },
        containerKey: { type: 'STRING' },
      },
      required: ['id', 'containerKind', 'containerKey'],
    },
  },
  {
    name: 'set_status',
    description: 'Mark an item open, done, or archived.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING' },
        status: { type: 'STRING', enum: ['open', 'done', 'archived'] },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'delete_item',
    description: 'Delete an item and its subtree by id.',
    parameters: {
      type: 'OBJECT',
      properties: { id: { type: 'STRING' } },
      required: ['id'],
    },
  },
];

const summarizeItem = (item: JournalItem) => ({
  id: item.id,
  title: item.title,
  status: item.status,
  container: item.container,
  time: item.time,
  body: item.body.slice(0, 300),
  isCalendar: Boolean(item.calendar),
});

const runTool = (
  name: string,
  args: Record<string, unknown>,
  exec: GeminiToolExecutor
): unknown => {
  switch (name) {
    case 'search_items':
      return exec.searchItems(String(args.query ?? '')).slice(0, 20).map(summarizeItem);
    case 'list_day':
      return exec.listDay(String(args.date ?? '')).map(summarizeItem);
    case 'list_overdue':
      return exec.listOverdue().map(summarizeItem);
    case 'list_notes':
      return exec.listNotes().map(summarizeItem);
    case 'create_item':
      return summarizeItem(
        exec.createItem({
          title: String(args.title ?? ''),
          body: args.body ? String(args.body) : undefined,
          containerKind: (args.containerKind as ContainerRef['kind']) ?? 'day',
          containerKey: String(args.containerKey ?? ''),
          time: args.time ? String(args.time) : undefined,
        })
      );
    case 'update_item': {
      const updated = exec.updateItem({
        id: String(args.id ?? ''),
        title: args.title !== undefined ? String(args.title) : undefined,
        body: args.body !== undefined ? String(args.body) : undefined,
        time: args.time !== undefined ? String(args.time) : undefined,
      });
      return updated ? summarizeItem(updated) : { error: 'Item not found' };
    }
    case 'move_item': {
      const moved = exec.moveItem({
        id: String(args.id ?? ''),
        containerKind: (args.containerKind as ContainerRef['kind']) ?? 'day',
        containerKey: String(args.containerKey ?? ''),
      });
      return moved ? summarizeItem(moved) : { error: 'Item not found' };
    }
    case 'set_status': {
      const updated = exec.setStatus({
        id: String(args.id ?? ''),
        status: (args.status as ItemStatus) ?? 'done',
      });
      return updated ? summarizeItem(updated) : { error: 'Item not found' };
    }
    case 'delete_item':
      return { deleted: exec.deleteItem(String(args.id ?? '')) };
    default:
      return { error: `Unknown tool: ${name}` };
  }
};

export const speakText = (text: string): void => {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const hasCjk = /[\u4e00-\u9fff]/.test(text);
  utterance.lang = hasCjk ? 'zh-CN' : 'en-US';
  window.speechSynthesis.speak(utterance);
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const runGeminiTurn = async (params: {
  apiKey: string;
  model: string;
  todayStr: string;
  history: GeminiContent[];
  userText?: string;
  audioBlob?: Blob;
  executor: GeminiToolExecutor;
}): Promise<{ replyText: string; mutated: boolean; nextHistory: GeminiContent[] }> => {
  const { apiKey, model, todayStr, executor } = params;
  if (!apiKey.trim()) {
    throw new Error('Gemini API key is required in Settings.');
  }

  const userParts: GeminiPart[] = [];
  if (params.audioBlob) {
    const base64 = await blobToBase64(params.audioBlob);
    userParts.push({
      inlineData: {
        mimeType: params.audioBlob.type || 'audio/mp4',
        data: base64,
      },
    });
  }
  if (params.userText?.trim()) {
    userParts.push({ text: params.userText.trim() });
  } else if (params.audioBlob) {
    userParts.push({
      text: 'Listen to the user voice message and answer or update their journal using tools.',
    });
  }

  const contents: GeminiContent[] = [
    ...params.history,
    { role: 'user', parts: userParts },
  ];

  const systemInstruction = {
    parts: [
      {
        text: `You are Daily Notes assistant. Today is ${todayStr}. Use the provided tools to search, read, create, update, move, complete, or delete items in the user's journal. Keep replies concise and natural. Never modify calendar items.`,
      },
    ],
  };

  let mutated = false;
  const WRITE_TOOLS = new Set([
    'create_item',
    'update_item',
    'move_item',
    'set_status',
    'delete_item',
  ]);

  for (let step = 0; step < 6; step += 1) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction,
        contents,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gemini API ${res.status}: ${errText || res.statusText}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: GeminiContent }>;
    };
    const modelContent = data.candidates?.[0]?.content;
    if (!modelContent) {
      throw new Error('Empty response from Gemini.');
    }

    contents.push(modelContent);
    const fnCalls = modelContent.parts.filter(
      (p): p is { functionCall: { name: string; args: Record<string, unknown> } } =>
        'functionCall' in p
    );

    if (fnCalls.length === 0) {
      const replyText = modelContent.parts
        .filter((p): p is { text: string } => 'text' in p)
        .map((p) => p.text)
        .join('\n')
        .trim();
      return {
        replyText: replyText || 'Done.',
        mutated,
        nextHistory: contents,
      };
    }

    const responseParts: GeminiPart[] = fnCalls.map((call) => {
      if (WRITE_TOOLS.has(call.functionCall.name)) {
        mutated = true;
      }
      const result = runTool(call.functionCall.name, call.functionCall.args ?? {}, executor);
      return {
        functionResponse: {
          name: call.functionCall.name,
          response: { result },
        },
      };
    });

    contents.push({ role: 'user', parts: responseParts });
  }

  return {
    replyText: 'Completed tool calls.',
    mutated,
    nextHistory: contents,
  };
};

export const createExecutorFromItems = (
  getItems: () => JournalItem[],
  todayStr: string,
  actions: {
    create: GeminiToolExecutor['createItem'];
    update: GeminiToolExecutor['updateItem'];
    move: GeminiToolExecutor['moveItem'];
    setStatus: GeminiToolExecutor['setStatus'];
    remove: GeminiToolExecutor['deleteItem'];
  }
): GeminiToolExecutor => ({
  searchItems: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return getItems().filter(
      (i) =>
        i.status !== 'archived' &&
        (i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q))
    );
  },
  listDay: (date) =>
    getItems()
      .filter((i) => i.status !== 'archived' && i.container.kind === 'day' && i.container.key === date)
      .sort((a, b) => a.order - b.order),
  listOverdue: () =>
    getItems().filter(
      (i) =>
        i.status === 'open' &&
        !i.calendar &&
        i.container.kind !== 'notes' &&
        containerToSortDate(i.container) < todayStr
    ),
  listNotes: () =>
    getItems()
      .filter((i) => i.status !== 'archived' && i.container.kind === 'notes')
      .sort((a, b) => a.order - b.order),
  getItem: (id) => getItems().find((i) => i.id === id) ?? null,
  createItem: actions.create,
  updateItem: actions.update,
  moveItem: actions.move,
  setStatus: actions.setStatus,
  deleteItem: actions.remove,
});

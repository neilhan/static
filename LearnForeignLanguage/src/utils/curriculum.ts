import {
  CollectionProgress,
  ConversationCollection,
  SourceId,
  VocabItem,
} from '../types';

export const DEFAULT_PROGRESS: CollectionProgress = {
  targetVoiceURI: '',
  targetLang: 'es-ES',
  nativeVoiceURI: '',
  nativeLang: 'en-US',
  playbackSettings: {
    playNative: true,
    includePause: true,
  },
  srsData: {},
};

const SOURCE_META: Record<SourceId, { name: string; itemCount: number }> = {
  phrases: {
    name: 'Spanish Phrases (500)',
    itemCount: 500,
  },
  vocab: {
    name: 'Spanish Vocab (3,000)',
    itemCount: 3000,
  },
};

const loadedItems: Partial<Record<SourceId, VocabItem[]>> = {};
const itemSourceMap = new Map<string, SourceId>();

export async function loadSourceItems(sourceId: SourceId): Promise<VocabItem[]> {
  const cached = loadedItems[sourceId];
  if (cached) return cached;

  const mod =
    sourceId === 'phrases'
      ? await import('../data/spanish-500-phrases.json')
      : await import('../data/spanish-3000-words.json');

  const items = mod.default as VocabItem[];
  loadedItems[sourceId] = items;
  for (const item of items) {
    itemSourceMap.set(item.id, sourceId);
  }
  return items;
}

export async function loadAllCurriculum(): Promise<{
  phrases: VocabItem[];
  vocab: VocabItem[];
}> {
  const [phrases, vocab] = await Promise.all([
    loadSourceItems('phrases'),
    loadSourceItems('vocab'),
  ]);
  return { phrases, vocab };
}

export function getSourceItems(sourceId: SourceId): VocabItem[] {
  return loadedItems[sourceId] ?? [];
}

export function getItemSourceId(itemId: string): SourceId | undefined {
  return itemSourceMap.get(itemId);
}

export function buildSourceCollection(
  sourceId: SourceId,
  progress: Partial<CollectionProgress> = {}
): ConversationCollection {
  const { name, itemCount } = SOURCE_META[sourceId];

  return {
    id: sourceId,
    packId: sourceId,
    name,
    itemCount,
    targetVoiceURI: progress.targetVoiceURI ?? DEFAULT_PROGRESS.targetVoiceURI,
    targetLang: progress.targetLang ?? DEFAULT_PROGRESS.targetLang,
    nativeVoiceURI: progress.nativeVoiceURI ?? DEFAULT_PROGRESS.nativeVoiceURI,
    nativeLang: progress.nativeLang ?? DEFAULT_PROGRESS.nativeLang,
    playbackSettings: {
      ...DEFAULT_PROGRESS.playbackSettings,
      ...(progress.playbackSettings ?? {}),
    },
    srsData: progress.srsData ?? {},
  };
}

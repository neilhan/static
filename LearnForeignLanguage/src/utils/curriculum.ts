import phrasesData from '../data/spanish-500-phrases.json';
import wordsData from '../data/spanish-3000-words.json';
import {
  CollectionProgress,
  Conversation,
  ConversationCollection,
  SourceId,
  VocabItem,
} from '../types';

export const PHRASE_ITEMS: VocabItem[] = phrasesData as VocabItem[];
export const VOCAB_ITEMS: VocabItem[] = wordsData as VocabItem[];

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

const SOURCE_META: Record<SourceId, { name: string; items: VocabItem[] }> = {
  phrases: {
    name: 'Spanish Phrases (500)',
    items: PHRASE_ITEMS,
  },
  vocab: {
    name: 'Spanish Vocab (3,000)',
    items: VOCAB_ITEMS,
  },
};

export function getSourceItems(sourceId: SourceId): VocabItem[] {
  return SOURCE_META[sourceId].items;
}

export function buildSourceCollection(
  sourceId: SourceId,
  progress: Partial<CollectionProgress> = {}
): ConversationCollection {
  const { name, items } = SOURCE_META[sourceId];
  const conversations: Conversation[] = items.map((item) => ({
    id: item.id,
    contentHash: item.id,
    sentences: [{ target: item.target, native: item.native }],
  }));

  const rawInput = items.map((item) => `${item.target} - ${item.native}`).join('\n\n');

  return {
    id: sourceId,
    packId: sourceId,
    name,
    rawInput,
    conversations,
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

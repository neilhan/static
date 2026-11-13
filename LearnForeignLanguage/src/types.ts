export interface WordForms {
  singular?: string;
  plural?: string;
  masculine?: string;
  feminine?: string;
  masculinePlural?: string;
  femininePlural?: string;
  yo?: string;
  tu?: string;
  el?: string;
  nosotros?: string;
  ellos?: string;
}

export interface VocabItem {
  id: string;
  rank?: number;
  band?: string;
  pack?: number;
  packName?: string;
  target: string;
  native: string;
  pos?: string;
  category?: string;
  forms?: WordForms;
  exampleTarget?: string;
  exampleNative?: string;
  note?: string;
}

export type SourceId = 'phrases' | 'vocab';

export interface CollectionProgress {
  targetVoiceURI: string;
  targetLang: string;
  nativeVoiceURI: string;
  nativeLang: string;
  playbackSettings: PlaybackSettings;
  srsData: Record<string, SRSData>;
}

export interface DailyDayStats {
  reviewed: number;
  newLearned: number;
}

export interface DailyProgress {
  date: string; // Local YYYY-MM-DD
  reviewed: number;
  newLearned: number;
  newLearnedBySource: Record<SourceId, number>;
  newCapBySource: Record<SourceId, number>;
  dailyGoal: number;
  streak: number;
  history: Record<string, DailyDayStats>;
}

export interface StoredProgressState {
  activeSourceId: SourceId;
  progress: Record<SourceId, CollectionProgress>;
  dailyProgress?: DailyProgress;
}

export interface Sentence {
  target: string;
  native: string;
}

export interface Conversation {
  id: string;
  contentHash: string;
  sentences: Sentence[];
}

export interface SRSData {
  lastReviewed: number; // Timestamp
  nextReview: number; // Timestamp
  interval: number; // Days
  repetition: number; // Count
  easeFactor: number; // Multiplier (default 2.5)
}

export interface PlaybackSettings {
  playNative: boolean; // If true, play native translation after target text
  includePause: boolean; // If true, pause equals the duration of the spoken text for repetition
}

export interface ConversationCollection {
  id: string;
  packId?: string;
  name: string;
  rawInput: string;
  conversations: Conversation[];

  // Settings specific to this collection
  targetVoiceURI: string;
  targetLang: string;

  nativeVoiceURI: string;
  nativeLang: string;

  // Playback settings
  playbackSettings: PlaybackSettings;

  // SRS Data map (Key: Content Hash)
  srsData: Record<string, SRSData>;
}

export interface AppState {
  collections: ConversationCollection[];
  activeCollectionId: string | null;
  dailyProgress: DailyProgress;
}

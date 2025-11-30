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
}

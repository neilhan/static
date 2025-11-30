import { AppState, ConversationCollection } from "../types";

const STORAGE_KEY = "learn-foreign-language-v2";

const DEFAULT_COLLECTION: ConversationCollection = {
  id: "default",
  name: "My First Collection",
  rawInput: "",
  conversations: [],
  targetVoiceURI: "",
  targetLang: "en-US",
  nativeVoiceURI: "",
  nativeLang: "zh-CN",
  playbackSettings: {
    playNative: false,
    includePause: true, // Default to true as requested
  },
  srsData: {},
};

export const DEFAULT_STATE: AppState = {
  collections: [DEFAULT_COLLECTION],
  activeCollectionId: "default",
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      // Try to migrate from v1 if it exists
      const oldV1 = localStorage.getItem("learn-foreign-language-v1");
      if (oldV1) {
        try {
          const v1State = JSON.parse(oldV1);
          // Convert v1 state to a collection
          const migratedCollection: ConversationCollection = {
            ...DEFAULT_COLLECTION,
            rawInput: v1State.rawInput || "",
            conversations: v1State.conversations || [],
            targetVoiceURI:
              v1State.targetVoiceURI || v1State.targetLanguage || "",
            targetLang: v1State.targetLang || "en-US",
            nativeVoiceURI:
              v1State.nativeVoiceURI || v1State.nativeLanguage || "",
            nativeLang: v1State.nativeLang || "zh-CN",
            playbackSettings: {
              playNative: false,
              includePause: true,
            },
            srsData: {},
          };

          return {
            collections: [migratedCollection],
            activeCollectionId: "default",
          };
        } catch (e) {
          // ignore migration error
        }
      }
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(serialized);

    // Basic validation
    if (!Array.isArray(parsed.collections) || parsed.collections.length === 0) {
      return DEFAULT_STATE;
    }

    // Ensure new fields exist on loaded collections (forward compatibility)
    const collections = parsed.collections.map((c: any) => ({
      ...DEFAULT_COLLECTION,
      ...c,
      // Migrate old format to new playbackSettings structure
      playbackSettings: c.playbackSettings ?? {
        playNative: c.playNative ?? false,
        includePause: c.includePause ?? true,
      },
      // Remove old fields if they exist (cleanup)
      playNative: undefined,
      includePause: undefined,
      srsData: c.srsData || {},
    }));

    return {
      collections,
      activeCollectionId: parsed.activeCollectionId || collections[0].id,
    };
  } catch (error) {
    console.warn("Failed to load state, falling back to default:", error);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save state:", error);
  }
};

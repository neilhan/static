import {
  AppState,
  CollectionProgress,
  DailyProgress,
  SourceId,
  StoredProgressState,
} from "../types";
import { buildSourceCollection, DEFAULT_PROGRESS } from "./curriculum";

export const STORAGE_KEY = "learn-foreign-language-v3";

const SOURCE_IDS: SourceId[] = ["phrases", "vocab"];

export const getLocalDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getYesterdayKey = (dateKey: string): string => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return getLocalDateKey(dt);
};

export const DEFAULT_NEW_CAPS: Record<SourceId, number> = {
  phrases: 4,
  vocab: 10,
};

export const createDefaultDailyProgress = (
  dateKey: string = getLocalDateKey()
): DailyProgress => ({
  date: dateKey,
  reviewed: 0,
  newLearned: 0,
  newLearnedBySource: { phrases: 0, vocab: 0 },
  newCapBySource: { ...DEFAULT_NEW_CAPS },
  dailyGoal: 20,
  streak: 0,
  history: {},
});

const sanitizeNewCap = (val: unknown, fallback: number): number =>
  typeof val === "number" && val >= 0 ? val : fallback;

export const normalizeDailyProgressForToday = (
  raw?: Partial<DailyProgress>,
  todayKey: string = getLocalDateKey()
): DailyProgress => {
  if (!raw) return createDefaultDailyProgress(todayKey);

  const history = raw.history && typeof raw.history === "object" ? raw.history : {};
  const dailyGoal = typeof raw.dailyGoal === "number" && raw.dailyGoal > 0 ? raw.dailyGoal : 20;
  const newCapBySource: Record<SourceId, number> = {
    phrases: sanitizeNewCap(raw.newCapBySource?.phrases, DEFAULT_NEW_CAPS.phrases),
    vocab: sanitizeNewCap(raw.newCapBySource?.vocab, DEFAULT_NEW_CAPS.vocab),
  };

  if (raw.date === todayKey) {
    return {
      date: todayKey,
      reviewed: raw.reviewed ?? 0,
      newLearned: raw.newLearned ?? 0,
      newLearnedBySource: {
        phrases: raw.newLearnedBySource?.phrases ?? 0,
        vocab: raw.newLearnedBySource?.vocab ?? 0,
      },
      newCapBySource,
      dailyGoal,
      streak: raw.streak ?? 0,
      history,
    };
  }

  // Rolled over to a new day: keep streak only if yesterday had reviews
  const yesterdayKey = getYesterdayKey(todayKey);
  const hadYesterday =
    (raw.date === yesterdayKey && (raw.reviewed ?? 0) > 0) ||
    (history[yesterdayKey]?.reviewed ?? 0) > 0;

  return {
    date: todayKey,
    reviewed: 0,
    newLearned: 0,
    newLearnedBySource: { phrases: 0, vocab: 0 },
    newCapBySource,
    dailyGoal,
    streak: hadYesterday ? raw.streak ?? 0 : 0,
    history,
  };
};

export const recordDailyReview = (
  current: DailyProgress,
  isNewItem: boolean,
  todayKey: string = getLocalDateKey(),
  sourceId: SourceId = "phrases",
  countTowardNewCap: boolean = true
): DailyProgress => {
  const normalized = normalizeDailyProgressForToday(current, todayKey);
  const reviewed = normalized.reviewed + 1;
  const countAsNew = isNewItem && countTowardNewCap;
  const newLearned = normalized.newLearned + (countAsNew ? 1 : 0);
  const streak = normalized.reviewed === 0 ? normalized.streak + 1 : normalized.streak;
  const newLearnedBySource = {
    ...normalized.newLearnedBySource,
    [sourceId]:
      (normalized.newLearnedBySource[sourceId] ?? 0) + (countAsNew ? 1 : 0),
  };

  return {
    ...normalized,
    reviewed,
    newLearned,
    newLearnedBySource,
    streak,
    history: {
      ...normalized.history,
      [todayKey]: { reviewed, newLearned },
    },
  };
};

const sanitizeProgress = (raw?: Partial<CollectionProgress>): CollectionProgress => ({
  targetVoiceURI: raw?.targetVoiceURI ?? DEFAULT_PROGRESS.targetVoiceURI,
  targetLang: raw?.targetLang ?? DEFAULT_PROGRESS.targetLang,
  nativeVoiceURI: raw?.nativeVoiceURI ?? DEFAULT_PROGRESS.nativeVoiceURI,
  nativeLang: raw?.nativeLang ?? DEFAULT_PROGRESS.nativeLang,
  playbackSettings: {
    playNative:
      raw?.playbackSettings?.playNative ??
      DEFAULT_PROGRESS.playbackSettings.playNative,
    includePause:
      raw?.playbackSettings?.includePause ??
      DEFAULT_PROGRESS.playbackSettings.includePause,
  },
  srsData: raw?.srsData && typeof raw.srsData === "object" ? raw.srsData : {},
});

export const createDefaultState = (): AppState => ({
  collections: [
    buildSourceCollection("phrases"),
    buildSourceCollection("vocab"),
  ],
  activeCollectionId: "phrases",
  dailyProgress: createDefaultDailyProgress(),
});

export const DEFAULT_STATE: AppState = createDefaultState();

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return createDefaultState();
    }

    const parsed = JSON.parse(serialized) as Partial<StoredProgressState>;
    const activeSourceId: SourceId =
      parsed.activeSourceId === "vocab" ? "vocab" : "phrases";

    const collections = SOURCE_IDS.map((sourceId) =>
      buildSourceCollection(
        sourceId,
        sanitizeProgress(parsed.progress?.[sourceId])
      )
    );

    return {
      collections,
      activeCollectionId: activeSourceId,
      dailyProgress: normalizeDailyProgressForToday(parsed.dailyProgress),
    };
  } catch (error) {
    console.warn("Failed to load state, falling back to default:", error);
    return createDefaultState();
  }
};

export const saveState = (state: AppState): void => {
  try {
    const activeSourceId: SourceId =
      state.activeCollectionId === "vocab" ? "vocab" : "phrases";

    const progress = {} as Record<SourceId, CollectionProgress>;
    for (const sourceId of SOURCE_IDS) {
      const col = state.collections.find((c) => c.id === sourceId);
      progress[sourceId] = sanitizeProgress(
        col
          ? {
              targetVoiceURI: col.targetVoiceURI,
              targetLang: col.targetLang,
              nativeVoiceURI: col.nativeVoiceURI,
              nativeLang: col.nativeLang,
              playbackSettings: col.playbackSettings,
              srsData: col.srsData,
            }
          : undefined
      );
    }

    const payload: StoredProgressState = {
      activeSourceId,
      progress,
      dailyProgress: state.dailyProgress,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save state:", error);
  }
};

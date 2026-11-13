import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./components/CollectionManager.css";
import { loadState, saveState, recordDailyReview } from "./utils/storage";
import { calculateNextReview, markAsWellKnown } from "./utils/srs";
import {
  getSourceItems,
} from "./utils/curriculum";
import { shouldUpdateSrsOnGrade } from "./utils/recall";
import { InputSection, InputSectionRef } from "./components/InputSection";
import { CollectionManager } from "./components/CollectionManager";
import { AppState, ConversationCollection, Conversation, SourceId } from "./types";
import { ActiveRecallCard } from "./components/ActiveRecallCard";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import playIcon from "@static/shared/assets/icons/play.svg?raw";
import pauseIcon from "@static/shared/assets/icons/pause.svg?raw";
import languageIcon from "@static/shared/assets/icons/language.svg?raw";
import shuffleIcon from "@static/shared/assets/icons/shuffle.svg?raw";
import loopIcon from "@static/shared/assets/icons/loop.svg?raw";
import homeIcon from "@static/shared/assets/home.svg?raw";
import { IconGraphic } from "@static/shared";
import { CurrentConversationPanel } from "./components/CurrentConversation";

const shuffleIds = (ids: string[]): string[] =>
  ids
    .map((value) => ({ value, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => entry.value);

const buildQueue = (
  ids: string[],
  startIndex: number,
  randomize: boolean
): string[] => {
  if (ids.length === 0) return [];

  const boundedStart = Math.max(0, Math.min(ids.length - 1, startIndex));

  if (!randomize) {
    return ids.slice(boundedStart);
  }

  const startId = ids[boundedStart];
  const remaining = ids.filter((_, idx) => idx !== boundedStart);
  return [startId, ...shuffleIds(remaining)];
};

const stripLoopedIds = (queue: string[]): string[] => {
  const seen = new Set<string>();
  const trimmed: string[] = [];

  for (const id of queue) {
    if (seen.has(id)) break;
    seen.add(id);
    trimmed.push(id);
  }

  return trimmed;
};

function App() {
  // Initialize state from storage or default
  const [state, setState] = useState<AppState>(() => loadState());
  // Note: We removed 'isPlaying' from destructuring here because we track queue state locally
  const { playConversation, stop, updateSettings, playingId, currentIndex } =
    useAudioPlayer();

  // Queue state for playing multiple conversations sequentially
  const [playQueue, setPlayQueue] = useState<string[]>([]);
  const [isQueuePlaying, setIsQueuePlaying] = useState(false);
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [studyMode, setStudyMode] = useState<"recall" | "listen">("recall");

  const inputSectionRef = useRef<InputSectionRef>(null);

  // Persist state on changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Helper to get active collection
  const activeCollection =
    state.collections.find((c) => c.id === state.activeCollectionId) ||
    state.collections[0];

  // -------------------------------------------------------------------------
  // Editor Handlers
  // -------------------------------------------------------------------------

  const updateActiveCollection = (updates: Partial<ConversationCollection>) => {
    if (!activeCollection) return;

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) =>
        c.id === activeCollection.id ? { ...c, ...updates } : c
      ),
    }));
  };

  const handleTargetChange = (voiceURI: string, lang: string) => {
    updateActiveCollection({ targetVoiceURI: voiceURI, targetLang: lang });
  };

  const handleNativeChange = (voiceURI: string, lang: string) => {
    updateActiveCollection({ nativeVoiceURI: voiceURI, nativeLang: lang });
  };

  const handlePlayNativeChange = (playNative: boolean) => {
    if (!activeCollection) return;
    updateActiveCollection({
      playbackSettings: { ...activeCollection.playbackSettings, playNative },
    });
    // Update playing audio settings in real-time
    updateSettings(playNative, activeCollection.playbackSettings.includePause);
  };

  const handleIncludePauseChange = (includePause: boolean) => {
    if (!activeCollection) return;
    updateActiveCollection({
      playbackSettings: { ...activeCollection.playbackSettings, includePause },
    });
    // Update playing audio settings in real-time
    updateSettings(activeCollection.playbackSettings.playNative, includePause);
  };

  const phrasesCollection =
    state.collections.find((c) => c.id === "phrases") || state.collections[0];
  const vocabCollection =
    state.collections.find((c) => c.id === "vocab") || state.collections[1];

  const getSourceForItem = (itemId: string): SourceId =>
    itemId.startsWith("es-p-") ? "phrases" : "vocab";

  const handleGradeItem = (itemId: string, grade: number) => {
    const sourceId = getSourceForItem(itemId);
    const targetCol = state.collections.find((c) => c.id === sourceId);
    if (!targetCol) return;

    const current = targetCol.srsData[itemId];
    // Protect SRS intervals: extra same-day practice on future-scheduled items
    // does not inflate or reset their scheduled review interval.
    if (!shouldUpdateSrsOnGrade(current)) {
      return;
    }

    const isNewItem = !current || current.repetition === 0;
    const next = calculateNextReview(current, grade);

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) =>
        c.id === sourceId
          ? { ...c, srsData: { ...c.srsData, [itemId]: next } }
          : c
      ),
      dailyProgress: recordDailyReview(
        prev.dailyProgress,
        isNewItem,
        undefined,
        sourceId,
        true
      ),
    }));
  };

  const handleMarkWellKnown = (itemId: string) => {
    const sourceId = getSourceForItem(itemId);
    const next = markAsWellKnown();

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) =>
        c.id === sourceId
          ? { ...c, srsData: { ...c.srsData, [itemId]: next } }
          : c
      ),
      dailyProgress: recordDailyReview(
        prev.dailyProgress,
        false,
        undefined,
        sourceId,
        false
      ),
    }));
  };

  const handleChangeNewCap = (sourceId: SourceId, cap: number) => {
    setState((prev) => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        newCapBySource: {
          ...prev.dailyProgress.newCapBySource,
          [sourceId]: Math.max(0, cap),
        },
      },
    }));
  };

  // -------------------------------------------------------------------------
  // Playback & SRS Queue
  // -------------------------------------------------------------------------

  const stopPlayback = () => {
    stop();
    setPlayQueue([]);
    setIsQueuePlaying(false);
  };

  const playNextInQueue = (queue: string[], startIndex: number = 0) => {
    if (queue.length === 0) {
      if (isLooping && activeCollection) {
        const resetQueue = buildQueue(
          activeCollection.conversations.map((c) => c.id),
          0,
          isRandomOrder
        );

        if (resetQueue.length > 0) {
          playNextInQueue(resetQueue, 0);
          return;
        }
      }

      setIsQueuePlaying(false);
      return;
    }

    const [nextId, ...remainingQueue] = queue;
    const conversation = activeCollection?.conversations.find(
      (c) => c.id === nextId
    );

    if (conversation) {
      setPlayQueue(remainingQueue); // Queue up the rest

      playConversation(
        conversation.id,
        conversation.sentences,
        activeCollection.targetVoiceURI || activeCollection.targetLang,
        activeCollection.nativeVoiceURI || activeCollection.nativeLang,
        activeCollection.playbackSettings.playNative,
        activeCollection.playbackSettings.includePause,
        (completedId) => {
          // 1. Update SRS
          handleConversationComplete(completedId);
          // 2. Play next (start from 0 for subsequent conversations)
          playNextInQueue(remainingQueue, 0);
        },
        undefined, // onIndexChange (unused)
        startIndex // start index for THIS conversation
      );
    } else {
      // Skip if not found (e.g. deleted)
      playNextInQueue(remainingQueue, 0);
    }
  };

  const handleConversationComplete = (conversationId: string) => {
    setState((prevState) => {
      const currentActive = prevState.collections.find(
        (c) => c.id === prevState.activeCollectionId
      );
      if (!currentActive) return prevState;

      const conversation = currentActive.conversations.find(
        (c) => c.id === conversationId
      );
      if (!conversation) return prevState;

      const hash = conversation.contentHash;
      const currentSRS = currentActive.srsData[hash];

      const nextSRS = calculateNextReview(currentSRS, 3); // Implicit 'Pass'

      const updatedCollection = {
        ...currentActive,
        srsData: {
          ...currentActive.srsData,
          [hash]: nextSRS,
        },
      };

      return {
        ...prevState,
        collections: prevState.collections.map((c) =>
          c.id === currentActive.id ? updatedCollection : c
        ),
      };
    });
  };

  const handlePlayCollection = () => {
    if (isQueuePlaying) {
      stopPlayback();
      return;
    }

    if (activeCollection && activeCollection.conversations.length > 0) {
      // Determine start index based on cursor position
      let startConversationIndex = 0;
      let startSentenceIndex = 0;

      const cursorOffset = inputSectionRef.current?.getCursorOffset() ?? 0;

      if (cursorOffset > 0 && activeCollection.rawInput) {
        const raw = activeCollection.rawInput;
        const normalizedRaw = raw.replace(/\r\n/g, "\n");
        const allBlocks = normalizedRaw.split(/\n\s*\n/);

        const textBefore = raw.substring(0, cursorOffset);
        const normalizedBefore = textBefore.replace(/\r\n/g, "\n");
        const blocksBefore = normalizedBefore.split(/\n\s*\n/);

        const rawBlockIndex = blocksBefore.length - 1;

        let validConvIndex = 0;
        for (let i = 0; i < rawBlockIndex; i++) {
          if (allBlocks[i] && allBlocks[i].trim().length > 0) {
            validConvIndex++;
          }
        }

        startConversationIndex = validConvIndex;

        if (
          allBlocks[rawBlockIndex] &&
          allBlocks[rawBlockIndex].trim().length > 0
        ) {
          const linesBefore = normalizedBefore.split("\n");
          // Counting
          const currentLineContent = linesBefore[linesBefore.length - 1];
          const isOnSentence = currentLineContent.trim().length > 0;

          const count = linesBefore.filter((l) => l.trim().length > 0).length;
          const globalIndex = isOnSentence ? count - 1 : count;

          let remaining = globalIndex;
          let found = false;

          for (let c = 0; c < activeCollection.conversations.length; c++) {
            const convLen = activeCollection.conversations[c].sentences.length;
            if (remaining < convLen) {
              startConversationIndex = c;
              startSentenceIndex = remaining;
              found = true;
              break;
            }
            remaining -= convLen;
          }

          if (!found) {
            startConversationIndex = 0;
            startSentenceIndex = 0;
          }
        }
      }

      if (startConversationIndex >= activeCollection.conversations.length) {
        startConversationIndex = 0;
        startSentenceIndex = 0;
      }

      const allIds = activeCollection.conversations.map((c) => c.id);
      const queuedIds = buildQueue(
        allIds,
        startConversationIndex,
        isRandomOrder
      );

      if (queuedIds.length === 0) {
        return;
      }

      setIsQueuePlaying(true);
      playNextInQueue(queuedIds, startSentenceIndex);
    }
  };

  const handleToggleRandomOrder = () => {
    if (isQueuePlaying) {
      stopPlayback();
    }
    setIsRandomOrder((prev) => !prev);
  };

  const adjustQueueForLoopState = (nextLoopState: boolean) => {
    if (!activeCollection || activeCollection.conversations.length === 0) {
      setPlayQueue([]);
      return;
    }

    if (!isQueuePlaying && !playingId) {
      setPlayQueue(
        nextLoopState
          ? buildQueue(
              activeCollection.conversations.map((c) => c.id),
              0,
              isRandomOrder
            )
          : []
      );
      return;
    }

    if (!isQueuePlaying) {
      setPlayQueue([]);
      return;
    }

    const allIds = activeCollection.conversations.map((c) => c.id);
    const baseQueue =
      playQueue.length > 0
        ? stripLoopedIds(playQueue)
        : (() => {
            if (!playingId) return [];
            if (isRandomOrder) {
              const remaining = allIds.filter((id) => id !== playingId);
              return shuffleIds(remaining);
            }
            const currentIdx = allIds.findIndex((id) => id === playingId);
            return currentIdx >= 0
              ? allIds.slice(currentIdx + 1)
              : allIds.slice();
          })();

    if (!nextLoopState) {
      setPlayQueue(baseQueue);
      return;
    }

    const loopCycle = isRandomOrder ? shuffleIds(allIds) : allIds;
    setPlayQueue([...baseQueue, ...loopCycle]);
  };

  const handleToggleLoop = () => {
    const nextLoopState = !isLooping;
    setIsLooping(nextLoopState);
    adjustQueueForLoopState(nextLoopState);
  };

  if (!activeCollection) return <div>Loading...</div>;

  const currentConversation: Conversation | null = playingId
    ? activeCollection.conversations.find((c) => c.id === playingId) ?? null
    : null;

  const currentConversationPosition = currentConversation
    ? activeCollection.conversations.findIndex(
        (c) => c.id === currentConversation.id
      )
    : -1;

  const queuePreview = playQueue.slice(0, 8).map((id) => {
    const idx = activeCollection.conversations.findIndex((c) => c.id === id);
    return {
      id,
      label: idx >= 0 ? `Conversation ${idx + 1}` : "Conversation",
    };
  });

  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <header className="header-row">
          <div className="header-title-group">
            <a
              href="https://neilhan.github.io/static"
              className="home-link"
              title="Back to Home"
            >
              <IconGraphic
                svgMarkup={homeIcon}
                size="md"
                style={{ width: 24, height: 24 }}
              />
            </a>
            <span className="breadcrumb-separator">/</span>
            <span className="header-app-icon">
              <IconGraphic svgMarkup={languageIcon} size="md" />
            </span>
            <h1>Learn Foreign Language</h1>
          </div>
          <div className="header-links">
            {/* Add any other links here if needed */}
          </div>
        </header>

        <main className="app-layout two-column">
          {/* Left Sidebar: Collections */}
          <aside className="panel collection-panel">
            <CollectionManager collections={state.collections} />
          </aside>

          {/* Middle: Editor */}
          <section className="panel editor-panel">
            <div className="editor-header">
              <div className="editor-title-row">
                <h2>
                  {studyMode === "recall"
                    ? "Spanish B1 — Mixed Session"
                    : activeCollection.name}
                </h2>
                <div className="study-mode-switch" role="tablist" aria-label="Study mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={studyMode === "recall"}
                    className={`study-mode-btn ${studyMode === "recall" ? "active" : ""}`}
                    onClick={() => {
                      stopPlayback();
                      setStudyMode("recall");
                    }}
                  >
                    Active Recall
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={studyMode === "listen"}
                    className={`study-mode-btn ${studyMode === "listen" ? "active" : ""}`}
                    onClick={() => setStudyMode("listen")}
                  >
                    Listen & Repeat
                  </button>
                </div>
              </div>
              {studyMode === "listen" && (
              <div className="player-controls-group">
                <div className="player-main-actions">
                  <button
                    className={`btn-queue-mode ${
                      isRandomOrder ? "active" : ""
                    }`}
                    onClick={handleToggleRandomOrder}
                    title="Toggle random playback order"
                    aria-label={
                      isRandomOrder
                        ? "Disable random order"
                        : "Enable random order"
                    }
                    aria-pressed={isRandomOrder}
                  >
                    <IconGraphic svgMarkup={shuffleIcon} size="md" />
                  </button>
                  <button
                    className={`btn-queue-mode ${isLooping ? "active" : ""}`}
                    onClick={handleToggleLoop}
                    title="Loop the collection continuously"
                    aria-label={
                      isLooping ? "Disable looping" : "Enable looping"
                    }
                    aria-pressed={isLooping}
                  >
                    <IconGraphic svgMarkup={loopIcon} size="md" />
                  </button>
                  <button
                    className={`btn-play-large ${
                      isQueuePlaying ? "active" : ""
                    }`}
                    onClick={handlePlayCollection}
                  >
                    <IconGraphic
                      svgMarkup={isQueuePlaying ? pauseIcon : playIcon}
                      size="lg"
                      style={{ color: "white" }}
                    />
                    {isQueuePlaying ? "Stop" : "Play"}
                  </button>
                </div>

                <div className="player-settings">
                  <label
                    className="playback-checkbox-control"
                    title="Pause for the same duration as the spoken text to allow repetition"
                  >
                    <input
                      type="checkbox"
                      checked={activeCollection.playbackSettings.includePause}
                      onChange={(e) =>
                        handleIncludePauseChange(e.target.checked)
                      }
                    />
                    <span>Include pause for repetition</span>
                  </label>

                  <label
                    className="playback-checkbox-control"
                    title="Play native translation after target text"
                  >
                    <input
                      type="checkbox"
                      checked={activeCollection.playbackSettings.playNative}
                      onChange={(e) => handlePlayNativeChange(e.target.checked)}
                    />
                    <span>Include translation</span>
                  </label>
                </div>
              </div>
              )}
            </div>

            {studyMode === "recall" ? (
              <ActiveRecallCard
                phraseItems={getSourceItems("phrases")}
                phraseSrs={phrasesCollection?.srsData ?? {}}
                vocabItems={getSourceItems("vocab")}
                vocabSrs={vocabCollection?.srsData ?? {}}
                phraseNewCap={state.dailyProgress.newCapBySource.phrases ?? 4}
                phraseNewToday={state.dailyProgress.newLearnedBySource.phrases ?? 0}
                vocabNewCap={state.dailyProgress.newCapBySource.vocab ?? 10}
                vocabNewToday={state.dailyProgress.newLearnedBySource.vocab ?? 0}
                targetLang={activeCollection.targetLang}
                targetVoiceURI={activeCollection.targetVoiceURI}
                nativeLang={activeCollection.nativeLang}
                nativeVoiceURI={activeCollection.nativeVoiceURI}
                onGradeItem={handleGradeItem}
                onMarkWellKnown={handleMarkWellKnown}
                onChangeNewCap={handleChangeNewCap}
              />
            ) : (
              <CurrentConversationPanel
                conversation={currentConversation}
                currentSentenceIndex={currentConversation ? currentIndex : -1}
                conversationPosition={currentConversationPosition}
                totalConversations={activeCollection.conversations.length}
                queuePreview={queuePreview}
                isRandomOrder={isRandomOrder}
                isPlaying={isQueuePlaying}
              />
            )}

            <InputSection
              ref={inputSectionRef}
              targetVoiceURI={activeCollection.targetVoiceURI}
              onTargetChange={handleTargetChange}
              nativeVoiceURI={activeCollection.nativeVoiceURI}
              onNativeChange={handleNativeChange}
            />
          </section>
        </main>

        <footer className="footer">
          <p>Learn Foreign Language App</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

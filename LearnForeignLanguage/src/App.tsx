import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./components/CollectionManager.css";
import { loadState, saveState } from "./utils/storage";
import { parseInput } from "./utils/parser";
import { calculateNextReview } from "./utils/srs";
import { InputSection, InputSectionRef } from "./components/InputSection";
import { CollectionManager } from "./components/CollectionManager";
import { AppState, ConversationCollection, Conversation } from "./types";
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
  // Collection Handlers
  // -------------------------------------------------------------------------

  const handleSelectCollection = (id: string) => {
    stopPlayback();
    setState((prev) => ({ ...prev, activeCollectionId: id }));
  };

  const handleCreateCollection = (name: string) => {
    const newCollection: ConversationCollection = {
      id: `col-${Date.now()}`,
      name,
      rawInput: "",
      conversations: [],
      targetVoiceURI: "",
      targetLang: "en-US",
      nativeVoiceURI: "",
      nativeLang: "zh-CN",
      playbackSettings: {
        playNative: false,
        includePause: true,
      },
      srsData: {},
    };

    setState((prev) => ({
      ...prev,
      collections: [...prev.collections, newCollection],
      activeCollectionId: newCollection.id,
    }));
  };

  const handleDeleteCollection = (id: string) => {
    setState((prev) => {
      const newCollections = prev.collections.filter((c) => c.id !== id);
      let newActiveId = prev.activeCollectionId;
      if (id === prev.activeCollectionId) {
        newActiveId = newCollections.length > 0 ? newCollections[0].id : null;
      }

      if (newCollections.length === 0) {
        return {
          collections: [
            {
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
                includePause: true,
              },
              srsData: {},
            },
          ],
          activeCollectionId: "default",
        };
      }

      return {
        ...prev,
        collections: newCollections,
        activeCollectionId: newActiveId,
      };
    });
  };

  const handleRenameCollection = (id: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) =>
        c.id === id ? { ...c, name: newName } : c
      ),
    }));
  };

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

  const handleInputChange = (rawInput: string) => {
    const conversations = parseInput(rawInput);
    updateActiveCollection({ rawInput, conversations });
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

  // Calculate offset for current sentence index in the WHOLE text area
  let globalSentenceIndex = -1;
  if (playingId && currentIndex >= 0) {
    let offset = 0;
    for (const conv of activeCollection.conversations) {
      if (conv.id === playingId) {
        globalSentenceIndex = offset + currentIndex;
        break;
      }
      offset += conv.sentences.length;
    }
  }

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
            <CollectionManager
              collections={state.collections}
              activeCollectionId={state.activeCollectionId}
              onSelectCollection={handleSelectCollection}
              onCreateCollection={handleCreateCollection}
              onDeleteCollection={handleDeleteCollection}
              onRenameCollection={handleRenameCollection}
            />
          </aside>

          {/* Middle: Editor */}
          <section className="panel editor-panel">
            <div
              className="editor-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                gap: "1rem",
              }}
            >
              <h2>{activeCollection.name}</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
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

                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <label
                    className="playback-checkbox-control"
                    title="Pause for the same duration as the spoken text to allow repetition"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activeCollection.playbackSettings.includePause}
                      onChange={(e) =>
                        handleIncludePauseChange(e.target.checked)
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span>Include pause for repetition</span>
                  </label>

                  <label
                    className="playback-checkbox-control"
                    title="Play native translation after target text"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={activeCollection.playbackSettings.playNative}
                      onChange={(e) => handlePlayNativeChange(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                    <span>Include translation</span>
                  </label>
                </div>
              </div>
            </div>

            <CurrentConversationPanel
              conversation={currentConversation}
              currentSentenceIndex={currentConversation ? currentIndex : -1}
              conversationPosition={currentConversationPosition}
              totalConversations={activeCollection.conversations.length}
              queuePreview={queuePreview}
              isRandomOrder={isRandomOrder}
              isPlaying={isQueuePlaying}
            />

            <InputSection
              ref={inputSectionRef}
              rawInput={activeCollection.rawInput}
              onInputChange={handleInputChange}
              targetVoiceURI={activeCollection.targetVoiceURI}
              onTargetChange={handleTargetChange}
              nativeVoiceURI={activeCollection.nativeVoiceURI}
              onNativeChange={handleNativeChange}
              isPlaying={isQueuePlaying}
              currentSentenceIndex={globalSentenceIndex}
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

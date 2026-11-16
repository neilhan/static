import { useState, useEffect } from "react";
import "./App.css";
import "./components/CollectionManager.css";
import { loadState, saveState, recordDailyReview, createDefaultState } from "./utils/storage";
import { calculateNextReview, markAsIntroduced, markAsWellKnown } from "./utils/srs";
import { getItemSourceId, getSourceItems } from "./utils/curriculum";
import { shouldUpdateSrsOnGrade } from "./utils/recall";
import { InputSection } from "./components/InputSection";
import { CollectionManager } from "./components/CollectionManager";
import { AppState, ConversationCollection, SourceId } from "./types";
import { ActiveRecallCard } from "./components/ActiveRecallCard";
import languageIcon from "@static/shared/assets/icons/language.svg?raw";
import homeIcon from "@static/shared/assets/home.svg?raw";
import { IconGraphic } from "@static/shared";

function App() {
  // Initialize state from storage or default
  const [state, setState] = useState<AppState>(() => loadState());
  const [resetVersion, setResetVersion] = useState(0);

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

  const phrasesCollection =
    state.collections.find((c) => c.id === "phrases") || state.collections[0];
  const vocabCollection =
    state.collections.find((c) => c.id === "vocab") || state.collections[1];

  const getSourceForItem = (itemId: string): SourceId | undefined =>
    getItemSourceId(itemId);

  const handleGradeItem = (itemId: string, grade: number) => {
    const sourceId = getSourceForItem(itemId);
    if (!sourceId) return;
    const targetCol = state.collections.find((c) => c.id === sourceId);
    if (!targetCol) return;

    const current = targetCol.srsData[itemId];
    // Protect SRS intervals: extra same-day practice on future-scheduled items
    // does not inflate or reset their scheduled review interval.
    if (!shouldUpdateSrsOnGrade(current, grade)) {
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
    if (!sourceId) return;
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

  const handleIntroduceItems = (itemIds: string[]) => {
    if (itemIds.length === 0) return;
    const now = Date.now();

    setState((prev) => {
      const additionsBySource: Record<SourceId, Record<string, ReturnType<typeof markAsIntroduced>>> = {
        phrases: {},
        vocab: {},
      };

      for (const itemId of itemIds) {
        const sourceId = getSourceForItem(itemId);
        if (!sourceId) continue;
        const col = prev.collections.find((c) => c.id === sourceId);
        if (!col?.srsData[itemId]) {
          additionsBySource[sourceId][itemId] = markAsIntroduced(now);
        }
      }

      return {
        ...prev,
        collections: prev.collections.map((c) => {
          const additions = additionsBySource[c.id as SourceId];
          if (!additions || Object.keys(additions).length === 0) return c;
          return { ...c, srsData: { ...c.srsData, ...additions } };
        }),
      };
    });
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

  const handleResetAll = () => {
    setState(createDefaultState());
    setResetVersion((v) => v + 1);
  };

  if (!activeCollection) return <div>Loading...</div>;

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

          {/* Middle: Active Recall */}
          <section className="panel editor-panel">
            <div className="editor-header">
              <div className="editor-title-row">
                <h2>Spanish B1</h2>
              </div>
            </div>

            <ActiveRecallCard
              key={resetVersion}
              phraseItems={getSourceItems("phrases")}
              phraseSrs={phrasesCollection?.srsData ?? {}}
              vocabItems={getSourceItems("vocab")}
              vocabSrs={vocabCollection?.srsData ?? {}}
              phraseNewCap={state.dailyProgress.newCapBySource.phrases ?? 2}
              phraseNewToday={state.dailyProgress.newLearnedBySource.phrases ?? 0}
              vocabNewCap={state.dailyProgress.newCapBySource.vocab ?? 12}
              vocabNewToday={state.dailyProgress.newLearnedBySource.vocab ?? 0}
              targetLang={activeCollection.targetLang}
              targetVoiceURI={activeCollection.targetVoiceURI}
              nativeLang={activeCollection.nativeLang}
              nativeVoiceURI={activeCollection.nativeVoiceURI}
              onGradeItem={handleGradeItem}
              onMarkWellKnown={handleMarkWellKnown}
              onIntroduceItems={handleIntroduceItems}
              onChangeNewCap={handleChangeNewCap}
              onResetAll={handleResetAll}
              voiceControls={
                <InputSection
                  targetVoiceURI={activeCollection.targetVoiceURI}
                  onTargetChange={handleTargetChange}
                  nativeVoiceURI={activeCollection.nativeVoiceURI}
                  onNativeChange={handleNativeChange}
                />
              }
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

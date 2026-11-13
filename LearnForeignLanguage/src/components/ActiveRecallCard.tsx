import React, { useEffect, useMemo, useState } from 'react';
import { SourceId, SRSData, VocabItem } from '../types';
import { calculateNextReview, getReviewStatus } from '../utils/srs';
import {
  buildMixedRecallQueue,
  checkTypedRecall,
  formatFormEntries,
  RecallFilter,
  RecallMatchResult,
  selectSmartReviewBatch,
  SESSION_SIZE,
} from '../utils/recall';
import './ActiveRecallCard.css';

interface ActiveRecallCardProps {
  phraseItems: VocabItem[];
  phraseSrs: Record<string, SRSData>;
  vocabItems: VocabItem[];
  vocabSrs: Record<string, SRSData>;
  phraseNewCap: number;
  phraseNewToday: number;
  vocabNewCap: number;
  vocabNewToday: number;
  targetLang: string;
  targetVoiceURI: string;
  nativeLang: string;
  nativeVoiceURI: string;
  onGradeItem: (itemId: string, grade: number) => void;
  onMarkWellKnown: (itemId: string) => void;
  onChangeNewCap: (sourceId: SourceId, cap: number) => void;
}

const PHRASE_CAP_OPTIONS = [0, 2, 4, 6, 10];
const VOCAB_CAP_OPTIONS = [0, 5, 10, 15, 20];

const speakText = (
  text: string,
  lang: string,
  voiceURI: string,
  forcePrefix?: string
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const prefix = (forcePrefix || lang.split('-')[0]).toLowerCase();

  const matchingVoiceURI = voices.find(
    (v) =>
      v.voiceURI === voiceURI &&
      (!forcePrefix || v.lang.toLowerCase().startsWith(prefix))
  );
  const selected =
    matchingVoiceURI ||
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix));

  if (selected) {
    utterance.voice = selected;
    utterance.lang = selected.lang;
  } else {
    utterance.lang =
      forcePrefix && !lang.toLowerCase().startsWith(prefix) ? 'es-ES' : lang;
  }
  synth.speak(utterance);
};

export const ActiveRecallCard: React.FC<ActiveRecallCardProps> = ({
  phraseItems,
  phraseSrs,
  vocabItems,
  vocabSrs,
  phraseNewCap,
  phraseNewToday,
  vocabNewCap,
  vocabNewToday,
  targetLang,
  targetVoiceURI,
  nativeLang,
  nativeVoiceURI,
  onGradeItem,
  onMarkWellKnown,
  onChangeNewCap,
}) => {
  const [filter, setFilter] = useState<RecallFilter>('due-and-new');
  const [direction, setDirection] = useState<'native-to-target' | 'target-to-native'>(
    'native-to-target'
  );
  const [typedMode, setTypedMode] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [guess, setGuess] = useState('');
  const [matchResult, setMatchResult] = useState<RecallMatchResult | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [extraPhraseNew, setExtraPhraseNew] = useState(0);
  const [extraVocabNew, setExtraVocabNew] = useState(0);
  const [reviewedCycleIds, setReviewedCycleIds] = useState<string[]>([]);

  const remainingPhraseCap = Math.max(0, phraseNewCap + extraPhraseNew - phraseNewToday);
  const remainingVocabCap = Math.max(0, vocabNewCap + extraVocabNew - vocabNewToday);

  const itemMap = useMemo(() => {
    const map = new Map<string, VocabItem>();
    for (const item of phraseItems) map.set(item.id, item);
    for (const item of vocabItems) map.set(item.id, item);
    return map;
  }, [phraseItems, vocabItems]);

  const todayPool = useMemo(
    () =>
      buildMixedRecallQueue(
        phraseItems,
        phraseSrs,
        vocabItems,
        vocabSrs,
        'due-and-new',
        remainingPhraseCap,
        remainingVocabCap
      ),
    [
      phraseItems,
      phraseSrs,
      vocabItems,
      vocabSrs,
      remainingPhraseCap,
      remainingVocabCap,
    ]
  );

  const reviewPool = useMemo(
    () =>
      buildMixedRecallQueue(
        phraseItems,
        phraseSrs,
        vocabItems,
        vocabSrs,
        'review'
      ),
    [phraseItems, phraseSrs, vocabItems, vocabSrs]
  );

  const allPool = useMemo(
    () =>
      buildMixedRecallQueue(
        phraseItems,
        phraseSrs,
        vocabItems,
        vocabSrs,
        'all'
      ),
    [phraseItems, phraseSrs, vocabItems, vocabSrs]
  );

  const [sessionIds, setSessionIds] = useState<string[]>(() =>
    todayPool.slice(0, SESSION_SIZE).map((i) => i.id)
  );
  const [sessionTotal, setSessionTotal] = useState<number>(() =>
    Math.min(SESSION_SIZE, todayPool.length)
  );

  const queue = useMemo(() => {
    if (filter === 'all') return allPool;
    return sessionIds
      .map((id) => itemMap.get(id))
      .filter((x): x is VocabItem => Boolean(x));
  }, [filter, allPool, sessionIds, itemMap]);

  const totalCount = phraseItems.length + vocabItems.length;
  const safeIndex = queue.length > 0 ? Math.min(cardIndex, queue.length - 1) : 0;
  const currentItem = queue[safeIndex] ?? null;

  const speakSpanish = (text: string) => {
    speakText(text, targetLang, targetVoiceURI, 'es');
  };

  useEffect(() => {
    setIsRevealed(false);
    setShowHint(false);
    setGuess('');
    setMatchResult(null);
    if (autoRead && currentItem && direction === 'target-to-native') {
      speakSpanish(currentItem.target);
    }
  }, [currentItem?.id, direction]);

  const startTodaySession = (pool = todayPool) => {
    const nextIds = pool.slice(0, SESSION_SIZE).map((i) => i.id);
    setSessionIds(nextIds);
    setSessionTotal(nextIds.length);
    setCardIndex(0);
    setFilter('due-and-new');
  };

  const startRandomReview = () => {
    const getSrs = (id: string) => (id.startsWith('es-p-') ? phraseSrs[id] : vocabSrs[id]);
    const batch = selectSmartReviewBatch(
      reviewPool,
      getSrs,
      new Set(reviewedCycleIds),
      SESSION_SIZE
    );
    if (batch.resetCycle) {
      setReviewedCycleIds([]);
    }
    const nextIds = batch.items.map((i) => i.id);
    setSessionIds(nextIds);
    setSessionTotal(nextIds.length);
    setCardIndex(0);
    setFilter('review');
  };

  const handleReveal = () => {
    setIsRevealed(true);
    if (autoRead && currentItem) {
      speakSpanish(currentItem.target);
    }
  };

  const handleCheckTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    const expected =
      direction === 'native-to-target' ? currentItem.target : currentItem.native;
    const result = checkTypedRecall(guess, expected);
    setMatchResult(result);
    if (result !== 'mismatch') {
      setIsRevealed(true);
      if (autoRead) {
        speakSpanish(currentItem.target);
      }
    }
  };

  const completeSessionItem = (id: string) => {
    const nextLen = Math.max(0, sessionIds.length - 1);
    setSessionIds((prev) => prev.filter((x) => x !== id));
    setCardIndex((prev) => (nextLen === 0 ? 0 : Math.min(prev, nextLen - 1)));
  };

  const handlePrev = () => {
    if (queue.length === 0) return;
    setCardIndex((prev) => (prev - 1 + queue.length) % queue.length);
  };

  const handleSkip = () => {
    if (!currentItem) return;
    if (filter === 'all') {
      setCardIndex((prev) => (prev + 1) % queue.length);
      return;
    }
    completeSessionItem(currentItem.id);
  };

  const handleGrade = (grade: number) => {
    if (!currentItem) return;
    const gradedId = currentItem.id;
    onGradeItem(gradedId, grade);

    if (filter === 'all') {
      if (grade < 3 && queue.length > 1) {
        setCardIndex((prev) => (prev + 1) % queue.length);
      } else if (grade >= 3) {
        setCardIndex((prev) => (prev + 1 < queue.length ? prev + 1 : 0));
      }
      return;
    }

    if (grade < 3) {
      setSessionIds((prev) => {
        const rest = prev.filter((id) => id !== gradedId);
        return [...rest, gradedId];
      });
      if (sessionIds.length > 1 && safeIndex >= sessionIds.length - 1) {
        setCardIndex(0);
      }
    } else {
      if (filter === 'review') {
        setReviewedCycleIds((prev) =>
          prev.includes(gradedId) ? prev : [...prev, gradedId]
        );
      }
      completeSessionItem(gradedId);
    }
  };

  const handleWellKnown = () => {
    if (!currentItem) return;
    const id = currentItem.id;
    onMarkWellKnown(id);
    if (filter !== 'all') {
      completeSessionItem(id);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!currentItem) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) {
          setIsRevealed(true);
          if (autoRead) {
            speakSpanish(currentItem.target);
          }
        } else {
          speakSpanish(currentItem.target);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCardIndex((prev) => (prev - 1 + queue.length) % queue.length);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip();
      } else if (isRevealed) {
        if (e.key === '1') handleGrade(1);
        else if (e.key === '2') handleGrade(4);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRevealed, currentItem, autoRead, targetLang, targetVoiceURI, queue.length, filter, safeIndex, sessionIds]);

  const currentSrs = currentItem
    ? currentItem.id.startsWith('es-p-')
      ? phraseSrs[currentItem.id]
      : vocabSrs[currentItem.id]
    : undefined;
  const status = currentSrs ? getReviewStatus(currentSrs.nextReview) : 'new';
  const daysUntilDue =
    status === 'future' && currentSrs
      ? Math.max(1, Math.ceil((currentSrs.nextReview - Date.now()) / (24 * 60 * 60 * 1000)))
      : 0;
  const statusLabel = status === 'future' ? `In ${daysUntilDue}d` : status;
  const formEntries = useMemo(
    () => (currentItem ? formatFormEntries(currentItem.forms) : []),
    [currentItem]
  );

  const gradeOptions = [
    { label: 'Need More Practice', grade: 1, cls: 'grade-again' },
    { label: 'I Know It', grade: 4, cls: 'grade-good' },
  ].map((opt) => ({
    ...opt,
    intervalText:
      status === 'future'
        ? opt.grade === 1
          ? 'practice again'
          : `keep ${daysUntilDue}d`
        : `${calculateNextReview(currentSrs, opt.grade).interval}d`,
  }));

  const learnedCount = useMemo(
    () =>
      Object.values(phraseSrs).filter((s) => s.repetition > 0).length +
      Object.values(vocabSrs).filter((s) => s.repetition > 0).length,
    [phraseSrs, vocabSrs]
  );

  const unreviewedInCycle = useMemo(
    () => reviewPool.filter((i) => !reviewedCycleIds.includes(i.id)).length,
    [reviewPool, reviewedCycleIds]
  );
  const nextReviewBatchCount = Math.min(
    SESSION_SIZE,
    unreviewedInCycle > 0 ? unreviewedInCycle : reviewPool.length
  );

  const todayCount = todayPool.length;

  const handleIntroNewSet = () => {
    const nextPhraseCap = remainingPhraseCap + 3;
    const nextVocabCap = remainingVocabCap + 5;
    setExtraPhraseNew((c) => c + 3);
    setExtraVocabNew((c) => c + 5);
    const nextPool = buildMixedRecallQueue(
      phraseItems,
      phraseSrs,
      vocabItems,
      vocabSrs,
      'due-and-new',
      nextPhraseCap,
      nextVocabCap
    );
    startTodaySession(nextPool);
  };

  const renderSessionEndActions = () => {
    const hasToday = todayPool.length > 0;
    const hasReview = learnedCount > 0;
    const todayIsPrimary = filter === 'due-and-new' && hasToday;
    const reviewIsPrimary = !todayIsPrimary && hasReview;

    return (
      <div className="recall-empty-actions">
        {hasToday && (
          <button
            type="button"
            className={todayIsPrimary ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            onClick={() => startTodaySession()}
          >
            Next Today Session ({Math.min(SESSION_SIZE, todayPool.length)})
          </button>
        )}
        {hasReview && (
          <button
            type="button"
            className={reviewIsPrimary ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            onClick={startRandomReview}
            title="Review learned items using weighted priority (weakest, due soonest, and random refresh)"
          >
            Continue Reviewing ({nextReviewBatchCount})
          </button>
        )}
        <button
          type="button"
          className={!todayIsPrimary && !reviewIsPrimary ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
          title="Add 3 new phrases and 5 new words to today's learning progress"
          onClick={handleIntroNewSet}
        >
          Intro New Set
        </button>
      </div>
    );
  };

  return (
    <section className="recall-panel">
      <div className="recall-toolbar">
        <div className="recall-toolbar-group">
          <button
            className={`recall-pill ${direction === 'native-to-target' ? 'active' : ''}`}
            onClick={() =>
              setDirection((d) =>
                d === 'native-to-target' ? 'target-to-native' : 'native-to-target'
              )
            }
            title="Switch prompt direction"
          >
            {direction === 'native-to-target' ? 'English → Spanish' : 'Spanish → English'}
          </button>
          <button
            className={`recall-pill ${typedMode ? 'active' : ''}`}
            onClick={() => setTypedMode((v) => !v)}
          >
            {typedMode ? 'Typing: On' : 'Typing: Off'}
          </button>
          <button
            className={`recall-pill ${autoRead ? 'active' : ''}`}
            onClick={() => {
              const next = !autoRead;
              setAutoRead(next);
              if (next && currentItem && (isRevealed || direction === 'target-to-native')) {
                speakSpanish(currentItem.target);
              }
            }}
            title="Automatically speak Spanish when revealing the answer"
          >
            {autoRead ? '🔊 Auto-read: On' : '🔇 Auto-read: Off'}
          </button>
        </div>

        <div className="recall-toolbar-group">
          <label className="recall-cap-control" title="New phrases per day">
            <span>Phrases: {phraseNewToday}/{phraseNewCap}</span>
            <select
              className="recall-cap-select"
              value={phraseNewCap}
              onChange={(e) => onChangeNewCap('phrases', Number(e.target.value))}
            >
              {PHRASE_CAP_OPTIONS.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}/d
                </option>
              ))}
            </select>
          </label>
          <label className="recall-cap-control" title="New words per day">
            <span>Words: {vocabNewToday}/{vocabNewCap}</span>
            <select
              className="recall-cap-select"
              value={vocabNewCap}
              onChange={(e) => onChangeNewCap('vocab', Number(e.target.value))}
            >
              {VOCAB_CAP_OPTIONS.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}/d
                </option>
              ))}
            </select>
          </label>
          <button
            className={`recall-pill ${filter === 'due-and-new' ? 'active' : ''}`}
            onClick={() => {
              if (filter !== 'due-and-new') {
                startTodaySession();
              }
            }}
          >
            Today ({todayCount})
          </button>
          <button
            className={`recall-pill ${filter === 'review' ? 'active' : ''}`}
            onClick={startRandomReview}
            disabled={learnedCount === 0}
            title="Review items you have already started learning in random order"
          >
            Review ({learnedCount})
          </button>
          <button
            className={`recall-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setCardIndex(0);
              setFilter('all');
            }}
          >
            All ({totalCount})
          </button>
        </div>
      </div>

      {!currentItem ? (
        <div className="recall-empty">
          {filter === 'review' ? (
            learnedCount === 0 ? (
              <>
                <h3>No learned items yet!</h3>
                <p>Study a few items in Today first, then come back here to review them.</p>
              </>
            ) : (
              <>
                <h3>Review session complete!</h3>
                <p>
                  You finished a {sessionTotal}-item review round ({learnedCount} learned items
                  available).
                </p>
                {renderSessionEndActions()}
              </>
            )
          ) : todayPool.length > 0 ? (
            <>
              <h3>Session complete!</h3>
              <p>
                Great work! You have {todayPool.length} more{' '}
                {todayPool.length === 1 ? 'item' : 'items'} queued for today.
              </p>
              {renderSessionEndActions()}
            </>
          ) : (
            <>
              <h3>Daily goal complete!</h3>
              <p>
                You've cleared all due reviews and reached today's new limits ({phraseNewCap}{' '}
                phrases, {vocabNewCap} words).
              </p>
              {renderSessionEndActions()}
            </>
          )}
        </div>
      ) : (
        <div className="recall-card">
          <div className="recall-card-meta">
            <span className={`recall-status-badge status-${status}`}>{statusLabel}</span>
            <span className="recall-meta-tag">
              {currentItem.id.startsWith('es-p-') ? 'Phrase' : 'Word'}
            </span>
            {currentItem.rank && (
              <span className="recall-meta-tag">#{currentItem.rank}</span>
            )}
            {currentItem.pos && currentItem.pos !== 'phrase' && (
              <span className="recall-meta-tag">{currentItem.pos}</span>
            )}
            {currentItem.category && (
              <span className="recall-meta-tag">{currentItem.category}</span>
            )}
            {status === 'new' && (
              <button
                type="button"
                className="recall-known-btn"
                onClick={handleWellKnown}
                title="Mark as already known (schedules 21d out without using a daily new slot)"
              >
                Already Know ✓
              </button>
            )}
            <span className="recall-queue-count">
              {filter === 'all'
                ? `${safeIndex + 1} / ${queue.length}`
                : `${Math.min(
                    sessionTotal,
                    Math.max(1, sessionTotal - queue.length + safeIndex + 1)
                  )} / ${sessionTotal}`}
            </span>
          </div>

          <div className="recall-prompt-block">
            <div className="recall-prompt-label">
              {direction === 'native-to-target' ? 'Recall in Spanish' : 'Recall in English'}
            </div>
            <div className="recall-prompt-text">
              {direction === 'native-to-target' ? currentItem.native : currentItem.target}
            </div>
            <button
              type="button"
              className="btn-outline btn-sm recall-speak-btn"
              onClick={() =>
                direction === 'native-to-target'
                  ? speakText(currentItem.native, nativeLang, nativeVoiceURI, 'en')
                  : speakSpanish(currentItem.target)
              }
            >
              🔊 Speak Prompt
            </button>
          </div>

          {currentItem.note && !isRevealed && (
            <div className="recall-hint-row">
              {showHint ? (
                <p className="recall-note-text">💡 {currentItem.note}</p>
              ) : (
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  onClick={() => setShowHint(true)}
                >
                  Show Hint
                </button>
              )}
            </div>
          )}

          {typedMode && !isRevealed && (
            <form className="recall-type-form" onSubmit={handleCheckTyped}>
              <input
                type="text"
                className="recall-type-input"
                placeholder={
                  direction === 'native-to-target'
                    ? 'Type the Spanish word or phrase...'
                    : 'Type the English meaning...'
                }
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value);
                  setMatchResult(null);
                }}
                autoFocus
              />
              <button type="submit" className="btn-primary btn-sm">
                Check
              </button>
            </form>
          )}

          {matchResult && (
            <div className={`recall-match-feedback match-${matchResult}`}>
              {matchResult === 'exact' && '✓ Exact match!'}
              {matchResult === 'accent-diff' && '✓ Correct! (Watch the accent marks)'}
              {matchResult === 'mismatch' && 'Not quite — try again or reveal.'}
            </div>
          )}

          <div className="recall-answer-block">
            {!isRevealed ? (
              <div className="recall-hidden-answer" onClick={handleReveal}>
                <span className="recall-blur-preview">
                  {direction === 'native-to-target' ? currentItem.target : currentItem.native}
                </span>
                <button type="button" className="btn-primary">
                  Reveal Answer (Space)
                </button>
              </div>
            ) : (
              <div className="recall-revealed">
                <div className="recall-answer-row">
                  <span className="recall-answer-text">
                    {direction === 'native-to-target'
                      ? currentItem.target
                      : currentItem.native}
                  </span>
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={() => speakSpanish(currentItem.target)}
                  >
                    🔊 Listen / Replay
                  </button>
                </div>

                {currentItem.note && (
                  <p className="recall-note-text">💡 {currentItem.note}</p>
                )}

                {formEntries.length > 0 && (
                  <div className="recall-forms-section">
                    <div className="recall-forms-label">
                      Variations (tap to hear):
                    </div>
                    <div className="recall-forms-grid">
                      {formEntries.map((entry) => (
                        <button
                          key={`${entry.label}-${entry.value}`}
                          type="button"
                          className="recall-form-chip"
                          onClick={() => speakSpanish(entry.value)}
                          title={`Listen to "${entry.value}"`}
                        >
                          <span className="recall-form-key">{entry.label}</span>
                          <span className="recall-form-val">{entry.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isRevealed && (
            <div className="recall-grade-bar">
              {gradeOptions.map((opt, idx) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`recall-grade-btn ${opt.cls}`}
                  onClick={() => handleGrade(opt.grade)}
                >
                  <span className="grade-label">
                    {opt.label} <kbd className="grade-kbd">{idx + 1}</kbd>
                  </span>
                  <span className="grade-interval">{opt.intervalText}</span>
                </button>
              ))}
            </div>
          )}

          <div className="recall-nav-row">
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={handlePrev}
              disabled={queue.length <= 1}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={handleSkip}
              disabled={filter === 'all' && queue.length <= 1}
            >
              Skip →
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

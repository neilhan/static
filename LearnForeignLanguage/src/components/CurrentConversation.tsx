import { useEffect, useRef } from 'react';
import { Conversation } from '../types';
import './CurrentConversation.css';

interface QueuePreviewItem {
  id: string;
  label: string;
}

interface CurrentConversationPanelProps {
  conversation: Conversation | null;
  currentSentenceIndex: number;
  conversationPosition: number;
  totalConversations: number;
  queuePreview: QueuePreviewItem[];
  isRandomOrder: boolean;
  isPlaying: boolean;
}

export const CurrentConversationPanel = ({
  conversation,
  currentSentenceIndex,
  conversationPosition,
  totalConversations,
  queuePreview,
  isRandomOrder,
  isPlaying,
}: CurrentConversationPanelProps) => {
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeConversationId = conversation?.id ?? null;

  useEffect(() => {
    sentenceRefs.current = [];
  }, [activeConversationId]);

  useEffect(() => {
    if (!isPlaying || currentSentenceIndex < 0 || !activeConversationId) {
      return;
    }

    const node = sentenceRefs.current[currentSentenceIndex];
    node?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [currentSentenceIndex, isPlaying, activeConversationId]);

  const hasConversation = Boolean(conversation);

  return (
    <section className="current-conversation-panel">
      <header className="current-conversation-panel__header">
        <div className="current-conversation-panel__title">
          <span>Current Conversation</span>
          {hasConversation && conversationPosition >= 0 ? (
            <strong>
              Conversation {conversationPosition + 1} of {totalConversations}
            </strong>
          ) : (
            <span className="current-conversation-panel__status">
              {isPlaying ? 'Preparing next audio…' : 'Idle'}
            </span>
          )}
        </div>
        <span
          className={`queue-mode-tag ${
            isRandomOrder ? 'queue-mode-tag--active' : ''
          }`}
        >
          {isRandomOrder ? 'Random order' : 'Sequential order'}
        </span>
      </header>

      {hasConversation && conversation ? (
        <div className="current-conversation-panel__sentences">
          {conversation.sentences.map((sentence, idx) => {
            const isActive = idx === currentSentenceIndex;
            return (
              <div
                key={`${conversation.id}-${idx}`}
                ref={node => {
                  sentenceRefs.current[idx] = node;
                }}
                className={`sentence-row ${isActive ? 'sentence-row--active' : ''}`}
              >
                <div className="sentence-target" aria-label="Target sentence">
                  {sentence.target || '—'}
                </div>
                {sentence.native && (
                  <div
                    className="sentence-native"
                    aria-label="Native translation"
                  >
                    {sentence.native}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="current-conversation-panel__placeholder">
          Press play to start listening. The sentence currently being read will
          appear here.
        </p>
      )}

      {queuePreview.length > 0 && (
        <div className="current-conversation-panel__queue">
          <span className="queue-label">Up next</span>
          <div className="queue-chips">
            {queuePreview.map(item => (
              <span className="queue-chip" key={item.id}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};


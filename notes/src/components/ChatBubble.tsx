import React, { useRef, useState } from 'react';
import { GeminiToolExecutor, runGeminiTurn, speakText } from '../ai/gemini';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mutated?: boolean;
  audioBlob?: Blob;
};

type ChatBubbleProps = {
  apiKey: string;
  model: string;
  todayStr: string;
  isOnline: boolean;
  executor: GeminiToolExecutor;
  onSnapshotBeforeMutate: () => void;
  onUndoLastAi: () => void;
  canUndo: boolean;
};

const SUGGESTIONS = [
  "What's on today?",
  'Show overdue items',
  'Search my notes',
  'Add a reminder for tomorrow',
];

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  apiKey,
  model,
  todayStr,
  isOnline,
  executor,
  onSnapshotBeforeMutate,
  onUndoLastAi,
  canUndo,
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geminiHistoryRef = useRef<any[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sendTurn = async (opts: { text?: string; audioBlob?: Blob; fromVoice?: boolean }) => {
    if (!isOnline) {
      setError('Chat requires an internet connection.');
      return;
    }
    if (!apiKey.trim()) {
      setError('Add your Gemini API key in Settings first.');
      return;
    }

    setError(null);
    setPending(true);
    onSnapshotBeforeMutate();

    const userDisplay = opts.text?.trim() || '🎤 Voice message';
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-u`,
        role: 'user',
        text: userDisplay,
        audioBlob: opts.audioBlob,
      },
    ]);

    try {
      const res = await runGeminiTurn({
        apiKey,
        model,
        todayStr,
        history: geminiHistoryRef.current,
        userText: opts.text,
        audioBlob: opts.audioBlob,
        executor,
      });
      geminiHistoryRef.current = res.nextHistory;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: 'assistant',
          text: res.replyText,
          mutated: res.mutated,
        },
      ]);
      if (speakReplies && (opts.fromVoice || speakReplies)) {
        speakText(res.replyText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gemini request failed');
    } finally {
      setPending(false);
    }
  };

  const handleSendText = () => {
    const trimmed = input.trim();
    if (!trimmed || pending) return;
    setInput('');
    void sendTurn({ text: trimmed, fromVoice: false });
  };

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          void sendTurn({ audioBlob: blob, fromVoice: true });
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone permission denied or unavailable.');
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Gemini Assistant</span>
            <div className="chat-header-actions">
              <button
                type="button"
                className={`btn-sm ${speakReplies ? 'active-pill' : 'btn-ghost'}`}
                onClick={() => setSpeakReplies((v) => !v)}
                title="Toggle spoken replies"
              >
                {speakReplies ? '🔊' : '🔇'}
              </button>
              {canUndo && (
                <button type="button" className="btn-sm" onClick={onUndoLastAi}>
                  Undo AI
                </button>
              )}
              <button
                type="button"
                className="btn-sm btn-ghost"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chat-thread">
            {messages.length === 0 && (
              <div className="chat-chips">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip-btn"
                    onClick={() => void sendTurn({ text: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role}`}>
                <div className="chat-msg-text">{m.text}</div>
                {m.role === 'user' && (
                  <button
                    type="button"
                    className="speak-msg-btn"
                    disabled={pending || !isOnline}
                    onClick={() =>
                      void sendTurn({
                        text: m.audioBlob ? undefined : m.text,
                        audioBlob: m.audioBlob,
                        fromVoice: Boolean(m.audioBlob),
                      })
                    }
                    title="Resend message"
                    aria-label="Resend message"
                  >
                    ↻
                  </button>
                )}
                {m.role === 'assistant' && (
                  <button
                    type="button"
                    className="speak-msg-btn"
                    onClick={() => speakText(m.text)}
                    title="Speak reply"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}

            {pending && <div className="chat-working">Working on it…</div>}
            {error && <div className="chat-error">{error}</div>}
          </div>

          <div className="chat-input-row">
            <button
              type="button"
              className={`mic-btn ${recording ? 'recording' : ''}`}
              onClick={() => void toggleRecording()}
              disabled={pending}
              title={recording ? 'Stop recording' : 'Voice message'}
            >
              {recording ? '⏹' : '🎤'}
            </button>
            <textarea
              rows={1}
              placeholder={isOnline ? 'Ask or update notes…' : 'Offline — chat unavailable'}
              value={input}
              disabled={!isOnline || pending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
            />
            <button
              type="button"
              className="btn-sm"
              disabled={!input.trim() || pending || !isOnline}
              onClick={handleSendText}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle Gemini chat"
      >
        ✦
      </button>
    </div>
  );
};

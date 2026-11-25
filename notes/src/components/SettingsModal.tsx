import React, { useState } from 'react';
import { AppSettings } from '../core/types';

const GEMINI_MODEL_PRESETS = [
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen (Recommended)' },
  { id: 'gemini-4-argon', label: 'Gemini 4 Argon' },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
];

type SettingsModalProps = {
  settings: AppSettings;
  onSave: (next: AppSettings) => void;
  onClose: () => void;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const isPreset = GEMINI_MODEL_PRESETS.some((m) => m.id === draft.geminiModel);
  const [useCustomModel, setUseCustomModel] = useState<boolean>(!isPreset);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button type="button" className="btn-sm btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="field">
          <span>GitHub Owner / Repo</span>
          <div className="repo-row">
            <input
              type="text"
              value={draft.githubOwner}
              onChange={(e) => setDraft({ ...draft, githubOwner: e.target.value })}
              placeholder="owner"
            />
            <input
              type="text"
              value={draft.githubRepo}
              onChange={(e) => setDraft({ ...draft, githubRepo: e.target.value })}
              placeholder="repo"
            />
          </div>
        </label>

        <label className="field">
          <span>GitHub Fine-Grained PAT (Contents: Read &amp; Write)</span>
          <input
            type="password"
            value={draft.githubPat}
            onChange={(e) => setDraft({ ...draft, githubPat: e.target.value })}
            placeholder="github_pat_..."
          />
        </label>

        <label className="field">
          <span>Gemini API Key (for text &amp; voice chat)</span>
          <input
            type="password"
            value={draft.geminiApiKey}
            onChange={(e) => setDraft({ ...draft, geminiApiKey: e.target.value })}
            placeholder="AIza..."
          />
        </label>

        <label className="field">
          <span>Gemini Model</span>
          <select
            value={useCustomModel ? '__custom__' : draft.geminiModel}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setUseCustomModel(true);
              } else {
                setUseCustomModel(false);
                setDraft({ ...draft, geminiModel: e.target.value });
              }
            }}
          >
            {GEMINI_MODEL_PRESETS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
            <option value="__custom__">Custom model ID…</option>
          </select>
          {useCustomModel && (
            <input
              type="text"
              value={draft.geminiModel}
              onChange={(e) => setDraft({ ...draft, geminiModel: e.target.value })}
              placeholder="e.g. gemini-4-hydrogen"
            />
          )}
        </label>

        <label className="field">
          <span>Google OAuth Client ID (optional, Calendar sync)</span>
          <input
            type="text"
            value={draft.googleClientId}
            onChange={(e) => setDraft({ ...draft, googleClientId: e.target.value })}
            placeholder="xxxx.apps.googleusercontent.com"
          />
        </label>

        <div className="modal-footer">
          <button type="button" className="btn-sm btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

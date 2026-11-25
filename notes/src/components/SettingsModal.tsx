import React, { useState } from 'react';
import { AppSettings } from '../core/types';

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
              placeholder="neilhan"
            />
            <input
              type="text"
              value={draft.githubRepo}
              onChange={(e) => setDraft({ ...draft, githubRepo: e.target.value })}
              placeholder="neilhan"
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
          <input
            type="text"
            value={draft.geminiModel}
            onChange={(e) => setDraft({ ...draft, geminiModel: e.target.value })}
            placeholder="gemini-2.5-flash"
          />
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

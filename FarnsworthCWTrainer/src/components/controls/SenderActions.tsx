import React from 'react';
import { SenderPlayState } from '../../hooks/useMorseSender';

type SenderActionsProps = {
    senderPlayState: SenderPlayState;
    onRestart: () => void;
    onToggleSender: () => void;
    onSkipForward: () => void;
    onNewText: () => void;
};

const getSenderLabel = (state: SenderPlayState): { icon: string; label: string } => {
    if (state === 'playing') {
        return { icon: '⏸', label: 'Pause sending' };
    }
    if (state === 'paused') {
        return { icon: '▶', label: 'Resume sending' };
    }
    return { icon: '▶', label: 'Start sending' };
};

export const SenderActions = ({
    senderPlayState,
    onRestart,
    onToggleSender,
    onSkipForward,
    onNewText,
}: SenderActionsProps): React.ReactElement => {
    const { icon, label } = getSenderLabel(senderPlayState);
    const isPlaying = senderPlayState === 'playing';

    return (
        <div className="control-group actions-group">
            <div className="container">
                <label style={{ visibility: 'hidden' }} htmlFor="actionsButtons">
                    Actions
                </label>
                <div id="actionsButtons" className="actions-buttons">
                    <button className="icon-button" onClick={onRestart} aria-label="Go back to beginning">
                        <span aria-hidden="true">⏮</span>
                    </button>
                    <button
                        id="sendButton"
                        className="icon-button play-button"
                        onClick={onToggleSender}
                        aria-label={label}
                    >
                        <span aria-hidden="true">{icon}</span>
                    </button>
                    <button className="icon-button" onClick={onSkipForward} aria-label="Skip to next page">
                        <span aria-hidden="true">⏭</span>
                    </button>
                    <button id="textButton" onClick={onNewText} disabled={isPlaying}>
                        New Text
                    </button>
                </div>
            </div>
        </div>
    );
};



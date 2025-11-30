import React from 'react';
import fastBackIcon from '@static/shared/assets/icons/fast-back.svg?raw';
import fastForwardIcon from '@static/shared/assets/icons/fast-forward.svg?raw';
import pauseIcon from '@static/shared/assets/icons/pause.svg?raw';
import playIcon from '@static/shared/assets/icons/play.svg?raw';
import { IconGraphic } from '@static/shared/react';
import { SenderPlayState } from '../../hooks/useMorseSender';

type SenderActionsProps = {
    senderPlayState: SenderPlayState;
    onRestart: () => void;
    onToggleSender: () => void;
    onSkipForward: () => void;
    onNewText: () => void;
};

const getSenderLabel = (state: SenderPlayState): { iconMarkup: string; label: string } => {
    if (state === 'playing') {
        return { iconMarkup: pauseIcon, label: 'Pause sending' };
    }
    if (state === 'paused') {
        return { iconMarkup: playIcon, label: 'Resume sending' };
    }
    return { iconMarkup: playIcon, label: 'Start sending' };
};

export const SenderActions = ({
    senderPlayState,
    onRestart,
    onToggleSender,
    onSkipForward,
    onNewText,
}: SenderActionsProps): React.ReactElement => {
    const { iconMarkup, label } = getSenderLabel(senderPlayState);
    const isPlaying = senderPlayState === 'playing';

    return (
        <div className="control-group actions-group">
            <div className="container">
                <label style={{ visibility: 'hidden' }} htmlFor="actionsButtons">
                    Actions
                </label>
                <div id="actionsButtons" className="actions-buttons">
                    <button className="icon-button" onClick={onRestart} aria-label="Go back to beginning">
                        <IconGraphic svgMarkup={fastBackIcon} size="sm" />
                    </button>
                    <button
                        id="sendButton"
                        className="icon-button play-button"
                        onClick={onToggleSender}
                        aria-label={label}
                    >
                        <IconGraphic svgMarkup={iconMarkup} size="lg" />
                    </button>
                    <button className="icon-button" onClick={onSkipForward} aria-label="Skip to next page">
                        <IconGraphic svgMarkup={fastForwardIcon} size="sm" />
                    </button>
                    <button id="textButton" onClick={onNewText} disabled={isPlaying}>
                        New Text
                    </button>
                </div>
            </div>
        </div>
    );
};



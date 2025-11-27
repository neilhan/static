import React, { useMemo } from 'react';
import { TrainerSettings } from '../hooks/useTrainerSettings';
import { SenderProgress } from '../hooks/useMorseSender';

type CurrentCharDisplayProps = {
    displayMode: TrainerSettings['displayMode'];
    senderProgress: SenderProgress;
};

export const CurrentCharDisplay = ({ displayMode, senderProgress }: CurrentCharDisplayProps) => {
    const { outputChar, lastOutputChar, isCharActive } = senderProgress;

    const displayChar = useMemo(() => {
        switch (displayMode) {
            case 'immediate':
                return isCharActive ? outputChar : '';
            case 'lingering':
                return isCharActive ? outputChar : lastOutputChar;
            case 'delayed':
            default:
                return isCharActive ? '' : lastOutputChar;
        }
    }, [displayMode, isCharActive, outputChar, lastOutputChar]);

    return (
        <div className="output">
            {displayChar}
        </div>
    );
};


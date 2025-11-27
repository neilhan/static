import React, { useMemo } from 'react';
import { TrainerSettings } from '../hooks/useTrainerSettings';
import { SenderProgress } from '../hooks/useMorseSender';

type CurrentCharDisplayProps = {
    displayMode: TrainerSettings['displayMode'];
    senderProgress: SenderProgress;
};

export const CurrentCharDisplay = ({ displayMode, senderProgress }: CurrentCharDisplayProps) => {
    const { outputChar, lastOutputChar, isCharSending } = senderProgress;

    const displayChar = useMemo(() => {
        switch (displayMode) {
            case 'immediate':
                return isCharSending ? outputChar : '';
            case 'lingering':
                return isCharSending ? outputChar : lastOutputChar;
            case 'delayed':
            default:
                return isCharSending ? '' : lastOutputChar;
        }
    }, [displayMode, isCharSending, outputChar, lastOutputChar]);

    return (
        <div className="output">
            {displayChar}
        </div>
    );
};


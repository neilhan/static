import React, { createContext, useContext } from 'react';
import { useMorseSender } from '../hooks/useMorseSender';
import { useTrainerSettingsContext } from './TrainerSettingsContext';

type MorseSenderApi = ReturnType<typeof useMorseSender>;

const MorseSenderContext = createContext<MorseSenderApi | undefined>(undefined);

type MorseSenderProviderProps = {
    children: React.ReactNode;
};

export const MorseSenderProvider = ({ children }: MorseSenderProviderProps): React.ReactElement => {
    const { settings } = useTrainerSettingsContext();
    const sender = useMorseSender(settings.wpm, settings.fw, settings.frequency);

    return (
        <MorseSenderContext.Provider value={sender}>
            {children}
        </MorseSenderContext.Provider>
    );
};

export const useMorseSenderContext = (): MorseSenderApi => {
    const ctx = useContext(MorseSenderContext);
    if (!ctx) {
        throw new Error('useMorseSenderContext must be used within MorseSenderProvider');
    }
    return ctx;
};


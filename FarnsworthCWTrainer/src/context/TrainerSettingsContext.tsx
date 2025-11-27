import React, { createContext, useContext } from 'react';
import { TrainerSettings, useTrainerSettings } from '../hooks/useTrainerSettings';

type TrainerSettingsContextValue = {
    settings: TrainerSettings;
    updateSetting: <K extends keyof TrainerSettings>(key: K, value: TrainerSettings[K]) => void;
    updateSettings: (partial: Partial<TrainerSettings>) => void;
    updatePagesForType: (type: string, pages: number) => void;
};

const TrainerSettingsContext = createContext<TrainerSettingsContextValue | undefined>(undefined);

type TrainerSettingsProviderProps = {
    children: React.ReactNode;
};

export const TrainerSettingsProvider = ({ children }: TrainerSettingsProviderProps): React.ReactElement => {
    const { settings, updateSetting, updateSettings, updatePagesForType } = useTrainerSettings();

    return (
        <TrainerSettingsContext.Provider value={{ settings, updateSetting, updateSettings, updatePagesForType }}>
            {children}
        </TrainerSettingsContext.Provider>
    );
};

export const useTrainerSettingsContext = (): TrainerSettingsContextValue => {
    const ctx = useContext(TrainerSettingsContext);
    if (!ctx) {
        throw new Error('useTrainerSettingsContext must be used within TrainerSettingsProvider');
    }
    return ctx;
};


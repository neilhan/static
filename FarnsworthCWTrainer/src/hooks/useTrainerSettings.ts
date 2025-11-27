import { useState, useEffect } from 'react';

export type TrainerSettings = {
    wpm: number;
    fw: number;
    displayMode: string;
    type: string;
    repeat: number;
    pagesByType: Record<string, number>;
    frequency: number;
    enableCallsigns: boolean;
    enableProsigns: boolean;
    enableLetters: boolean;
    enableNumbers: boolean;
    enableSymbols: boolean;
};

const DEFAULT_SETTINGS: TrainerSettings = {
    wpm: 25,
    fw: 25,
    displayMode: 'immediate',
    type: 'contact',
    repeat: 5,
    pagesByType: {
        contact: 1,
        words: 1,
        random: 1,
        mix: 1
    },
    frequency: 500,
    enableCallsigns: true,
    enableProsigns: true,
    enableLetters: true,
    enableNumbers: true,
    enableSymbols: true,
};

const STORAGE_KEY = 'farnsworth-trainer-settings';

export const useTrainerSettings = () => {
    // Initialize from localStorage or defaults
    const [settings, setSettings] = useState<TrainerSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    pagesByType: {
                        ...DEFAULT_SETTINGS.pagesByType,
                        ...(parsed?.pagesByType || {})
                    }
                };
            }
        } catch (e) {
            console.error('Failed to load settings from storage', e);
        }
        return DEFAULT_SETTINGS;
    });

    // Persist to localStorage whenever settings change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings to storage', e);
        }
    }, [settings]);

    const updateSetting = <K extends keyof TrainerSettings>(key: K, value: TrainerSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const updateSettings = (partial: Partial<TrainerSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const updatePagesForType = (type: string, pages: number) => {
        setSettings(prev => ({
            ...prev,
            pagesByType: {
                ...prev.pagesByType,
                [type]: pages
            }
        }));
    };

    return { settings, updateSetting, updateSettings, updatePagesForType };
};

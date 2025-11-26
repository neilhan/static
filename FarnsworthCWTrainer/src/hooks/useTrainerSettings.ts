import { useState, useEffect } from 'react';

export interface TrainerSettings {
    wpm: number;
    fw: number;
    displayMode: string;
    type: string;
    repeat: number;
    frequency: number;
    enableCallsigns: boolean;
    enableProsigns: boolean;
    enableLetters: boolean;
    enableNumbers: boolean;
    enableSymbols: boolean;
}

const DEFAULT_SETTINGS: TrainerSettings = {
    wpm: 25,
    fw: 25,
    displayMode: 'immediate',
    type: 'contact',
    repeat: 5,
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
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
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

    return { settings, updateSetting };
};

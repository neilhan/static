import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ContentConfig } from '../morse/contentGenerator';
import { useTrainerSettingsContext } from '../context/TrainerSettingsContext';
import { useMessageGenerator } from './useMessageGenerator';

type TrainerMessagesHook = {
    messages: string[];
    regenerateMessages: () => void;
};

export const useTrainerMessages = (): TrainerMessagesHook => {
    const { settings, updatePagesForType } = useTrainerSettingsContext();
    const { messages, generateMessages } = useMessageGenerator();

    const contentConfig = useMemo<ContentConfig>(() => ({
        enableLetters: settings.enableLetters,
        enableNumbers: settings.enableNumbers,
        enableSymbols: settings.enableSymbols,
        enableCallsigns: settings.enableCallsigns,
        enableProsigns: settings.enableProsigns,
    }), [
        settings.enableLetters,
        settings.enableNumbers,
        settings.enableSymbols,
        settings.enableCallsigns,
        settings.enableProsigns,
    ]);

    const pagesForSelectedType = useMemo(() => (
        settings.pagesByType?.[settings.type] ?? 1
    ), [settings.pagesByType, settings.type]);

    const regenerateMessages = useCallback(() => {
        const { pageCount } = generateMessages(
            settings.type,
            settings.repeat,
            pagesForSelectedType,
            contentConfig
        );
        updatePagesForType(settings.type, pageCount);
    }, [
        contentConfig,
        generateMessages,
        pagesForSelectedType,
        settings.repeat,
        settings.type,
        updatePagesForType,
    ]);

    const regenerateRef = useRef(regenerateMessages);
    useEffect(() => {
        regenerateRef.current = regenerateMessages;
    }, [regenerateMessages]);

    // Initial message preparation. Run once on mount but keep handler fresh via ref.
    useEffect(() => {
        const timer = setTimeout(() => {
            regenerateRef.current();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return {
        messages,
        regenerateMessages,
    };
};



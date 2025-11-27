import React, { ReactNode, useCallback, useMemo } from 'react';
import { SenderPlayState } from '../hooks/useMorseSender';
import { useTrainerSettingsContext } from '../context/TrainerSettingsContext';
import { SpeedControls } from './controls/SpeedControls';
import { ContentFilters } from './controls/ContentFilters';
import { SenderActions } from './controls/SenderActions';
import { MessagePreview } from './controls/MessagePreview';

type ControlsProps = {
    senderPlayState: SenderPlayState;
    onNewText: () => void;
    onToggleSender: () => void;
    onRestart: () => void;
    onSkipForward: () => void;
    messageContent: ReactNode;
};

export const Controls = ({
    senderPlayState,
    onNewText,
    onToggleSender,
    onRestart,
    onSkipForward,
    messageContent
}: ControlsProps) => {
    const { settings, updateSetting, updatePagesForType } = useTrainerSettingsContext();
    const isPlaying = senderPlayState === 'playing';

    const isContactType = settings.type === 'contact';
    const pagesForType = settings.pagesByType?.[settings.type] ?? 1;
    const pageOptions = useMemo(() => {
        const base = [1, 2, 3, 4, 5];
        return base.includes(pagesForType) ? base : [...base, pagesForType].sort((a, b) => a - b);
    }, [pagesForType]);

    const handleUpdatePages = useCallback((pages: number) => {
        updatePagesForType(settings.type, pages);
    }, [settings.type, updatePagesForType]);

    return (
        <div id="controls">
            <SpeedControls
                settings={settings}
                isPlaying={isPlaying}
                pagesForType={pagesForType}
                pageOptions={pageOptions}
                isContactType={isContactType}
                onUpdateSetting={updateSetting}
                onUpdatePages={handleUpdatePages}
            />

            <ContentFilters
                settings={settings}
                isPlaying={isPlaying}
                onUpdateSetting={updateSetting}
            />

            <SenderActions
                senderPlayState={senderPlayState}
                onRestart={onRestart}
                onToggleSender={onToggleSender}
                onSkipForward={onSkipForward}
                onNewText={onNewText}
            />

            <MessagePreview messageContent={messageContent} />
        </div>
    );
};

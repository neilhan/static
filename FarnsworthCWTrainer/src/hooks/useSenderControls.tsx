import { useCallback, useEffect } from 'react';
import { useMorseSenderContext } from '../context/MorseSenderContext';
import { SenderProgress, SenderPlayState } from './useMorseSender';

type SenderControlHandlers = {
    senderPlayState: SenderPlayState;
    senderProgress: SenderProgress;
    onNewText: () => void;
    onToggleSender: () => void;
    onRestart: () => void;
    onSkipForward: () => void;
};

export const useSenderControls = (
    messages: string[],
    regenerateMessages: () => void
): SenderControlHandlers => {
    const {
        senderPlayState,
        senderProgress,
        loadMessages,
        play,
        pause,
        resume,
        stop,
        skipToMessage,
        rewind,
    } = useMorseSenderContext();

    const messageCount = messages.length;

    useEffect(() => {
        if (messageCount > 0) {
            loadMessages(messages);
        } else {
            stop();
        }
    }, [messageCount, messages, loadMessages, stop]);

    const handleNewText = useCallback(() => {
        stop();
        regenerateMessages();
    }, [regenerateMessages, stop]);

    const handleToggleSender = useCallback(() => {
        if (senderPlayState === 'playing') {
            pause();
            return;
        }

        if (senderPlayState === 'paused') {
            resume();
            return;
        }

        if (messageCount === 0) {
            regenerateMessages();
            return;
        }

        loadMessages(messages);
        play();
    }, [senderPlayState, pause, resume, messageCount, regenerateMessages, loadMessages, messages, play]);

    const handleRestart = useCallback(() => {
        rewind();
    }, [rewind]);

    const handleSkipForward = useCallback(() => {
        if (messageCount === 0) return;
        const nextMessageIndex = Math.min(senderProgress.messageIndex + 1, messageCount - 1);
        skipToMessage(nextMessageIndex);
    }, [messageCount, skipToMessage, senderProgress.messageIndex]);

    return {
        senderPlayState,
        senderProgress,
        onNewText: handleNewText,
        onToggleSender: handleToggleSender,
        onRestart: handleRestart,
        onSkipForward: handleSkipForward,
    };
};



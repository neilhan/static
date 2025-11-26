import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioEngine } from './useAudioEngine';
import { calculateTiming, getMorseSequence } from '../utils/morse/morseTiming';
import { ContentConfig } from '../utils/morse/contentGenerator';

// The trainer hook manages the orchestration of playing the Morse sequence
export const useCwTrainer = (
    wpm: number,
    fw: number,
    frequency: number,
    onCharStart: (char: string) => void,
    onCharEnd: (char: string) => void,
    onMessageStart: (index: number) => void,
    onFinish: () => void
) => {
    const audio = useAudioEngine(frequency);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Store timeouts so we can clear them on cancel
    const timeoutsRef = useRef<number[]>([]);
    
    // Store state refs for loop access
    const onCharStartRef = useRef(onCharStart);
    const onCharEndRef = useRef(onCharEnd);
    const onMessageStartRef = useRef(onMessageStart);
    const onFinishRef = useRef(onFinish);

    useEffect(() => {
        onCharStartRef.current = onCharStart;
        onCharEndRef.current = onCharEnd;
        onMessageStartRef.current = onMessageStart;
        onFinishRef.current = onFinish;
    }, [onCharStart, onCharEnd, onMessageStart, onFinish]);

    const stop = useCallback(() => {
        const currentTime = audio.getCurrentTime();
        audio.cancelScheduledValues(currentTime);
        
        // Clear all pending UI callbacks
        timeoutsRef.current.forEach(id => window.clearTimeout(id));
        timeoutsRef.current = [];
        
        setIsPlaying(false);
    }, [audio]);

    const play = useCallback((messages: string[]) => {
        // Ensure audio context is running
        audio.unsuspend();
        setIsPlaying(true);

        const timing = calculateTiming(wpm, fw);
        const currentTime = audio.getCurrentTime();
        let timeCursor = currentTime + 0.1; // Start slightly in future

        // Helper to schedule a timeout synchronized with audio time
        const scheduleCallback = (cb: () => void, triggerTime: number) => {
            const delay = (triggerTime - currentTime) * 1000;
            if (delay >= 0) {
                const id = window.setTimeout(cb, delay);
                timeoutsRef.current.push(id);
            }
        };

        // Helper to send a single Morse element (dot/dash)
        const sendElement = (width: number) => {
            const RAMP = 0.005;
            audio.scheduleTone(timeCursor, width);
            timeCursor += width + RAMP;
        };

        // Process all messages
        messages.forEach((message, msgIdx) => {
            // Schedule message start callback
            const msgStartTime = timeCursor;
            scheduleCallback(() => onMessageStartRef.current(msgIdx), msgStartTime);

            // Initial silence per message
            timeCursor += 0.5;

            const words = message.split(' ');
            words.forEach((word, wordIdx) => {
                const isProsign = word.startsWith('@');
                const textToProcess = isProsign ? word : word;
                const cleanWord = isProsign ? word.substring(1) : word;

                // For non-prosigns, we iterate characters.
                // For prosigns, we treat as one "character" entity but sequence is specific
                // Actually original logic:
                // if prosign: look up sequence, send it. 
                // if word: iterate chars, look up sequence, send each.
                
                if (isProsign) {
                    const morse = getMorseSequence(word);
                    if (morse) {
                        const startT = timeCursor;
                        scheduleCallback(() => onCharStartRef.current(cleanWord), startT);
                        
                        // Send the dots/dashes
                        const RAMP = 0.005;
                        for (let i = 0; i < morse.length; i++) {
                            const e = morse[i];
                            if (e === '.') sendElement(timing.dotWidth);
                            else if (e === '-') sendElement(timing.dashWidth);
                            
                            if (i < morse.length - 1) {
                                timeCursor += timing.dotWidth + RAMP;
                            }
                        }

                        const endT = timeCursor;
                        scheduleCallback(() => onCharEndRef.current(cleanWord), endT);
                    }
                } else {
                    // Normal word
                    for (let i = 0; i < word.length; i++) {
                        const char = word[i];
                        const morse = getMorseSequence(char);
                        
                        if (morse) {
                            const startT = timeCursor;
                            scheduleCallback(() => onCharStartRef.current(char), startT);

                            const RAMP = 0.005;
                            for (let k = 0; k < morse.length; k++) {
                                const e = morse[k];
                                if (e === '.') sendElement(timing.dotWidth);
                                else if (e === '-') sendElement(timing.dashWidth);
                                
                                if (k < morse.length - 1) {
                                    timeCursor += timing.dotWidth + RAMP;
                                }
                            }

                            const endT = timeCursor;
                            scheduleCallback(() => onCharEndRef.current(char), endT);
                        }

                        // Space between chars
                        if (i < word.length - 1) {
                            timeCursor += timing.charSpace;
                        }
                    }
                }

                // Space between words
                if (wordIdx < words.length - 1) {
                    timeCursor += timing.wordSpace;
                }
            });
            
            // Delay after message line
            timeCursor += 1.0;
        });

        // Schedule finish
        scheduleCallback(() => {
            setIsPlaying(false);
            onFinishRef.current();
        }, timeCursor);

    }, [audio, wpm, fw]); // Dependencies for play function

    return {
        isPlaying,
        play,
        stop
    };
};

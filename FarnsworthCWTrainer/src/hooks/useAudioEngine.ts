import { useEffect, useRef, useCallback } from 'react';

export type AudioConfig = {
    frequency: number;
};

export const useAudioEngine = (initialFrequency: number = 500) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscNodeRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    
    // Keep track of frequency in a ref to avoid re-creating oscillator unnecessarily,
    // but allow updates via effect
    const frequencyRef = useRef(initialFrequency);

    useEffect(() => {
        frequencyRef.current = initialFrequency;
        if (oscNodeRef.current) {
            oscNodeRef.current.frequency.value = initialFrequency;
        }
    }, [initialFrequency]);

    // Lazily create AudioContext on user gesture so iOS Safari / standalone PWAs allow playback
    const ensureAudioContext = useCallback((): AudioContext | null => {
        const existing = audioContextRef.current;
        if (existing && existing.state !== 'closed') {
            return existing;
        }

        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("Unable to create audio context");
            return null;
        }

        try {
            const nav = navigator as unknown as { audioSession?: { type: string } };
            if (nav.audioSession) {
                nav.audioSession.type = 'playback';
            }
        } catch {
            // Ignore if audioSession is unsupported or read-only
        }

        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequencyRef.current;
        oscNodeRef.current = osc;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime); // OFF
        gainNodeRef.current = gain;

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        // Play a 1-sample silent buffer to unlock Web Audio on iOS standalone PWAs
        try {
            const silentBuffer = ctx.createBuffer(1, 1, 22050);
            const silentSource = ctx.createBufferSource();
            silentSource.buffer = silentBuffer;
            silentSource.connect(ctx.destination);
            silentSource.start(0);
        } catch {
            // Ignore if silent buffer unlock is not needed or fails
        }

        return ctx;
    }, []);

    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => {});
            }
            audioContextRef.current = null;
            oscNodeRef.current = null;
            gainNodeRef.current = null;
        };
    }, []);

    const scheduleTone = useCallback((startTime: number, duration: number) => {
        const gainNode = gainNodeRef.current;
        if (!gainNode) return;

        const RAMP = 0.005;
        const ON = 1.0;
        const OFF = 0.0001;

        gainNode.gain.setValueAtTime(OFF, startTime);
        gainNode.gain.exponentialRampToValueAtTime(ON, startTime + RAMP);
        gainNode.gain.setValueAtTime(ON, startTime + duration);
        gainNode.gain.exponentialRampToValueAtTime(OFF, startTime + duration + RAMP);
    }, []);

    const cancelScheduledValues = useCallback((time: number) => {
        const gainNode = gainNodeRef.current;
        if (gainNode) {
            gainNode.gain.cancelScheduledValues(time);
            gainNode.gain.setValueAtTime(0.0001, time);
        }
    }, []);

    const getCurrentTime = useCallback(() => {
        return audioContextRef.current ? audioContextRef.current.currentTime : 0;
    }, []);

    const unsuspend = useCallback((): Promise<void> | void => {
        const ctx = ensureAudioContext();
        if (!ctx) return;

        if (ctx.state === 'running') {
            return;
        }

        return ctx.resume().then(() => {
            if (ctx.state !== 'running') {
                throw new Error(`AudioContext did not resume (state: ${ctx.state})`);
            }
        });
    }, [ensureAudioContext]);

    return {
        scheduleTone,
        cancelScheduledValues,
        getCurrentTime,
        unsuspend
    };
};


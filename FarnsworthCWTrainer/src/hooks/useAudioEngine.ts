import { useEffect, useRef, useState, useCallback } from 'react';

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

    // Initialize Audio Context
    useEffect(() => {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext || false);
        if (!AudioContextClass) {
            console.warn("Unable to create audio context");
            return;
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

        return () => {
            if (ctx.state !== 'closed') {
                ctx.close();
            }
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

    const unsuspend = useCallback(() => {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    return {
        scheduleTone,
        cancelScheduledValues,
        getCurrentTime,
        unsuspend
    };
};


import { CHARS, PROSIGNS } from './constants';

export type MorseTimingConfig = {
    dotWidth: number;
    dashWidth: number;
    charSpace: number;
    wordSpace: number;
};

export const calculateTiming = (wpm: number, fw: number): MorseTimingConfig => {
    // "1.2" is a magic constant here, derived from the fact that
    // if you were to send the word "PARIS" one time per minute, each
    // dot would be 1.2 seconds long.
    const fwDotWidth = 1.2 / fw;
    const dotWidth = 1.2 / wpm;
    
    return {
        dotWidth: dotWidth,
        // A dash is three dots wide
        dashWidth: dotWidth * 3.0,
        // There are 3 dots of silence between characters (using Farnsworth spacing)
        charSpace: fwDotWidth * 3.0,
        // There are 7 dots of silence between words (using Farnsworth spacing)
        wordSpace: fwDotWidth * 7.0
    };
};

export const getMorseSequence = (char: string): string | null => {
    if (char.startsWith('@')) {
        const prosign = char.substring(1).toUpperCase();
        return PROSIGNS[prosign] || null;
    }
    return CHARS[char.toUpperCase()] || null;
};

import { LETTERS, NUMBERS, SYMBOLS, CALLPREFIXES, PROSIGN_LIST, TOPWORD_LIST, CONTACT_TEMPLATES, CONTACTS } from './constants';

export type ContentConfig = {
    enableLetters: boolean;
    enableNumbers: boolean;
    enableSymbols: boolean;
    enableCallsigns: boolean;
    enableProsigns: boolean;
};

const random = (mn: number, mx: number): number => { 
    return Math.random() * (mx - mn) + mn; 
};

const randomItems = <T>(ary: T[], numItems: number): T[] => {
    if (ary.length === 0) return [];
    return new Array(numItems).fill(1).map(() => ary[Math.floor(random(0, ary.length))]);
};

const makeCallSign = (): string => {
    let callsign = CALLPREFIXES[Math.floor(Math.random() * CALLPREFIXES.length)];
    callsign += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    callsign += LETTERS[Math.floor(Math.random() * LETTERS.length)];

    if (Math.random() > 0.5) {
        callsign += LETTERS[Math.floor(Math.random() * NUMBERS.length)];
    }

    if (Math.random() > 0.5) {
        callsign += LETTERS[Math.floor(Math.random() * NUMBERS.length)];
    }

    return callsign;
};

export const genContact = (): string[] => {
    const msgs = [...CONTACT_TEMPLATES, ...randomItems(CONTACTS, 5)];
    return msgs;
};

export const genRandomWords = (numWords: number, config: ContentConfig): string => {
    let words: string[] = [];
    for (let i = 0; words.length < numWords; i++) {
        if (Math.random() < 0.05 && config.enableCallsigns) {
            words.push(makeCallSign());
        } else if (Math.random() < 0.05 && config.enableProsigns) {
            words.push(PROSIGN_LIST[Math.floor(Math.random() * PROSIGN_LIST.length)]);
        } else {
            words.push(TOPWORD_LIST[Math.floor(Math.random() * TOPWORD_LIST.length)]);
        }
    }
    return words.join(" ").toLowerCase();
};

export const genRandomCharGroups = (numGroups: number, groupSize: number, config: ContentConfig): string => {
    let groups: string[] = [];
    let alphabet: string[] = [];

    if (config.enableLetters) alphabet = alphabet.concat(LETTERS);
    if (config.enableNumbers) alphabet = alphabet.concat(NUMBERS);
    if (config.enableSymbols) alphabet = alphabet.concat(SYMBOLS);

    if (alphabet.length === 0) return "";

    for (let i = 0; i < numGroups; i++) {
        let group = "";
        for (let j = 0; j < groupSize; j++) {
            let c = alphabet[Math.floor(Math.random() * alphabet.length)];
            group = group + c;
        }
        groups.push(group);
    }
    return groups.join(" ").toLowerCase();
};

import { useState, useCallback } from 'react';
import { genRandomWords, genRandomCharGroups, genContact, ContentConfig } from '../morse/contentGenerator';

export interface MessageGenerationResult {
    pageCount: number;
    messageCount: number;
}

export const useMessageGenerator = () => {
    const [messages, setMessages] = useState<string[]>([]);

    const generateMessages = useCallback((
        type: string,
        repeat: number,
        pages: number,
        config: ContentConfig
    ): MessageGenerationResult => {
        let newMessages: string[] = [];
        const totalPages = Math.max(1, pages);
        let pageCount = 0;

        if (type === 'contact') {
            newMessages = genContact();
            pageCount = newMessages.length;
        } else {
            const totalIterations = Math.max(1, repeat) * totalPages;
            for (let i = 0; i < totalIterations; i++) {
                let text = '';
                if (type === 'words') { 
                    text = genRandomWords(72, config);
                } else if (type === 'random') {
                    text = genRandomCharGroups(60, 5, config);
                } else { // mixed
                    if (Math.random() > 0.2) {
                        text = genRandomWords(72, config);
                    } else {
                        text = genRandomCharGroups(60, 5, config);
                    }
                }
                newMessages.push(text);
            }
            pageCount = totalPages;
        }
        setMessages(newMessages);
        return {
            pageCount,
            messageCount: newMessages.length
        };
    }, []);

    return { messages, generateMessages };
};


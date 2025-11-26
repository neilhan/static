import { useState, useCallback } from 'react';
import { genRandomWords, genRandomCharGroups, genContact, ContentConfig } from '../utils/morse/contentGenerator';

export const useMessageGenerator = () => {
    const [messages, setMessages] = useState<string[]>([]);

    const generateMessages = useCallback((
        type: string,
        repeat: number,
        config: ContentConfig
    ) => {
        let newMessages: string[] = [];

        if (type === 'contact') {
            newMessages = genContact();
        } else {
            for (let i = 0; i < repeat; i++) {
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
        }
        setMessages(newMessages);
    }, []);

    return { messages, generateMessages };
};


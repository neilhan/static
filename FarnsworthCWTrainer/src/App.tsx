import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Trainer.css';
import { useCwTrainer } from './hooks/useCwTrainer';
import { useMessageGenerator } from './hooks/useMessageGenerator';
import { useTrainerSettings } from './hooks/useTrainerSettings';
import { ContentConfig } from './morse/contentGenerator';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InfoSection } from './components/InfoSection';
import { Controls } from './components/Controls';

function App(): React.ReactElement {
    // Settings Hook
    const { settings, updateSetting } = useTrainerSettings();

    // State
    const [outputChar, setOutputChar] = useState<string>('');
    const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
    const [charNum, setCharNum] = useState<number>(0);
    
    // Message Generator Hook
    const { messages, generateMessages } = useMessageGenerator();

    // Refs to keep track of current values inside callbacks
    const stateRef = useRef({
        messages: [] as string[],
        currentMessageIndex: 0,
        charNum: 0,
        displayMode: 'immediate'
    });

    // Sync ref with state
    useEffect(() => {
        stateRef.current.messages = messages;
        stateRef.current.currentMessageIndex = currentMessageIndex;
        stateRef.current.charNum = charNum;
        stateRef.current.displayMode = settings.displayMode;
    }, [messages, currentMessageIndex, charNum, settings.displayMode]);

    const showChar = useCallback((c: string): void => {
        const { messages, currentMessageIndex, charNum, displayMode } = stateRef.current;
        let currentText = messages[currentMessageIndex] || "";
        let cleanText = currentText.replace(/@/g, '');
        
        let newCharNum = charNum + c.length;

        // Always set uppercase for display
        if (displayMode === 'delayed') {
            setOutputChar("");
        } else {
            setOutputChar(c.toUpperCase());
        }

        if (cleanText[newCharNum] === ' ') {
            newCharNum++;
        }
        
        setCharNum(newCharNum);
    }, []);

    const hideChar = useCallback((c: string): void => {
        const { displayMode } = stateRef.current;
        // Always set uppercase for display
        if (displayMode === 'delayed') {
            setOutputChar(c.toUpperCase());
        } else if (displayMode === 'immediate') {
            setOutputChar("");
        }
    }, []);

    const updateDisplayMessage = useCallback((msgIndex: number): void => {
        setCharNum(0);
        setCurrentMessageIndex(msgIndex);
    }, []);

    const afterSend = useCallback((): void => {
        setOutputChar("");
    }, []);

    // useCwTrainer Hook
    const { isPlaying, play, stop } = useCwTrainer(
        settings.wpm,
        settings.fw,
        settings.frequency,
        showChar,
        hideChar,
        updateDisplayMessage,
        afterSend
    );

    const handleGenerateMessages = useCallback(() => {
        const config: ContentConfig = {
            enableLetters: settings.enableLetters,
            enableNumbers: settings.enableNumbers,
            enableSymbols: settings.enableSymbols,
            enableCallsigns: settings.enableCallsigns,
            enableProsigns: settings.enableProsigns
        };
        generateMessages(settings.type, settings.repeat, config);
        setCurrentMessageIndex(0);
        setCharNum(0);
        setOutputChar("");
    }, [settings, generateMessages]);

    // Initial message preparation
    useEffect(() => {
        const timer = setTimeout(() => {
             handleGenerateMessages();
        }, 100);
        return () => clearTimeout(timer);
    }, []); // Intentionally run once

    const handleNewText = (): void => {
        handleGenerateMessages();
    };

    const handleSend = (): void => {
        setCharNum(0);
        play(messages);
    };

    const handleStop = (): void => {
        stop();
    };

    // Render the current message with highlighting
    const renderMessage = (): React.ReactNode => {
        if (messages.length === 0) return "";
        const currentText = messages[currentMessageIndex];
        if (!currentText) return "";
        
        const cleanText = currentText.replace(/@/g, '');
        
        const donePart = cleanText.substring(0, charNum);
        const remainingPart = cleanText.substring(charNum);

        return (
            <>
                <span className="hilighted">{donePart}</span>
                {remainingPart}
            </>
        );
    };

    return (
        <div id="player">
            <Header />
            
            <div className="output">
                {outputChar}
            </div>

            <Controls 
                settings={settings}
                updateSetting={updateSetting}
                isPlaying={isPlaying}
            />

            <div style={{marginTop: '1em', marginBottom: '1em'}}>
                <button id="textButton" onClick={handleNewText} disabled={isPlaying}>New Text</button>
                <button id="sendButton" onClick={handleSend} disabled={isPlaying}>Send</button>
                <button id="cancelButton" onClick={handleStop} disabled={!isPlaying}>Stop</button>
            </div>

            <div>
                <div className="sendTextDiv">
                    {renderMessage()}
                </div>
            </div>

            <InfoSection />
            <Footer />
        </div>
    );
}

export default App;

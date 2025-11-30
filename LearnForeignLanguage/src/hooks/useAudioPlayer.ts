import { useState, useEffect, useRef, useCallback } from 'react';
import { Sentence } from '../types';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  
  const synth = useRef(window.speechSynthesis);
  const mounted = useRef(true);
  const isCancelled = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      synth.current.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    isCancelled.current = true;
    synth.current.cancel();
    if (mounted.current) {
      setIsPlaying(false);
      setPlayingId(null);
      setCurrentIndex(-1);
    }
  }, []);

  const speakText = (
    text: string, 
    langOrVoiceURI: string, 
    onEnd: (duration: number) => void, 
    onError: (e: any) => void
  ) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to find a matching voice by URI
      const voices = synth.current.getVoices();
      const matchingVoice = voices.find(v => v.voiceURI === langOrVoiceURI);

      if (matchingVoice) {
        utterance.voice = matchingVoice;
        utterance.lang = matchingVoice.lang;
      } else {
        // Fallback: treat it as a language code
        utterance.lang = langOrVoiceURI;
      }
      
      utterance.rate = 0.9;

      const startTime = Date.now();

      utterance.onend = () => {
          const duration = Date.now() - startTime;
          onEnd(duration);
      };
      
      utterance.onerror = onError;

      synth.current.speak(utterance);
  };

  const playConversation = useCallback((
    id: string, 
    sentences: Sentence[], 
    targetLangOrVoiceURI: string,
    nativeLangOrVoiceURI: string,
    shouldPlayNative: boolean,
    includePause: boolean, // If true, pause for duration of speech
    onComplete?: (id: string) => void,
    onIndexChange?: (index: number) => void,
    startIndex: number = 0
  ) => {
    // Stop any current playback
    stop();
    
    if (sentences.length === 0 || startIndex >= sentences.length) return;
    
    isCancelled.current = false;
    setIsPlaying(true);
    setPlayingId(id);
    setCurrentIndex(startIndex);

    let index = startIndex;
    let step = 'target'; // 'target' or 'native'

    const speakNext = () => {
      if (isCancelled.current || !mounted.current) return;
      
      if (index >= sentences.length) {
        setIsPlaying(false);
        setPlayingId(null);
        setCurrentIndex(-1);
        if (onComplete) onComplete(id);
        return;
      }

      // Notify index change
      if (mounted.current) {
          setCurrentIndex(index);
          if (onIndexChange) onIndexChange(index);
      }

      const sentence = sentences[index];
      // Skip empty sentences
      if (!sentence.target.trim()) {
        index++;
        step = 'target';
        speakNext();
        return;
      }

      const handleEnd = (duration: number) => {
        if (mounted.current && !isCancelled.current) {
            // Calculate wait time based on step
            let waitTime = 400; // default tiny pause
            
            if (step === 'target') {
                if (includePause) {
                    waitTime = duration; // Wait for same amount of time as the speech (for repetition)
                }
            } else {
                // After native, always short pause
                waitTime = 400;
            }

            setTimeout(() => {
                if (shouldPlayNative && step === 'target' && sentence.native.trim()) {
                    step = 'native';
                    speakNext();
                } else {
                    step = 'target';
                    index++;
                    speakNext();
                }
            }, waitTime); 
        }
      };

      const handleError = (e: any) => {
        console.error('Speech synthesis error:', e);
        if (mounted.current) {
            setIsPlaying(false);
            setPlayingId(null);
            setCurrentIndex(-1);
        }
      };

      if (step === 'target') {
          speakText(sentence.target, targetLangOrVoiceURI, handleEnd, handleError);
      } else {
          speakText(sentence.native, nativeLangOrVoiceURI, handleEnd, handleError);
      }
    };

    // Start speaking
    speakNext();
  }, [stop]);

  return {
    playConversation,
    stop,
    isPlaying,
    playingId,
    currentIndex
  };
};

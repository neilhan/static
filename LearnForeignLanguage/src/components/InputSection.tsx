import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './InputSection.css';
import { useSpeechLanguages, DEFAULT_SUPPORTED_LANGUAGES } from '../hooks/useSpeechLanguages';

interface InputSectionProps {
  rawInput: string;
  onInputChange: (value: string) => void;
  
  targetVoiceURI: string;
  onTargetChange: (voiceURI: string, langCode: string) => void;
  
  nativeVoiceURI: string;
  onNativeChange: (voiceURI: string, langCode: string) => void;

  playNative: boolean;
  onPlayNativeChange: (enabled: boolean) => void;

  includePause: boolean;
  onIncludePauseChange: (enabled: boolean) => void;

  isPlaying: boolean;
  currentSentenceIndex: number;
}

export interface InputSectionRef {
  getCursorOffset: () => number;
}

export const InputSection = forwardRef<InputSectionRef, InputSectionProps>(({
  rawInput,
  onInputChange,
  targetVoiceURI,
  onTargetChange,
  nativeVoiceURI,
  onNativeChange,
  playNative,
  onPlayNativeChange,
  includePause,
  onIncludePauseChange,
  isPlaying,
  currentSentenceIndex,
}, ref) => {
  const browserLanguages = useSpeechLanguages();
  const languages = browserLanguages.length > 0 ? browserLanguages : DEFAULT_SUPPORTED_LANGUAGES;
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    getCursorOffset: () => textareaRef.current?.selectionStart ?? 0,
  }));

  // Auto-scroll to active line
  useEffect(() => {
    if (isPlaying && currentSentenceIndex >= 0 && textareaRef.current) {
      const lines = rawInput.split('\n');
      let sentenceCount = 0;
      let lineIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() !== '') {
          if (sentenceCount === currentSentenceIndex) {
            lineIndex = i;
            break;
          }
          sentenceCount++;
        }
      }

      const lineHeight = 24; // Approximate, depends on CSS
      const scrollPos = lineIndex * lineHeight;
      
      textareaRef.current.scrollTo({
        top: scrollPos - 100,
        behavior: 'smooth'
      });
    }
  }, [isPlaying, currentSentenceIndex, rawInput]);

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>, 
    onChange: (uri: string, lang: string) => void
  ) => {
    const selectedURI = e.target.value;
    const selectedOption = languages.find(l => l.voiceURI === selectedURI);
    if (selectedOption) {
      onChange(selectedURI, selectedOption.lang);
    } else {
      onChange(selectedURI, selectedURI); // Fallback
    }
  };

  return (
    <div className="input-section">
      <div className="language-controls">
        <div className="select-group">
          <label>Target Language (Learning):</label>
          <select 
            value={targetVoiceURI} 
            onChange={(e) => handleLanguageChange(e, onTargetChange)}
          >
            <option value="" disabled>Select a voice...</option>
            {languages.map(lang => (
              <option key={`target-${lang.voiceURI}`} value={lang.voiceURI}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label>Native Language (Translation):</label>
          <select 
            value={nativeVoiceURI} 
            onChange={(e) => handleLanguageChange(e, onNativeChange)}
          >
            <option value="" disabled>Select a voice...</option>
             {languages.map(lang => (
              <option key={`native-${lang.voiceURI}`} value={lang.voiceURI}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-row">
          <div className="checkbox-control">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={playNative}
                onChange={(e) => onPlayNativeChange(e.target.checked)}
              />
              <span>Play native translation after target text</span>
            </label>
          </div>

          <div className="delay-control">
             <label title="Pause for the same duration as the spoken text to allow repetition">
               <input 
                 type="checkbox" 
                 checked={includePause}
                 onChange={(e) => onIncludePauseChange(e.target.checked)}
               />
               Include pause for repetition
             </label>
          </div>
        </div>
      </div>

      <div className="text-input-container relative-container">
        <label htmlFor="conversation-input">
          Enter conversations (separate conversations with empty lines, separate text and translation with "-"):
        </label>
        <div className="editor-wrapper">
          <textarea
            ref={textareaRef}
            id="conversation-input"
            value={rawInput}
            onChange={(e) => onInputChange(e.target.value)}
            rows={15}
            placeholder={`Hello - Hola\nHow are you? - ¿Cómo estás?\n\n(New Conversation)\nGood morning - Buenos días`}
            className={`conversation-textarea ${isPlaying ? 'playing' : ''}`}
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
});

InputSection.displayName = 'InputSection';

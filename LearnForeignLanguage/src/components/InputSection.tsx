import React from "react";
import "./InputSection.css";
import {
  useSpeechLanguages,
  DEFAULT_SUPPORTED_LANGUAGES,
} from "../hooks/useSpeechLanguages";

interface InputSectionProps {
  targetVoiceURI: string;
  onTargetChange: (voiceURI: string, langCode: string) => void;

  nativeVoiceURI: string;
  onNativeChange: (voiceURI: string, langCode: string) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  targetVoiceURI,
  onTargetChange,
  nativeVoiceURI,
  onNativeChange,
}) => {
  const browserLanguages = useSpeechLanguages();
  const languages =
    browserLanguages.length > 0
      ? browserLanguages
      : DEFAULT_SUPPORTED_LANGUAGES;

  const handleLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    onChange: (uri: string, lang: string) => void
  ) => {
    const selectedURI = e.target.value;
    const selectedOption = languages.find((l) => l.voiceURI === selectedURI);
    if (selectedOption) {
      onChange(selectedURI, selectedOption.lang);
    } else {
      onChange(selectedURI, selectedURI);
    }
  };

  return (
    <div className="input-section">
      <div className="language-controls">
        <div className="select-group">
          <label>Learning Voice:</label>
          <select
            value={targetVoiceURI}
            onChange={(e) => handleLanguageChange(e, onTargetChange)}
          >
            <option value="" disabled>
              Select a voice...
            </option>
            {languages.map((lang) => (
              <option key={`target-${lang.voiceURI}`} value={lang.voiceURI}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label>Translation Voice:</label>
          <select
            value={nativeVoiceURI}
            onChange={(e) => handleLanguageChange(e, onNativeChange)}
          >
            <option value="" disabled>
              Select a voice...
            </option>
            {languages.map((lang) => (
              <option key={`native-${lang.voiceURI}`} value={lang.voiceURI}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

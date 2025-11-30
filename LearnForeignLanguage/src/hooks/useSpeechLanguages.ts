import { useState, useEffect } from "react";

export interface LanguageOption {
  voiceURI: string;
  lang: string;
  name: string;
}

// List of known novelty/novelty voices to exclude
const NOVELTY_VOICES = [
  "Albert",
  "Bad News",
  "Bahh",
  "Bells",
  "Boing",
  "Bubbles",
  "Cellos",
  "Deranged",
  "Good News",
  "Hysterical",
  "Junior",
  "Kathy",
  "Organ",
  "Princess",
  "Ralph",
  "Trinoids",
  "Whisper",
  "Zarvox",
];

export const useSpeechLanguages = () => {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);

  useEffect(() => {
    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length === 0) return;

      const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

      const options: LanguageOption[] = voices
        .filter(
          (voice) =>
            !NOVELTY_VOICES.some((noveltyName) =>
              voice.name.includes(noveltyName)
            )
        )
        .map((voice) => {
          let langName = voice.lang;
          try {
            const displayName = displayNames.of(voice.lang);
            if (displayName) {
              langName = displayName;
            }
          } catch (e) {
            // Fallback
          }

          // Clean up the voice name by removing language info in parentheses
          // e.g., "Eddy (Spanish (Mexico))" becomes "Eddy"
          // Using .* to handle nested parentheses
          let cleanedVoiceName = voice.name.replace(/\s*\(.*\)\s*$/, "").trim();

          let finalName = cleanedVoiceName;

          // Heuristic: If the cleaned voice name still contains the language info, don't prefix it.
          // Otherwise, add the language prefix for clarity.
          if (
            !cleanedVoiceName.toLowerCase().includes(langName.toLowerCase())
          ) {
            finalName = `${langName} - ${cleanedVoiceName}`;
          }

          return {
            voiceURI: voice.voiceURI,
            lang: voice.lang,
            name: finalName,
          };
        });

      options.sort((a, b) => a.name.localeCompare(b.name));

      setLanguages(options);
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = getVoices;
    }

    getVoices();

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  return languages;
};

export const DEFAULT_SUPPORTED_LANGUAGES: LanguageOption[] = [
  { voiceURI: "en-US", lang: "en-US", name: "English (United States)" },
  { voiceURI: "es-ES", lang: "es-ES", name: "Spanish (Spain)" },
  { voiceURI: "fr-FR", lang: "fr-FR", name: "French (France)" },
  { voiceURI: "de-DE", lang: "de-DE", name: "German (Germany)" },
  { voiceURI: "zh-CN", lang: "zh-CN", name: "Chinese (Simplified)" },
];

import React from 'react';
import { TrainerSettings } from '../../hooks/useTrainerSettings';

type UpdateSetting = <K extends keyof TrainerSettings>(key: K, value: TrainerSettings[K]) => void;

type ContentFiltersProps = {
    settings: TrainerSettings;
    isPlaying: boolean;
    onUpdateSetting: UpdateSetting;
};

export const ContentFilters = ({
    settings,
    isPlaying,
    onUpdateSetting,
}: ContentFiltersProps): React.ReactElement => (
    <div className="control-group cgroup" id="selectedType">
        {settings.type === 'words' && (
            <>
                <div className="container">
                    <label htmlFor="callsignsCheckbox">Call Signs</label>
                    <input
                        type="checkbox"
                        id="callsignsCheckbox"
                        checked={settings.enableCallsigns}
                        onChange={(e) => onUpdateSetting('enableCallsigns', e.target.checked)}
                        disabled={isPlaying}
                    />
                </div>
                <div className="container">
                    <label htmlFor="prosignsCheckbox">Prosigns</label>
                    <input
                        type="checkbox"
                        id="prosignsCheckbox"
                        checked={settings.enableProsigns}
                        onChange={(e) => onUpdateSetting('enableProsigns', e.target.checked)}
                        disabled={isPlaying}
                    />
                </div>
            </>
        )}
        {(settings.type === 'random' || settings.type === 'mix') && (
            <>
                <div className="container">
                    <label htmlFor="lettersCheckbox">Letters</label>
                    <input
                        type="checkbox"
                        id="lettersCheckbox"
                        checked={settings.enableLetters}
                        onChange={(e) => onUpdateSetting('enableLetters', e.target.checked)}
                        disabled={isPlaying}
                    />
                </div>
                <div className="container">
                    <label htmlFor="numbersCheckbox">Numbers</label>
                    <input
                        type="checkbox"
                        id="numbersCheckbox"
                        checked={settings.enableNumbers}
                        onChange={(e) => onUpdateSetting('enableNumbers', e.target.checked)}
                        disabled={isPlaying}
                    />
                </div>
                <div className="container">
                    <label htmlFor="symbolsCheckbox">Symbols</label>
                    <input
                        type="checkbox"
                        id="symbolsCheckbox"
                        checked={settings.enableSymbols}
                        onChange={(e) => onUpdateSetting('enableSymbols', e.target.checked)}
                        disabled={isPlaying}
                    />
                </div>
            </>
        )}
    </div>
);



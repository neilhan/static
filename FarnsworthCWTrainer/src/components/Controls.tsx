import React from 'react';
import { TrainerSettings } from '../hooks/useTrainerSettings';

interface ControlsProps {
    settings: TrainerSettings;
    updateSetting: <K extends keyof TrainerSettings>(key: K, value: TrainerSettings[K]) => void;
    isPlaying: boolean;
}

export const Controls = ({
    settings,
    updateSetting,
    isPlaying,
}: ControlsProps) => {
    return (
        <div id="controls">
            <div className="control-group">
                <div className="container">
                    <label htmlFor="wpmSelect">Elements</label>
                    <select 
                        className="select" 
                        id="wpmSelect" 
                        value={settings.wpm} 
                        onChange={(e) => updateSetting('wpm', Number(e.target.value))} 
                        disabled={isPlaying}
                    >
                        <option value="15">15 WPM</option>
                        <option value="18">18 WPM</option>
                        <option value="20">20 WPM</option>
                        <option value="23">23 WPM</option>
                        <option value="25">25 WPM</option>
                        <option value="30">30 WPM</option>
                    </select>
                </div>
                <div className="container">
                    <label htmlFor="fwSelect">Farnsworth</label>
                    <select 
                        className="select" 
                        id="fwSelect" 
                        value={settings.fw} 
                        onChange={(e) => updateSetting('fw', Number(e.target.value))} 
                        disabled={isPlaying}
                    >
                        <option value="3">3 WPM</option>
                        <option value="5">5 WPM</option>
                        <option value="8">8 WPM</option>
                        <option value="10">10 WPM</option>
                        <option value="13">13 WPM</option>
                        <option value="15">15 WPM</option>
                        <option value="18">18 WPM</option>
                        <option value="20">20 WPM</option>
                        <option value="25">25 WPM</option>
                        <option value="30">30 WPM</option>
                    </select>
                </div>
                <div className="container">
                    <label htmlFor="displaySelect">Display</label>
                    <select 
                        className="select" 
                        id="displaySelect" 
                        value={settings.displayMode} 
                        onChange={(e) => updateSetting('displayMode', e.target.value)}
                    >
                        <option value="immediate">Immediate</option>
                        <option value="lingering">Lingering</option>
                        <option value="delayed">Delayed</option>
                    </select>
                </div>
                <div className="container">
                    <label htmlFor="typeSelect">Type</label>
                    <select 
                        className="select" 
                        id="typeSelect" 
                        value={settings.type} 
                        onChange={(e) => updateSetting('type', e.target.value)} 
                        disabled={isPlaying}
                    >
                        <option value="words">Top CW Words</option>
                        <option value="random">Random Groups</option>
                        <option value="mix">Mixed Groups</option>
                        <option value="contact">Contact</option>
                    </select>
                </div>
                <div className="container">
                    <label htmlFor="repeatSelect">Repeat</label>
                    <select 
                        className="select" 
                        id="repeatSelect" 
                        value={settings.repeat} 
                        onChange={(e) => updateSetting('repeat', Number(e.target.value))} 
                        disabled={isPlaying}
                    >
                        <option value="1">1</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </div>
                <div className="container">
                    <label htmlFor="frequencyRange">Tone (Hz)</label>
                    <input 
                        type="range" 
                        id="frequencyRange" 
                        min="400" 
                        max="1000" 
                        step="10" 
                        value={settings.frequency} 
                        onChange={(e) => updateSetting('frequency', Number(e.target.value))}
                    />
                    <div style={{fontSize: '0.8em'}}>{settings.frequency} Hz</div>
                </div>
            </div>

            <div className="control-group cgroup" id="selectedType">
                {settings.type === 'words' && (
                    <>
                        <div className="container">
                            <label htmlFor="callsignsCheckbox">Call Signs</label>
                            <input 
                                type="checkbox" 
                                id="callsignsCheckbox" 
                                checked={settings.enableCallsigns} 
                                onChange={(e) => updateSetting('enableCallsigns', e.target.checked)} 
                                disabled={isPlaying} 
                            />
                        </div>
                        <div className="container">
                            <label htmlFor="prosignsCheckbox">Prosigns</label>
                            <input 
                                type="checkbox" 
                                id="prosignsCheckbox" 
                                checked={settings.enableProsigns} 
                                onChange={(e) => updateSetting('enableProsigns', e.target.checked)} 
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
                                onChange={(e) => updateSetting('enableLetters', e.target.checked)} 
                                disabled={isPlaying} 
                            />
                        </div>
                        <div className="container">
                            <label htmlFor="numbersCheckbox">Numbers</label>
                            <input 
                                type="checkbox" 
                                id="numbersCheckbox" 
                                checked={settings.enableNumbers} 
                                onChange={(e) => updateSetting('enableNumbers', e.target.checked)} 
                                disabled={isPlaying} 
                            />
                        </div>
                        <div className="container">
                            <label htmlFor="symbolsCheckbox">Symbols</label>
                            <input 
                                type="checkbox" 
                                id="symbolsCheckbox" 
                                checked={settings.enableSymbols} 
                                onChange={(e) => updateSetting('enableSymbols', e.target.checked)} 
                                disabled={isPlaying} 
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

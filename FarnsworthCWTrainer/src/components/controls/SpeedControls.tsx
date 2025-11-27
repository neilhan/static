import React from 'react';
import { TrainerSettings } from '../../hooks/useTrainerSettings';

type UpdateSetting = <K extends keyof TrainerSettings>(key: K, value: TrainerSettings[K]) => void;

type SpeedControlsProps = {
    settings: TrainerSettings;
    isPlaying: boolean;
    pagesForType: number;
    pageOptions: number[];
    isContactType: boolean;
    onUpdateSetting: UpdateSetting;
    onUpdatePages: (pages: number) => void;
};

export const SpeedControls = ({
    settings,
    isPlaying,
    pagesForType,
    pageOptions,
    isContactType,
    onUpdateSetting,
    onUpdatePages,
}: SpeedControlsProps): React.ReactElement => (
    <div className="control-group">
        <div className="container">
            <label htmlFor="wpmSelect">Elements</label>
            <select
                className="select"
                id="wpmSelect"
                value={settings.wpm}
                onChange={(e) => onUpdateSetting('wpm', Number(e.target.value))}
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
                onChange={(e) => onUpdateSetting('fw', Number(e.target.value))}
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
                onChange={(e) => onUpdateSetting('displayMode', e.target.value)}
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
                onChange={(e) => onUpdateSetting('type', e.target.value)}
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
                onChange={(e) => onUpdateSetting('repeat', Number(e.target.value))}
                disabled={isPlaying}
            >
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
            </select>
        </div>
        <div className="container">
            <label htmlFor="pagesSelect">Pages</label>
            <select
                className="select"
                id="pagesSelect"
                value={pagesForType}
                onChange={(e) => onUpdatePages(Number(e.target.value))}
                disabled={isPlaying || isContactType}
            >
                {pageOptions.map((num) => (
                    <option key={num} value={num}>
                        {num}
                    </option>
                ))}
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
                onChange={(e) => onUpdateSetting('frequency', Number(e.target.value))}
            />
            <div style={{ fontSize: '0.8em' }}>{settings.frequency} Hz</div>
        </div>
    </div>
);



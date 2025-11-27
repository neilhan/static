import React from 'react';
import './Trainer.css';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InfoSection } from './components/InfoSection';
import { Controls } from './components/Controls';
import { CurrentCharDisplay } from './components/CurrentCharDisplay';
import { useTrainerSettingsContext } from './context/TrainerSettingsContext';
import { useTrainerMessages } from './hooks/useTrainerMessages';
import { useSenderControls } from './hooks/useSenderControls';
import { Layout } from './components/Layout';

function App(): React.ReactElement {
    const { settings } = useTrainerSettingsContext();
    const { messages, regenerateMessages } = useTrainerMessages();
    const {
        senderPlayState,
        senderProgress,
        onNewText,
        onToggleSender,
        onRestart,
        onSkipForward,
    } = useSenderControls(messages, regenerateMessages);

    const shouldPreventScreenLock = senderPlayState === 'playing' || senderPlayState === 'paused';
    useScreenWakeLock(shouldPreventScreenLock);

    return (
        <Layout header={<Header />} footer={<Footer />}>
            <section className="trainer-panel">
                <CurrentCharDisplay
                    displayMode={settings.displayMode}
                    senderProgress={senderProgress}
                />
                <Controls 
                    senderPlayState={senderPlayState}
                    onNewText={onNewText}
                    onToggleSender={onToggleSender}
                    onRestart={onRestart}
                    onSkipForward={onSkipForward}
                    messageContent={
                        senderProgress.displayMessage
                            ? (
                                <>
                                    <span className="hilighted">{senderProgress.doneText}</span>
                                    {senderProgress.remainingText}
                                </>
                            )
                            : ""
                    }
                />
            </section>

            <section className="info-panel">
                <InfoSection />
            </section>
        </Layout>
    );
}

export default App;

import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TrainerSettingsProvider } from './context/TrainerSettingsContext'
import { MorseSenderProvider } from './context/MorseSenderContext'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <TrainerSettingsProvider>
        <MorseSenderProvider>
          <App />
        </MorseSenderProvider>
      </TrainerSettingsProvider>
    </StrictMode>,
  )
}

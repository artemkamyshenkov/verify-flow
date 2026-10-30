import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { App } from './App'
import { StartPage } from './pages/start'
import { ConnectPage } from './pages/connect'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<StartPage />} />
            <Route path="sessions/:sessionId/connect" element={<ConnectPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)

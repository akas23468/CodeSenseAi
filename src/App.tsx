import { Route, Routes } from 'react-router-dom'
import { AppProvider } from './state'
import { ToastProvider } from './components/ui'
import AppShell from './components/layout/AppShell'
import OverviewPage from './pages/OverviewPage'
import PlaceholderPage from './pages/PlaceholderPage'

export const NAV_PLACEHOLDERS: Record<string, string> = {
  repositories: 'Repositories', 'code-review': 'Code Review', assistant: 'AI Assistant',
  'change-review': 'Change Review', reports: 'Reports', settings: 'Settings', help: 'Help and documentation',
}
export default function App() {
  return <ToastProvider><AppProvider>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        {Object.entries(NAV_PLACEHOLDERS).map(([p, t]) => <Route key={p} path={p} element={<PlaceholderPage title={t} />} />)}
        <Route path="*" element={<PlaceholderPage title="Page not found" />} />
      </Route>
    </Routes>
  </AppProvider></ToastProvider>
}

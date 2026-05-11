import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ChronoPage from './pages/ChronoPage'
import SessionsPage from './pages/SessionsPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/chrono" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout><Navigate to="/chrono" replace /></Layout></ProtectedRoute>} />
      <Route path="/chrono" element={<ProtectedRoute><Layout><ChronoPage /></Layout></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Layout><SessionsPage /></Layout></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Layout><ProgressPage /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/chrono" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

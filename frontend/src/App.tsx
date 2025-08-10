import { Routes, Route, Link, Navigate } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import DiagnosticsPage from './pages/DiagnosticsPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mpiloshini RMH 24</h1>
        <nav className="flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/diagnose/:id" element={<DiagnosticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

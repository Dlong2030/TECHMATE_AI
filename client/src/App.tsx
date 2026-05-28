import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Classroom from './pages/Classroom'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/classroom/:characterId" element={
          <ProtectedRoute>
            <Classroom />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
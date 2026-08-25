import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AlertProvider } from './context/AlertContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import CitizenDashboard from './modules/citizen/pages/CitizenDashboard'
import ProfileSettings from './modules/citizen/pages/ProfileSettings'
import TechnicianDashboard from './modules/technician/pages/TechnicianDashboard'
import TechnicianIncidents from './modules/technician/pages/TechnicianIncidents'
import InspectorDashboard from './modules/inspector/pages/InspectorDashboard'
import SocialCases from './modules/inspector/pages/SocialCases'
import CaseDetail from './modules/inspector/pages/CaseDetail'
import TransferRequests from './modules/inspector/pages/TransferRequests'
import SupervisorDashboard from './modules/supervisor/pages/SupervisorDashboard'
import ForgotPassword from './pages/ForgotPassword'

export default function App() {
  return (
    <AuthProvider>
      {/* basename sigue al `base` de Vite — en GitHub Pages la app vive en /<repo>/ */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AlertProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['Citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />

          <Route path="/technician" element={
            <ProtectedRoute roles={['Technician']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />

          <Route path="/technician/incidents" element={
            <ProtectedRoute roles={['Technician']}>
              <TechnicianIncidents />
            </ProtectedRoute>
          } />

          <Route path="/inspector" element={
            <ProtectedRoute roles={['Inspector']}>
              <InspectorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/inspector/cases" element={
            <ProtectedRoute roles={['Inspector']}>
              <SocialCases />
            </ProtectedRoute>
          } />

          <Route path="/inspector/case/:id" element={
            <ProtectedRoute roles={['Inspector']}>
              <CaseDetail />
            </ProtectedRoute>
          } />

          <Route path="/inspector/transfers" element={
            <ProtectedRoute roles={['Inspector']}>
              <TransferRequests />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute roles={['Citizen']}>
              <ProfileSettings />
            </ProtectedRoute>
          } />

          <Route path="/supervisor" element={
            <ProtectedRoute roles={['Supervisor']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </AlertProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

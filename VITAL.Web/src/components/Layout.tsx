import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTour } from '../tour/TourContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { hasTour, startTour } = useTour()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel: Record<string, string> = {
    Citizen: 'Ciudadano',
    Technician: 'Técnico',
    Inspector: 'Inspector',
    Administrator: 'Administrador'
  }

  const navLinks = () => {
    if (user?.role === 'Citizen') return (
      <Link to="/dashboard" className="hover:text-green-300 transition-colors">Inicio</Link>
    )
    if (user?.role === 'Technician') return (
      <Link to="/technician" className="hover:text-green-300 transition-colors">Panel Técnico</Link>
    )
    if (user?.role === 'Inspector') return (
      <Link to="/inspector" className="hover:text-green-300 transition-colors">Casos Asignados</Link>
    )
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1a5276] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-wide">⚡ VITAL</span>
            <nav className="hidden md:flex gap-5 text-sm">{navLinks()}</nav>
          </div>
          <div className="flex items-center gap-3">
            {hasTour && (
              <button
                onClick={startTour}
                title="Ver tutorial"
                className="bg-white/10 hover:bg-white/20 text-sm w-8 h-8 rounded-lg transition-colors"
              >
                ❓
              </button>
            )}
            {user?.role !== 'Citizen' && (
              <span className="text-sm opacity-80">
                {user?.firstName} · <span className="text-green-300">{roleLabel[user?.role ?? ''] ?? user?.role}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="bg-[#1a5276] text-white/50 text-center py-3 text-xs">
        VITAL © 2024 · Sistema Inteligente de Gestión Eléctrica
      </footer>
    </div>
  )
}

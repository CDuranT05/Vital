import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../api/auth'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

const DEMO_CREDENTIALS = [
  { role: 'Ciudadano',   icon: '🏠', card: 'V-14523187', pass: 'Demo123!' },
  { role: 'Técnico',     icon: '🔧', card: 'T-001',       pass: 'Demo123!' },
  { role: 'Inspector',   icon: '📋', card: 'I-001',       pass: 'Inspector123!' },
  { role: 'Supervisor',  icon: '📊', card: 'SUP-001',     pass: 'Demo123!' },
]

export default function Login() {
  const [identityCard, setIdentityCard] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginApi(identityCard, password)
      login(user)
      if (user.role === 'Citizen') navigate('/dashboard')
      else if (user.role === 'Technician') navigate('/technician')
      else if (user.role === 'Inspector') navigate('/inspector')
      else if (user.role === 'Supervisor') navigate('/supervisor')
      else navigate('/dashboard')
    } catch {
      setError('Cédula o contraseña incorrecta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] to-[#0d2f4a] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-3xl font-bold text-[#1a5276]">VITAL</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema Inteligente de Gestión Eléctrica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de Identidad</label>
            <input
              type="text"
              value={identityCard}
              onChange={e => setIdentityCard(e.target.value)}
              placeholder="Ej: V-12345678"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-[#1a5276] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          El sistema detecta automáticamente tu rol
        </p>

        {DEMO && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-center text-xs text-gray-400 mb-3 tracking-wide uppercase">
              Cuentas de demostración
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.card}
                  type="button"
                  onClick={() => { setIdentityCard(c.card); setPassword(c.pass) }}
                  className="text-left bg-gray-50 hover:bg-[#1a5276]/5 border border-gray-200 hover:border-[#1a5276]/30 rounded-xl px-3 py-2.5 transition-colors group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{c.icon}</span>
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-[#1a5276]">{c.role}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono leading-tight">{c.card}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-300 mt-3">
              Toca una cuenta para autocompletar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

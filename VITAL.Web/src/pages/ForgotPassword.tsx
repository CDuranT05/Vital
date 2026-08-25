import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

type Step = 'request' | 'verify' | 'reset' | 'done'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caracteres mínimo', ok: password.length >= 8 },
    { label: 'Mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
    { label: 'Carácter especial', ok: /[!@#$%^&*()\-_=+[\]{}|;':",./<>?]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const color = score <= 2 ? 'bg-red-400' : score <= 3 ? 'bg-amber-400' : score === 4 ? 'bg-blue-400' : 'bg-emerald-500'
  const label = score <= 2 ? 'Débil' : score <= 3 ? 'Regular' : score === 4 ? 'Buena' : 'Fuerte'
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${(score / 5) * 100}%` }} />
        </div>
        <span className="text-xs text-gray-500 w-12">{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-emerald-600' : 'text-gray-400'}`}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [identityCard, setIdentityCard] = useState('')
  const [devToken, setDevToken] = useState<string | null>(null)

  // Step 2
  const [token, setToken] = useState('')

  // Step 3
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const apiError = (e: unknown) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error inesperado.'

  // ── Paso 1: Solicitar código ──────────────────────────────────────────────
  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    if (!identityCard.trim()) { setError('Ingresa tu cédula.'); return }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/password-reset/request', { identityCard: identityCard.trim() })
      setDevToken(data.devToken ?? null)
      setStep('verify')
    } catch (e) {
      setError(apiError(e))
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: Verificar token ───────────────────────────────────────────────
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (!token.trim()) { setError('Ingresa el código.'); return }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/password-reset/validate', {
        identityCard: identityCard.trim(), token: token.trim()
      })
      if (!data.valid) { setError('El código es incorrecto, expiró o ya fue utilizado.'); setLoading(false); return }
      setStep('reset')
    } catch (e) {
      setError(apiError(e))
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 3: Nueva contraseña ──────────────────────────────────────────────
  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/password-reset/confirm', {
        identityCard: identityCard.trim(), token: token.trim(), newPassword
      })
      setStep('done')
    } catch (e) {
      setError(apiError(e))
    } finally {
      setLoading(false)
    }
  }

  const stepLabels = ['Identificación', 'Verificación', 'Nueva clave']
  const stepIndex = step === 'request' ? 0 : step === 'verify' ? 1 : step === 'reset' ? 2 : 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] to-[#0d2f4a] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-xl font-bold text-gray-800">Restablecer contraseña</h1>
          <p className="text-gray-400 text-sm mt-1">VITAL — Acceso seguro</p>
        </div>

        {/* Stepper */}
        {step !== 'done' && (
          <div className="flex items-center mb-7">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < stepIndex ? 'bg-emerald-500 text-white' :
                    i === stepIndex ? 'bg-[#1a5276] text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${i === stepIndex ? 'text-[#1a5276]' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIndex ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PASO 1 ── */}
        {step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              Ingresa tu cédula de identidad y te enviaremos un código para restablecer tu contraseña.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula de identidad</label>
              <input type="text" value={identityCard} onChange={e => setIdentityCard(e.target.value)}
                placeholder="Ej: V-12345678" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Verificando...' : 'Solicitar código'}
            </button>
            <button type="button" onClick={() => navigate('/login')}
              className="w-full text-gray-400 hover:text-gray-600 text-sm py-2">
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        {/* ── PASO 2 ── */}
        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              <p className="font-semibold mb-1">⏱ El código expira en 15 minutos</p>
              <p>Tienes máximo 3 intentos. Si fallas los 3, deberás solicitar un código nuevo.</p>
            </div>

            {/* En desarrollo mostramos el token — en producción se envía por SMS/email */}
            {devToken && (
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Modo desarrollo — código generado:</p>
                <p className="text-emerald-400 font-mono text-xs break-all select-all">{devToken}</p>
                <p className="text-xs text-gray-500 mt-1">En producción este código se enviaría por SMS</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de restablecimiento</label>
              <input type="text" value={token} onChange={e => setToken(e.target.value)}
                placeholder="Pega el código aquí" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            <button type="button" onClick={() => { setStep('request'); setError(''); setToken('') }}
              className="w-full text-gray-400 hover:text-gray-600 text-sm py-2">
              ← Solicitar un nuevo código
            </button>
          </form>
        )}

        {/* ── PASO 3 ── */}
        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">
              ✓ Código verificado. Crea tu nueva contraseña.
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <button type="button" onClick={() => setShowPasswords(p => !p)}
                className="text-xs text-[#1a5276] hover:underline">
                {showPasswords ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <div>
              <input type={showPasswords ? 'text' : 'password'}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              <PasswordStrength password={newPassword} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input type={showPasswords ? 'text' : 'password'}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••" required
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a5276] ${
                  confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-gray-300'
                }`} />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit"
              disabled={loading || (!!confirmPassword && confirmPassword !== newPassword)}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}

        {/* ── ÉXITO ── */}
        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-bold text-gray-800">¡Contraseña restablecida!</h2>
            <p className="text-gray-500 text-sm">
              Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button onClick={() => navigate('/login')}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-3 rounded-lg transition-colors">
              Iniciar sesión
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

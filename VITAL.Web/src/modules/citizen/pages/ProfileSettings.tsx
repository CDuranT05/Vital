import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { getProfile, changePassword, changeEmail, changePhone, type ProfileData } from '../../../api/profile'

type Section = 'email' | 'phone' | 'password'

interface SectionState {
  loading: boolean
  error: string
  success: string
  confirm: boolean  // muestra el paso de confirmación con contraseña
}

const defaultState = (): SectionState => ({ loading: false, error: '', success: '', confirm: false })

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caracteres mínimo', ok: password.length >= 8 },
    { label: 'Mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Minúscula', ok: /[a-z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
    { label: 'Carácter especial', ok: /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const color = score <= 2 ? 'bg-red-400' : score <= 3 ? 'bg-amber-400' : score === 4 ? 'bg-blue-400' : 'bg-emerald-500'
  const label = score <= 2 ? 'Débil' : score <= 3 ? 'Regular' : score === 4 ? 'Buena' : 'Fuerte'

  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${(score / 5) * 100}%` }} />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-emerald-600' : 'text-gray-400'}`}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ProfileSettings() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [states, setStates] = useState<Record<Section, SectionState>>({
    email: defaultState(), phone: defaultState(), password: defaultState()
  })

  // email fields
  const [newEmail, setNewEmail] = useState('')
  const [emailPass, setEmailPass] = useState('')

  // phone fields
  const [newPhone, setNewPhone] = useState('')
  const [phonePass, setPhonePass] = useState('')

  // password fields
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  const setState = (section: Section, patch: Partial<SectionState>) =>
    setStates(prev => ({ ...prev, [section]: { ...prev[section], ...patch } }))

  const apiError = (e: unknown) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error inesperado.'

  const handleChangeEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) { setState('email', { error: 'Ingresa el nuevo correo.' }); return }
    setState('email', { loading: true, error: '', success: '' })
    try {
      await changeEmail(emailPass, newEmail.trim())
      setProfile(prev => prev ? { ...prev, email: newEmail.trim() } : prev)
      setState('email', { success: 'Correo actualizado correctamente.', loading: false, confirm: false })
      setNewEmail(''); setEmailPass('')
    } catch (e) {
      setState('email', { error: apiError(e), loading: false })
    }
  }

  const handleChangePhone = async (e: FormEvent) => {
    e.preventDefault()
    if (!newPhone.trim()) { setState('phone', { error: 'Ingresa el nuevo teléfono.' }); return }
    setState('phone', { loading: true, error: '', success: '' })
    try {
      await changePhone(phonePass, newPhone.trim())
      setProfile(prev => prev ? { ...prev, phone: newPhone.trim() } : prev)
      setState('phone', { success: 'Teléfono actualizado correctamente.', loading: false, confirm: false })
      setNewPhone(''); setPhonePass('')
    } catch (e) {
      setState('phone', { error: apiError(e), loading: false })
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setState('password', { error: 'Las contraseñas no coinciden.' }); return }
    setState('password', { loading: true, error: '', success: '' })
    try {
      await changePassword(currentPass, newPass)
      setState('password', { success: 'Contraseña actualizada. Por seguridad, vuelve a iniciar sesión.', loading: false, confirm: false })
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (e) {
      setState('password', { error: apiError(e), loading: false })
    }
  }

  const s = (section: Section) => states[section]

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">←</button>
          <h1 className="text-xl font-bold text-gray-800">Configuración de Cuenta</h1>
        </div>

        {/* Datos actuales */}
        {profile && (
          <div className="bg-[#1a5276]/5 border border-[#1a5276]/20 rounded-xl p-4">
            <p className="text-xs font-bold text-[#1a5276] uppercase tracking-wider mb-2">Tu cuenta</p>
            <p className="font-semibold text-gray-800">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-gray-500">🪪 {profile.identityCard}</p>
            {profile.email && <p className="text-sm text-gray-500">✉️ {profile.email}</p>}
            {profile.phone && <p className="text-sm text-gray-500">📞 {profile.phone}</p>}
          </div>
        )}

        {/* ── Cambiar correo ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setState('email', { confirm: !s('email').confirm, error: '', success: '' })}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✉️</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">Cambiar correo electrónico</p>
                <p className="text-xs text-gray-400">{profile?.email ?? 'Sin correo registrado'}</p>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${s('email').confirm ? 'rotate-90' : ''}`}>›</span>
          </button>

          {s('email').confirm && (
            <form onSubmit={handleChangeEmail} className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo correo electrónico</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="nuevo@correo.com" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirma con tu contraseña actual</label>
                <input type="password" value={emailPass} onChange={e => setEmailPass(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              {s('email').error && <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{s('email').error}</p>}
              {s('email').success && <p className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">✓ {s('email').success}</p>}
              <button type="submit" disabled={s('email').loading}
                className="w-full bg-[#1a5276] hover:bg-[#154360] text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
                {s('email').loading ? 'Actualizando...' : 'Actualizar correo'}
              </button>
            </form>
          )}
        </div>

        {/* ── Cambiar teléfono ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setState('phone', { confirm: !s('phone').confirm, error: '', success: '' })}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📞</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">Cambiar teléfono</p>
                <p className="text-xs text-gray-400">{profile?.phone ?? 'Sin teléfono registrado'}</p>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${s('phone').confirm ? 'rotate-90' : ''}`}>›</span>
          </button>

          {s('phone').confirm && (
            <form onSubmit={handleChangePhone} className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo número de teléfono</label>
                <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  placeholder="04141234567" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
                <p className="text-xs text-gray-400 mt-1">Formato: 04XXXXXXXXX o +58XXXXXXXXXX</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirma con tu contraseña actual</label>
                <input type="password" value={phonePass} onChange={e => setPhonePass(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              {s('phone').error && <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{s('phone').error}</p>}
              {s('phone').success && <p className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">✓ {s('phone').success}</p>}
              <button type="submit" disabled={s('phone').loading}
                className="w-full bg-[#1a5276] hover:bg-[#154360] text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
                {s('phone').loading ? 'Actualizando...' : 'Actualizar teléfono'}
              </button>
            </form>
          )}
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setState('password', { confirm: !s('password').confirm, error: '', success: '' })}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">Cambiar contraseña</p>
                <p className="text-xs text-gray-400">Mínimo 8 caracteres con mayúscula, número y símbolo</p>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${s('password').confirm ? 'rotate-90' : ''}`}>›</span>
          </button>

          {s('password').confirm && (
            <form onSubmit={handleChangePassword} className="px-5 pb-5 space-y-3 border-t border-gray-50 pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Campos de contraseña</span>
                <button type="button" onClick={() => setShowPasswords(p => !p)}
                  className="text-xs text-[#1a5276] hover:underline">
                  {showPasswords ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña actual</label>
                <input type={showPasswords ? 'text' : 'password'}
                  value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nueva contraseña</label>
                <input type={showPasswords ? 'text' : 'password'}
                  value={newPass} onChange={e => setNewPass(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]" />
                <PasswordStrength password={newPass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nueva contraseña</label>
                <input type={showPasswords ? 'text' : 'password'}
                  value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  placeholder="••••••••" required
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] ${
                    confirmPass && confirmPass !== newPass ? 'border-red-300' : 'border-gray-300'
                  }`} />
                {confirmPass && confirmPass !== newPass && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>
              {s('password').error && <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{s('password').error}</p>}
              {s('password').success && <p className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">✓ {s('password').success}</p>}
              <button type="submit"
                disabled={s('password').loading || (!!confirmPass && confirmPass !== newPass)}
                className="w-full bg-[#1a5276] hover:bg-[#154360] text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
                {s('password').loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">
          🔒 Todos los cambios requieren verificación con tu contraseña actual
        </p>
      </div>
    </Layout>
  )
}

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAlerts, acknowledgeIncident } from '../api/incidents'
import type { IncidentAlert } from '../api/incidents'
import { useAuth } from './AuthContext'
import { useTour } from '../tour/TourContext'

interface AlertContextType {
  alerts: IncidentAlert[]
}

const AlertContext = createContext<AlertContextType>({ alerts: [] })

export function AlertProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // El tour del técnico retiene la alerta hasta presentarla en su momento
  const { alertsHeld } = useTour()
  const isTechnician = user?.role === 'Technician'

  const [alerts, setAlerts] = useState<IncidentAlert[]>([])
  const [ackLoading, setAckLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Alertas omitidas por el técnico — no vuelven a aparecer en esta sesión
  const dismissedRef = useRef<Set<string>>(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    if (!isTechnician) return

    const fetchAlerts = async () => {
      try {
        const data = await getAlerts()
        setAlerts(data.filter(a => !dismissedRef.current.has(a.id)))
      } catch {
        // silencioso
      }
    }

    fetchAlerts()
    intervalRef.current = setInterval(fetchAlerts, 15000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isTechnician])

  const handleAcknowledge = useCallback(async (id: string) => {
    setAckLoading(true)
    try {
      await acknowledgeIncident(id)
      setAlerts(prev => prev.filter(a => a.id !== id))
      navigate('/technician/incidents')
    } catch {
      // silencioso
    } finally {
      setAckLoading(false)
    }
  }, [navigate])

  const handleDismiss = useCallback((id: string) => {
    dismissedRef.current.add(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const currentAlert = alerts[0] ?? null

  return (
    <AlertContext.Provider value={{ alerts }}>
      {children}

      {isTechnician && currentAlert && !alertsHeld && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div data-tour="emergency-alert" className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-red-600 px-5 py-4 flex items-center gap-3">
              <span className="text-3xl animate-bounce">🚨</span>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">EMERGENCIA ELÉCTRICA</h3>
                <p className="text-red-100 text-xs">Requiere atención inmediata</p>
              </div>
              {alerts.length > 1 && (
                <span className="ml-auto bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  +{alerts.length - 1} más
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ciudadano</p>
                <p className="font-bold text-gray-800 text-base">{currentAlert.citizenName}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>🪪 {currentAlert.citizenIdentityCard}</p>
                  <p>📞 {currentAlert.citizenPhone || 'Sin teléfono registrado'}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Ubicación</p>
                <p className="font-semibold text-blue-800 text-sm">Contrato {currentAlert.contractNumber}</p>
                <p className="text-sm text-blue-700">📍 {currentAlert.serviceAddress}</p>
                {currentAlert.parish && (
                  <p className="text-blue-500 text-xs">{currentAlert.parish}, {currentAlert.municipality}, {currentAlert.state}</p>
                )}
              </div>

              <p className="text-xs text-gray-400 text-center">
                Reportado: {new Date(currentAlert.reportedAt).toLocaleString('es-VE', {
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                })}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDismiss(currentAlert.id)}
                  disabled={ackLoading}
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  Omitir
                </button>
                <button
                  onClick={() => handleAcknowledge(currentAlert.id)}
                  disabled={ackLoading}
                  className="flex-[2] bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl font-bold text-base transition-all disabled:opacity-60 shadow-lg shadow-red-200"
                >
                  {ackLoading ? 'Procesando...' : '✅ Atender Emergencia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  return useContext(AlertContext)
}

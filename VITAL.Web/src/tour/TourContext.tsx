import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TOURS, routeMatches, type TourStep } from './tourSteps'
import TourCard from './TourCard'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

interface TourContextType {
  /** Hay tutorial disponible para el rol actual (solo en demo) */
  hasTour: boolean
  startTour: () => void
  /** Las alertas de emergencia se retienen hasta que el tour las presente */
  alertsHeld: boolean
}

const TourContext = createContext<TourContextType>({ hasTour: false, startTour: () => {}, alertsHeld: false })

export const useTour = () => useContext(TourContext)

// Un paso está "listo" cuando el usuario está en su ruta y su elemento existe
const stepReady = (step: TourStep, pathname: string): boolean =>
  routeMatches(step, pathname) &&
  (!step.target || !!document.querySelector(`[data-tour="${step.target}"]`))

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const steps = (user && TOURS[user.role]) || null
  const [index, setIndex] = useState<number | null>(null) // null = tour inactivo

  const doneKey = user ? `vital_tour_${user.role}` : ''

  const endTour = useCallback(() => {
    setIndex(null)
    if (doneKey) sessionStorage.setItem(doneKey, '1')
  }, [doneKey])

  const nextStep = useCallback(() => {
    if (index === null || !steps) return
    const current = steps[index]
    // Algunos pasos llevan al usuario directo a la siguiente pantalla del flujo
    if (current?.navigateTo) navigate(current.navigateTo)
    const nextIdx = current?.nextId
      ? steps.findIndex(s => s.id === current.nextId)
      : index + 1
    if (nextIdx < 0 || nextIdx >= steps.length) {
      endTour()
      return
    }
    setIndex(nextIdx)
  }, [index, steps, navigate, endTour])

  // Evita que el auto-inicio se dispare de nuevo al navegar con el tour activo
  const startedRef = useRef(false)

  const startTour = useCallback(() => {
    if (steps) {
      startedRef.current = true
      setIndex(0)
    }
  }, [steps])

  // Al cambiar de rol (nuevo login) se permite el auto-inicio otra vez
  useEffect(() => {
    startedRef.current = false
  }, [user?.role])

  // Auto-inicio la primera vez que el rol entra en la sesión — solo cuando el
  // usuario ya está en la pantalla inicial de su panel (nunca en el login)
  useEffect(() => {
    if (!DEMO || !steps || !doneKey) return
    if (startedRef.current) return
    if (sessionStorage.getItem(doneKey)) return
    if (!routeMatches(steps[0], location.pathname)) return
    const t = setTimeout(() => {
      startedRef.current = true
      setIndex(0)
    }, 900)
    return () => clearTimeout(t)
  }, [steps, doneKey, location.pathname])

  // Al pasar por el login el tour se cierra y se limpian las marcas de "visto":
  // cada nuevo ingreso a un rol recibe su tutorial desde el principio
  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/forgot-password') {
      setIndex(null)
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('vital_tour_'))
        .forEach(k => sessionStorage.removeItem(k))
    }
  }, [location.pathname])

  // Avance automático: los pasos 'action' avanzan cuando el siguiente paso está
  // listo, y los pasos con advanceWhenGone cuando su elemento desaparece
  useEffect(() => {
    if (!DEMO || !steps || index === null) return
    const step = steps[index]
    if (!step) return
    const isAction = step.advance === 'action'
    if (!isAction && !step.advanceWhenGone) return
    const next = steps[index + 1]
    const check = () => {
      // Saltos condicionales: el usuario tomó otro camino (ej. rechazó la solicitud)
      if (isAction && step.jumpIf) {
        for (const jump of step.jumpIf) {
          if (document.querySelector(`[data-tour="${jump.target}"]`)) {
            const to = steps.findIndex(s => s.id === jump.toId)
            if (to >= 0) { setIndex(to); return }
          }
        }
      }
      // Pasos "avanza al cerrar": avanzan cuando su elemento desaparece
      // (en pasos de acción es la ÚNICA regla — el siguiente paso puede
      // apuntar a un elemento siempre visible, como las pestañas)
      if (step.advanceWhenGone && step.target) {
        if (routeMatches(step, location.pathname) &&
            !document.querySelector(`[data-tour="${step.target}"]`)) {
          setIndex(index + 1)
        }
        return
      }
      if (isAction && next && stepReady(next, location.pathname)) setIndex(index + 1)
    }
    check()
    const t = setInterval(check, 150)
    return () => clearInterval(t)
  }, [steps, index, location.pathname])

  // El tour del técnico retiene la alerta de emergencia hasta el paso que la
  // presenta (releaseAlerts). Si el tour ya se vio o se cerró, no se retiene.
  const releaseIdx = steps ? steps.findIndex(s => s.releaseAlerts) : -1
  const tourSeen = doneKey ? !!sessionStorage.getItem(doneKey) : true
  const alertsHeld = DEMO && !!steps && releaseIdx >= 0 &&
    (index !== null ? index < releaseIdx : !tourSeen)

  let step = DEMO && steps && index !== null ? steps[index] : null

  // Transición entre páginas: un paso de acción anclado a un elemento que ya no
  // está en la ruta actual se oculta (el detector avanzará en milisegundos) en
  // vez de mostrarse centrado por una fracción de segundo
  if (step && step.advance === 'action' && step.target && !routeMatches(step, location.pathname)) {
    step = null
  }

  return (
    <TourContext.Provider value={{ hasTour: DEMO && !!steps, startTour, alertsHeld }}>
      {children}
      {step && (
        <TourCard
          step={step}
          index={index!}
          total={steps!.length}
          pathname={location.pathname}
          onNext={nextStep}
          onSkip={nextStep}
          onExit={endTour}
        />
      )}
    </TourContext.Provider>
  )
}

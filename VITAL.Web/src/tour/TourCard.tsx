import { useEffect, useRef, useState } from 'react'
import { routeMatches, type TourStep } from './tourSteps'

interface TourCardProps {
  step: TourStep
  index: number
  total: number
  pathname: string
  onNext: () => void
  onSkip: () => void
  onExit: () => void
}

interface Rect { top: number; left: number; width: number; height: number }

const CARD_W = 336

// Tarjeta flotante del tutorial: resalta el elemento objetivo con un anillo,
// se posiciona junto a él (hoja inferior compacta en móvil) y puede
// arrastrarse desde su barra de título si tapa algo.
export default function TourCard({ step, index, total, pathname, onNext, onSkip, onExit }: TourCardProps) {
  const [rect, setRect] = useState<Rect | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardH, setCardH] = useState(230)

  // Desplazamiento manual (arrastre) — se reinicia en cada paso
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)

  useEffect(() => { setDrag({ x: 0, y: 0 }) }, [step])

  // Mide la altura real de la tarjeta (el texto varía por paso)
  useEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
  }, [step])

  // Sigue la posición del elemento objetivo (aparece tarde, scroll, resize)
  useEffect(() => {
    let scrolled = false
    const track = () => {
      if (!step.target || !routeMatches(step, pathname)) { setRect(null); return }
      const el = document.querySelector(`[data-tour="${step.target}"]`)
      if (!el) { setRect(null); return }
      if (!scrolled) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        scrolled = true
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    track()
    const t = setInterval(track, 300)
    return () => clearInterval(t)
  }, [step, pathname])

  // En móvil la tarjeta es una hoja inferior compacta
  const isMobile = window.innerWidth < 640

  // ── Arrastre desde la barra de título ──
  const onDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragState.current = { px: e.clientX, py: e.clientY, ox: drag.x, oy: drag.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent) => {
    const s = dragState.current
    if (!s) return
    const maxUp = window.innerHeight - (isMobile ? cardH : 80) - 8
    const ny = Math.min(Math.max(s.oy + e.clientY - s.py, -maxUp), window.innerHeight - 80)
    const nx = isMobile ? 0 : s.ox + e.clientX - s.px
    setDrag({ x: nx, y: ny })
  }
  const onDragEnd = () => { dragState.current = null }

  const pad = 6
  let cardStyle: React.CSSProperties | undefined
  if (rect && !isMobile) {
    const leftAligned = Math.min(Math.max(rect.left, 8), window.innerWidth - CARD_W - 8)
    const spaceBelow = window.innerHeight - (rect.top + rect.height)
    const spaceLeft = rect.left
    const spaceRight = window.innerWidth - (rect.left + rect.width)
    const sideTop = Math.min(Math.max(rect.top, 16), window.innerHeight - cardH - 16)

    if (spaceBelow >= cardH + 24) {
      cardStyle = { left: leftAligned, top: rect.top + rect.height + pad + 10 }
    } else if (spaceLeft >= CARD_W + 24) {
      cardStyle = { left: rect.left - CARD_W - pad - 12, top: sideTop }
    } else if (spaceRight >= CARD_W + 24) {
      cardStyle = { left: rect.left + rect.width + pad + 12, top: sideTop }
    } else if (rect.top >= cardH + 24) {
      cardStyle = { left: leftAligned, top: rect.top - cardH - pad - 10 }
    } else {
      cardStyle = { left: leftAligned, bottom: 16 }
    }
  }

  // Transformación final = centrado (si aplica) + arrastre manual
  const dragTransform = `translate(${drag.x}px, ${drag.y}px)`
  const centered = !isMobile && !rect

  return (
    <>
      {/* Anillo de resaltado + oscurecimiento alrededor del objetivo */}
      {rect && (
        <div
          className="fixed z-[70] rounded-xl border-2 border-[#1a5276] pointer-events-none transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45), 0 0 0 4px rgba(26, 82, 118, 0.25)',
          }}
        />
      )}
      {!rect && <div className="fixed inset-0 z-[70] bg-slate-900/45 pointer-events-none" />}

      {/* Tarjeta */}
      <div
        ref={cardRef}
        className={
          isMobile
            ? 'fixed z-[71] inset-x-0 bottom-0'
            : `fixed z-[71] w-[336px] max-w-[calc(100vw-16px)] ${centered ? 'left-1/2 top-1/2' : ''}`
        }
        style={{
          ...(isMobile ? {} : cardStyle),
          transform: centered
            ? `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px))`
            : dragTransform,
        }}
      >
        <div className={`bg-white shadow-2xl border border-gray-100 overflow-hidden ${isMobile ? 'rounded-t-2xl' : 'rounded-2xl'}`}>
          {/* Barra de título — también es el asa de arrastre */}
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            style={{ touchAction: 'none' }}
            className="bg-[#1a5276] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <span className="text-white/80 text-[11px] sm:text-xs font-semibold">
              ⠿ Tutorial · Paso {index + 1} de {total}
            </span>
            <button onClick={onExit} title="Salir del tutorial" className="text-white/60 hover:text-white text-lg leading-none">×</button>
          </div>

          <div className="p-3 sm:p-4">
            <p className="font-bold text-gray-800 text-sm mb-1">{step.title}</p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.text}</p>

            <div className="flex items-center gap-2 mt-2.5 sm:mt-4">
              <button
                onClick={onSkip}
                className="text-xs text-gray-400 hover:text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Omitir
              </button>
              {step.advance === 'next' ? (
                <button
                  onClick={onNext}
                  className="ml-auto bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-semibold px-4 py-1.5 sm:py-2 rounded-lg transition-colors"
                >
                  {index + 1 === total ? 'Finalizar' : 'Siguiente →'}
                </button>
              ) : (
                <span className="ml-auto flex items-center gap-1.5 text-[11px] sm:text-xs text-[#1a5276] font-medium px-2">
                  <span className="w-2 h-2 rounded-full bg-[#1a5276] animate-pulse" />
                  Realiza la acción para continuar
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

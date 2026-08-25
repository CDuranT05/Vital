import { useState } from 'react'
import { MAX_VISITS_PER_DAY, MONTH_NAMES, DAY_NAMES, dateKey, isClosedDay, isHoliday } from '../data/calendarUtils'

interface MonthCalendarProps {
  /** Cantidad de visitas programadas por día (clave YYYY-MM-DD) */
  visitCountByDay: Record<string, number>
  /** 'view': solo los días con visitas son clicables · 'select': se eligen días hábiles con cupo */
  mode: 'view' | 'select'
  selectedDay?: string | null
  onDayClick?: (dayKey: string) => void
}

export default function MonthCalendar({ visitCountByDay, mode, selectedDay, onDayClick }: MonthCalendarProps) {
  const today = new Date()
  const todayKey = dateKey(today)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7 // semana inicia lunes

  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]

  return (
    <div>
      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 font-bold">‹</button>
        <p className="font-bold text-gray-800 text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</p>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 font-bold">›</button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <p key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</p>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />

          const key = dateKey(date)
          const closed = isClosedDay(date)
          const count = visitCountByDay[key] ?? 0
          const full = count >= MAX_VISITS_PER_DAY
          const isPast = key < todayKey
          const isToday = key === todayKey
          const isSelected = selectedDay === key

          const clickable = mode === 'view'
            ? count > 0
            : !closed && !full && !isPast

          let cls = 'relative h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm transition-all '
          if (isSelected) {
            cls += 'bg-[#1a5276] text-white font-bold shadow-md '
          } else if (closed) {
            cls += 'bg-gray-100 text-gray-300 '
          } else if (full) {
            cls += mode === 'select'
              ? 'bg-red-50 text-red-300 border border-red-100 '
              : 'bg-red-50 text-red-700 border border-red-200 font-semibold '
          } else if (count > 0) {
            cls += 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold '
          } else {
            cls += isPast ? 'text-gray-300 ' : 'text-gray-600 '
            if (clickable) cls += 'hover:bg-blue-50 hover:text-[#1a5276] '
          }
          if (clickable) cls += 'cursor-pointer active:scale-95 '
          if (isToday && !isSelected) cls += 'ring-1 ring-[#1a5276]/40 '

          return (
            <button
              key={key}
              disabled={!clickable}
              onClick={() => onDayClick?.(key)}
              className={cls}
              title={
                closed ? (isHoliday(date) ? 'Feriado — cerrado' : 'Fin de semana — cerrado')
                : full ? 'Día lleno (2 visitas)'
                : count > 0 ? `${count} visita programada` : undefined
              }
            >
              {date.getDate()}
              {count > 0 && !isSelected && (
                <span className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: count }, (_, d) => (
                    <span key={d} className={`w-1 h-1 rounded-full ${full ? 'bg-red-400' : 'bg-amber-400'}`} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300" /> Con visitas</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-300" /> Lleno (2/2)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-200" /> Cerrado</span>
      </div>
    </div>
  )
}

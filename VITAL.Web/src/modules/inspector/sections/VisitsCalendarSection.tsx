import MonthCalendar from '../components/MonthCalendar'
import type { ScheduledVisit } from '../../../api/visits'

interface VisitsCalendarSectionProps {
  visits: ScheduledVisit[]
  onDayClick: (dayKey: string) => void
}

// Calendario de visitas domiciliarias programadas.
// Al tocar un día con citas se abre el modal con el detalle.
export default function VisitsCalendarSection({ visits, onDayClick }: VisitsCalendarSectionProps) {
  const visitCountByDay = visits.reduce<Record<string, number>>((acc, v) => {
    acc[v.date] = (acc[v.date] ?? 0) + 1
    return acc
  }, {})

  return (
    <div data-tour="visits-calendar" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <p className="font-semibold text-gray-700 text-sm">Visitas Domiciliarias</p>
        <span className="ml-auto text-xs text-gray-400">{visits.length} programada{visits.length !== 1 ? 's' : ''}</span>
      </div>
      <MonthCalendar visitCountByDay={visitCountByDay} mode="view" onDayClick={onDayClick} />
      <p className="text-[11px] text-gray-400 mt-2">
        Toca un día con visitas para ver el detalle. Máximo 2 visitas por día · fines de semana y feriados cerrados.
      </p>
    </div>
  )
}

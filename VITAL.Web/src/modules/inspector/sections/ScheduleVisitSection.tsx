import { useState } from 'react'
import MonthCalendar from '../components/MonthCalendar'
import { formatDayKey } from '../data/calendarUtils'
import { scheduleVisit, type ScheduledVisit } from '../../../api/visits'
import type { VulnerabilityCase } from '../../../types'

interface ScheduleVisitSectionProps {
  caseData: VulnerabilityCase
  /** Todas las visitas programadas — para bloquear los días llenos */
  visits: ScheduledVisit[]
  onScheduled: (visit: ScheduledVisit) => void
}

// Una vez aprobados los papeles (caso En Revisión) la visita domiciliaria es
// obligatoria: el inspector elige aquí el día en que irá. Máx. 2 visitas por
// día; fines de semana y feriados cerrados; días llenos no seleccionables.
export default function ScheduleVisitSection({ caseData, visits, onScheduled }: ScheduleVisitSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ownVisit = visits.find(v => v.caseId === caseData.id)

  const visitCountByDay = visits.reduce<Record<string, number>>((acc, v) => {
    acc[v.date] = (acc[v.date] ?? 0) + 1
    return acc
  }, {})

  const handleSchedule = async () => {
    if (!selectedDay) return
    setLoading(true)
    setError('')
    try {
      const visit = await scheduleVisit(caseData.id, selectedDay)
      onScheduled(visit)
      setSelectedDay(null)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al programar la visita.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-tour="schedule-visit" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-5 first:mt-0">
      <h2 className="font-semibold text-gray-700 mb-1">📅 Visita Domiciliaria</h2>

      {ownVisit ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center mt-3">
          <p className="text-2xl mb-1">✓</p>
          <p className="font-semibold text-emerald-700 text-sm">Visita programada</p>
          <p className="text-xs text-emerald-600 mt-1 capitalize">{formatDayKey(ownVisit.date)}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Los papeles fueron aprobados — selecciona el día de la visita obligatoria.
          </p>

          <MonthCalendar
            visitCountByDay={visitCountByDay}
            mode="select"
            selectedDay={selectedDay}
            onDayClick={setSelectedDay}
          />

          {selectedDay && (
            <p className="text-sm text-gray-600 mt-3 text-center capitalize">
              Visita: <strong>{formatDayKey(selectedDay)}</strong>
            </p>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{error}</p>
          )}

          <button
            onClick={handleSchedule}
            disabled={!selectedDay || loading}
            className="w-full mt-3 bg-[#1a5276] hover:bg-[#154360] text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Programando...' : 'Programar Visita'}
          </button>
        </>
      )}
    </div>
  )
}

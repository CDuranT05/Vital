import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import { getPendingCases } from '../../../api/cases'
import { getPendingTransfers } from '../../../api/transfers'
import { getScheduledVisits, type ScheduledVisit } from '../../../api/visits'

import CasesLinkSection from '../sections/CasesLinkSection'
import TransfersLinkSection from '../sections/TransfersLinkSection'
import VisitsCalendarSection from '../sections/VisitsCalendarSection'
import DayVisitsModal from '../modals/DayVisitsModal'

export default function InspectorDashboard() {
  const [caseCount, setCaseCount] = useState(0)
  const [transferCount, setTransferCount] = useState(0)
  const [visits, setVisits] = useState<ScheduledVisit[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPendingCases(), getPendingTransfers(), getScheduledVisits()])
      .then(([cases, transfers, scheduled]) => {
        setCaseCount(cases.filter(c => c.status === 1 || c.status === 2).length)
        setTransferCount(transfers.filter(t => t.status === 1).length)
        setVisits(scheduled)
      })
  }, [])

  const dayVisits = selectedDay ? visits.filter(v => v.date === selectedDay) : []

  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full space-y-4 flex-1 flex flex-col">

        {/* Header */}
        <div className="pt-1 pb-2">
          <h1 className="text-2xl font-bold text-gray-800">Panel Inspector</h1>
          <p className="text-gray-400 text-sm mt-0.5">Gestión de casos y solicitudes</p>
        </div>

        {/* Accesos lado a lado en escritorio */}
        <div className="grid gap-4 sm:grid-cols-2">
          <CasesLinkSection count={caseCount} />
          <TransfersLinkSection count={transferCount} />
        </div>

        {/* El calendario crece para llenar la pantalla en móviles */}
        <div className="flex-1">
          <VisitsCalendarSection visits={visits} onDayClick={setSelectedDay} />
        </div>

      </div>

      {/* ── Modal: visitas del día seleccionado ── */}
      {selectedDay && dayVisits.length > 0 && (
        <DayVisitsModal
          dayKey={selectedDay}
          visits={dayVisits}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </Layout>
  )
}

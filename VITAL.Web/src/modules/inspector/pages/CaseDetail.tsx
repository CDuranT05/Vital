import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { getCase } from '../../../api/cases'
import { getScheduledVisits, type ScheduledVisit } from '../../../api/visits'
import type { VulnerabilityCase } from '../../../types'

import CaseInfoSection from '../sections/CaseInfoSection'
import CaseDocumentsSection from '../sections/CaseDocumentsSection'
import CaseVisitsSection from '../sections/CaseVisitsSection'
import CaseReviewSection from '../sections/CaseReviewSection'
import ScheduleVisitSection from '../sections/ScheduleVisitSection'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [c, setC] = useState<VulnerabilityCase | null>(null)
  const [visits, setVisits] = useState<ScheduledVisit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getCase(id), getScheduledVisits()])
      .then(([caseData, scheduled]) => { setC(caseData); setVisits(scheduled) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><div className="text-center py-16 text-gray-400">Cargando caso...</div></Layout>
  if (!c) return <Layout><div className="text-center py-16 text-gray-400">Caso no encontrado</div></Layout>

  const visitScheduled = visits.some(v => v.caseId === c.id)

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/inspector/cases')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalle del Caso</h1>
          <p className="text-gray-500 text-sm">{c.contractNumber} · {c.citizenName}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="md:col-span-2 space-y-5">
          <CaseInfoSection caseData={c} />
          <CaseDocumentsSection caseData={c} />
          <CaseVisitsSection caseData={c} />
        </div>

        {/* Panel de Revisión + agenda de visita.
            Tras aprobar papeles solo se muestra el calendario; el resultado
            de la visita aparece una vez programado el día. */}
        <div>
          {(c.status !== 2 || visitScheduled) && (
            <CaseReviewSection
              caseData={c}
              visitScheduled={visitScheduled}
              onReviewed={setC}
            />
          )}

          {c.status === 2 && (
            <ScheduleVisitSection
              caseData={c}
              visits={visits}
              onScheduled={visit => setVisits(prev => [...prev, visit])}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}

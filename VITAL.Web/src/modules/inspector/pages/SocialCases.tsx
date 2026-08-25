import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../../components/Layout'
import { getPendingCases } from '../../../api/cases'
import type { VulnerabilityCase } from '../../../types'

import InspectorStatsSection from '../sections/InspectorStatsSection'
import CasesFilterSection, { type CasesFilter } from '../sections/CasesFilterSection'
import CasesListSection from '../sections/CasesListSection'

export default function SocialCases() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<VulnerabilityCase[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<CasesFilter>('all')

  useEffect(() => {
    getPendingCases()
      .then(setCases)
      .finally(() => setLoading(false))
  }, [])

  const filtered = cases.filter(c => {
    if (filter === 'pending') return c.status === 1
    if (filter === 'review') return c.status === 2
    return true
  })

  const pendingCount = cases.filter(c => c.status === 1).length
  const reviewCount = cases.filter(c => c.status === 2).length

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full space-y-4 flex-1 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <button onClick={() => navigate('/inspector')} className="text-gray-400 hover:text-gray-600">← Volver</button>
          <h1 className="text-lg font-bold text-gray-800">Casos Sociales</h1>
        </div>

        <InspectorStatsSection total={cases.length} pending={pendingCount} review={reviewCount} />

        <CasesFilterSection
          filter={filter}
          totalCount={cases.length}
          pendingCount={pendingCount}
          reviewCount={reviewCount}
          onChange={setFilter}
        />

        {/* La lista crece para llenar la pantalla en móviles */}
        <div className="flex-1" data-tour="cases-list">
          <CasesListSection cases={filtered} loading={loading} />
        </div>

      </div>
    </Layout>
  )
}

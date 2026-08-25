import { useState, useEffect } from 'react'
import Layout from '../../../components/Layout'
import { getGlobalMetrics, type GlobalMetrics, type BranchMetrics } from '../../../api/supervisor'

import GlobalMetricsSection from '../sections/GlobalMetricsSection'
import BranchesSummarySection from '../sections/BranchesSummarySection'
import BranchDetailSection from '../sections/BranchDetailSection'
import ReportsSection from '../sections/ReportsSection'

export default function SupervisorDashboard() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState<BranchMetrics | null>(null)

  useEffect(() => {
    getGlobalMetrics()
      .then(data => { setMetrics(data); setSelectedBranch(data.branches[0] ?? null) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-24 text-gray-400">Cargando métricas...</div>
    </Layout>
  )
  if (!metrics) return null

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Panel de Supervisión</h1>
            <p className="text-sm text-gray-400">Visión general del sistema VITAL</p>
          </div>
          <span className="bg-[#1a5276]/10 text-[#1a5276] text-xs font-semibold px-3 py-1.5 rounded-full">
            {metrics.branches.length} subestaciones
          </span>
        </div>

        <GlobalMetricsSection metrics={metrics} />

        <BranchesSummarySection
          branches={metrics.branches}
          selectedBranchId={selectedBranch?.branchId ?? null}
          onSelect={setSelectedBranch}
        />

        {selectedBranch && <BranchDetailSection branch={selectedBranch} />}

        <ReportsSection branch={selectedBranch} />

      </div>
    </Layout>
  )
}

import type { GlobalMetrics } from '../../../api/supervisor'

export function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 border ${color}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function GlobalMetricsSection({ metrics }: { metrics: GlobalMetrics }) {
  return (
    <section>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Métricas Globales</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Contratos activos"
          value={metrics.totalActiveContracts}
          color="bg-blue-50 border-blue-100"
        />
        <StatCard
          label="Incidentes"
          value={metrics.totalIncidents}
          sub={`${metrics.totalResolvedIncidents} resueltos`}
          color="bg-amber-50 border-amber-100"
        />
        <StatCard
          label="Transferencias"
          value={metrics.totalTransfers}
          sub={`${metrics.totalCompletedTransfers} completadas`}
          color="bg-purple-50 border-purple-100"
        />
        <StatCard
          label="Solicitudes sociales"
          value={metrics.totalCases}
          sub={`${metrics.totalApprovedCases} aprobadas`}
          color="bg-emerald-50 border-emerald-100"
        />
      </div>
    </section>
  )
}

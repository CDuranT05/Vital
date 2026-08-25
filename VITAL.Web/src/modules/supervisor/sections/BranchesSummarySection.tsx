import type { BranchMetrics } from '../../../api/supervisor'

export function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

interface BranchesSummarySectionProps {
  branches: BranchMetrics[]
  selectedBranchId: string | null
  onSelect: (branch: BranchMetrics) => void
}

export default function BranchesSummarySection({ branches, selectedBranchId, onSelect }: BranchesSummarySectionProps) {
  return (
    <section>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resumen por Subestación</p>
      <div className="grid md:grid-cols-3 gap-3">
        {branches.map(b => (
          <button
            key={b.branchId}
            onClick={() => onSelect(b)}
            className={`text-left rounded-xl border p-4 transition-all ${
              selectedBranchId === b.branchId
                ? 'border-[#1a5276] bg-[#1a5276]/5 shadow-md'
                : 'border-gray-200 bg-white hover:border-[#1a5276]/40 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800 text-sm">{b.branchName}</p>
                <p className="text-xs text-gray-400">{b.city}</p>
              </div>
              {selectedBranchId === b.branchId && (
                <span className="text-[#1a5276] text-lg">●</span>
              )}
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Contratos</span>
                <strong>{b.activeContracts}</strong>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Incidentes resueltos</span>
                  <span>{b.resolvedIncidents}/{b.totalIncidents}</span>
                </div>
                <ProgressBar value={b.resolvedIncidents} total={b.totalIncidents} color="bg-amber-400" />
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Solicitudes aprobadas</span>
                  <span>{b.approvedCases}/{b.totalCases}</span>
                </div>
                <ProgressBar value={b.approvedCases} total={b.totalCases} color="bg-emerald-400" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

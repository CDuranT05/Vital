import type { BranchMetrics } from '../../../api/supervisor'
import { StatCard } from './GlobalMetricsSection'

export default function BranchDetailSection({ branch }: { branch: BranchMetrics }) {
  return (
    <section data-tour="sup-detail" className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Detalle — {branch.branchName}
        </p>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Stats de la sucursal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Contratos activos"   value={branch.activeContracts}   color="bg-blue-50 border-blue-100" />
        <StatCard label="Incidentes pendientes" value={branch.pendingIncidents} color="bg-red-50 border-red-100" />
        <StatCard label="Transferencias pendientes" value={branch.pendingTransfers} color="bg-purple-50 border-purple-100" />
        <StatCard label="Casos pendientes"    value={branch.pendingCases}      color="bg-amber-50 border-amber-100" />
      </div>

      {/* Técnicos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <p className="font-semibold text-gray-700 text-sm">Técnicos ({branch.technicians.length})</p>
        </div>
        {branch.technicians.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Sin técnicos registrados</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {branch.technicians.map(t => (
              <div key={t.id} className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.identityCard}</p>
                </div>
                <div className="flex gap-4 text-xs text-center shrink-0">
                  <div>
                    <p className="font-bold text-gray-700">{t.incidentsAssigned}</p>
                    <p className="text-gray-400">Asig.</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-600">{t.incidentsResolved}</p>
                    <p className="text-gray-400">Resuel.</p>
                  </div>
                  <div>
                    <p className="font-bold text-amber-500">{t.incidentsPending}</p>
                    <p className="text-gray-400">Pend.</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600">{t.transfersCompleted}</p>
                    <p className="text-gray-400">Transfer.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspectores */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <p className="font-semibold text-gray-700 text-sm">Inspectores ({branch.inspectors.length})</p>
        </div>
        {branch.inspectors.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Sin inspectores registrados</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {branch.inspectors.map(i => (
              <div key={i.id} className="px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm">{i.name}</p>
                  <p className="text-xs text-gray-400">{i.identityCard}</p>
                </div>
                <div className="flex gap-4 text-xs text-center shrink-0">
                  <div>
                    <p className="font-bold text-gray-700">{i.casesReviewed}</p>
                    <p className="text-gray-400">Casos rev.</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-600">{i.casesApproved}</p>
                    <p className="text-gray-400">Aprobados</p>
                  </div>
                  <div>
                    <p className="font-bold text-red-500">{i.casesRejected}</p>
                    <p className="text-gray-400">Rechazados</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600">{i.transfersReviewed}</p>
                    <p className="text-gray-400">Transfer.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

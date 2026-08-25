import type { Contract } from '../../../types'

interface ContractsSectionProps {
  contracts: Contract[]
  nicknames: Record<string, string>
  emergencySent: Set<string>
  onOpenDetail: (contract: Contract) => void
  onEmergency: (contractId: string) => void
}

export default function ContractsSection({ contracts, nicknames, emergencySent, onOpenDetail, onEmergency }: ContractsSectionProps) {
  if (contracts.length === 0) {
    return <p className="text-center text-gray-400 py-8">No tienes contratos registrados</p>
  }

  return (
    <div className="space-y-3">
      {contracts.map(c => (
        <div key={c.id} className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Lado izquierdo — abre detalle */}
            <button onClick={() => onOpenDetail(c)} className="flex-1 text-left min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {nicknames[c.id] ? nicknames[c.id] : c.contractNumber}
              </p>
              {nicknames[c.id] && (
                <p className="text-xs text-gray-400">{c.contractNumber}</p>
              )}
              <p className="text-sm text-gray-500 truncate">{c.serviceAddress}</p>
              {c.property && (
                <p className="text-xs text-gray-400">{c.property.parish}, {c.property.municipality}</p>
              )}
            </button>

            {/* Botón emergencia — siempre visible */}
            {c.meter && (
              emergencySent.has(c.id) ? (
                <span className="text-xs text-green-600 font-semibold shrink-0">✓ Alerta</span>
              ) : (
                <button
                  onClick={() => onEmergency(c.id)}
                  data-tour="emergency-btn"
                  className="shrink-0 bg-green-50 border-green-200 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md shadow-red-200 transition-all"
                >
                  🚨
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

import type { TransferRequest } from '../../../api/transfers'

const statusColor: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-emerald-100 text-emerald-800',
  4: 'bg-red-100 text-red-800',
  5: 'bg-gray-100 text-gray-600',
}

interface TransferRequestsListSectionProps {
  transfers: TransferRequest[]
  loading: boolean
  formatDate: (d: string) => string
  onSelect: (transfer: TransferRequest) => void
}

export default function TransferRequestsListSection({ transfers, loading, formatDate, onSelect }: TransferRequestsListSectionProps) {
  if (loading) {
    return <div className="text-center py-12 text-gray-400">Cargando...</div>
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="text-5xl mb-3">✅</div>
        <p className="font-semibold text-gray-700">Sin solicitudes pendientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transfers.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-[#1a5276]/30 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{t.contractNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.serviceAddress}</p>
              <p className="text-xs text-gray-400 mt-1">
                Titular actual: <strong>{t.currentOwnerName}</strong> ({t.currentOwnerIdentityCard})
              </p>
              <p className="text-xs text-gray-400">
                Nuevo titular: <strong>{t.newOwnerFirstName} {t.newOwnerLastName}</strong> ({t.newOwnerIdentityCard})
              </p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <span className={`block text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status]}`}>
                {t.statusLabel}
              </span>
              <p className="text-xs text-gray-400">{formatDate(t.createdAt)}</p>
              <p className="text-xs text-gray-400">{t.documents.length} doc(s)</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

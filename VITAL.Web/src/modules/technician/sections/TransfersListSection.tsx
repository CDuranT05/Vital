import type { TechnicianTransfer } from '../../../api/transfers'

interface TransfersListSectionProps {
  transfers: TechnicianTransfer[]
  formatDate: (d: string) => string
  onSelect: (transfer: TechnicianTransfer) => void
}

export default function TransfersListSection({ transfers, formatDate, onSelect }: TransfersListSectionProps) {
  if (transfers.length === 0) return null

  return (
    <>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">🔄 Cambios de Titularidad</p>
      {transfers.map(tr => (
        <button
          key={tr.id}
          onClick={() => onSelect(tr)}
          className="w-full bg-white rounded-xl border border-blue-200 shadow-sm p-4 text-left hover:border-[#1a5276] hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800 text-sm">🔄 {tr.contractNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">{tr.serviceAddress}</p>
              <p className="text-xs text-gray-400">{tr.parish && `${tr.parish}, `}{tr.municipality}, {tr.state}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Pendiente</span>
              <p className="text-xs text-gray-400 mt-1">{formatDate(tr.createdAt)}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            Nuevo titular: <strong>{tr.newOwnerFirstName} {tr.newOwnerLastName}</strong> ({tr.newOwnerIdentityCard})
          </div>
        </button>
      ))}
    </>
  )
}

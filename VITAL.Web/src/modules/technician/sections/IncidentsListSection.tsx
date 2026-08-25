import type { AssignedIncident } from '../../../api/incidents'

interface IncidentsListSectionProps {
  incidents: AssignedIncident[]
  formatDate: (d: string) => string
  onSelect: (incident: AssignedIncident) => void
}

export default function IncidentsListSection({ incidents, formatDate, onSelect }: IncidentsListSectionProps) {
  if (incidents.length === 0) return null

  return (
    <>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 pt-2">🚨 Emergencias en Atención</p>
      {incidents.map(inc => (
        <button
          key={inc.id}
          onClick={() => onSelect(inc)}
          className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-red-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800 text-sm">🚨 {inc.contractNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">{inc.serviceAddress}</p>
              <p className="text-xs text-gray-400">{inc.parish && `${inc.parish}, `}{inc.municipality}, {inc.state}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-red-600 font-bold">En atención</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(inc.reportedAt)}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-500">👤 {inc.citizenName}</span>
            {inc.citizenPhone && <span className="text-xs text-gray-400">· 📞 {inc.citizenPhone}</span>}
          </div>
        </button>
      ))}
    </>
  )
}

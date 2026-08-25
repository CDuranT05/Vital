import { Link } from 'react-router-dom'
import type { VulnerabilityCase, CaseStatus } from '../../../types'
import { CaseStatusLabel } from '../../../types'

const statusColor: Record<CaseStatus, string> = {
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-red-100 text-red-700'
}

const statusDot: Record<CaseStatus, string> = {
  1: 'bg-yellow-400',
  2: 'bg-blue-400',
  3: 'bg-green-400',
  4: 'bg-red-400'
}

interface CasesListSectionProps {
  cases: VulnerabilityCase[]
  loading: boolean
}

export default function CasesListSection({ cases, loading }: CasesListSectionProps) {
  if (loading) {
    return (
      <div className="text-center py-16 text-gray-300">
        <div className="w-8 h-8 border-4 border-[#1a5276] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Cargando casos...</p>
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-16 text-gray-300">
        <div className="text-5xl mb-3">📋</div>
        <p className="text-sm text-gray-400">No hay casos en esta categoría</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-6">
      {cases.map(c => (
        <Link
          key={c.id}
          to={`/inspector/case/${c.id}`}
          className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-[#1a5276]/20 active:scale-[0.99] transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[c.status as CaseStatus]}`} />
              <p className="font-semibold text-gray-800 truncate">{c.citizenName}</p>
            </div>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status as CaseStatus]}`}>
              {CaseStatusLabel[c.status as CaseStatus]}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-2 ml-4">{c.contractNumber}</p>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{c.description}</p>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <span>📄 {c.evidences.length}</span>
              <span>🏠 {c.homeVisits.length}</span>
              {c.homeVisitRequired && <span className="text-orange-500 font-medium">⚠ Visita</span>}
            </div>
            <span>{new Date(c.requestDate).toLocaleDateString('es-VE')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

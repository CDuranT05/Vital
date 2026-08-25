import type { VulnerabilityCase, CaseStatus } from '../../../types'
import { CaseStatusLabel } from '../../../types'

export const caseStatusColor: Record<CaseStatus, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-green-100 text-green-800',
  4: 'bg-red-100 text-red-800',
}

interface CasesSectionProps {
  cases: VulnerabilityCase[]
  onNewRequest: () => void
}

export default function CasesSection({ cases, onNewRequest }: CasesSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end mb-2">
        <button
          onClick={onNewRequest}
          className="bg-[#1a5276] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#154360] transition-colors"
        >
          + Realizar Solicitud
        </button>
      </div>
      {cases.length === 0 ? (
        <p className="text-center text-gray-400 py-6">No tienes solicitudes sociales</p>
      ) : cases.map(c => (
        <div key={c.id} className="border border-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">{c.contractNumber}</p>
              <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(c.requestDate).toLocaleDateString('es-VE')}
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className={`block text-xs px-2 py-0.5 rounded-full ${caseStatusColor[c.status as CaseStatus]}`}>
                {CaseStatusLabel[c.status as CaseStatus]}
              </span>
              <p className="text-xs text-gray-400">{c.evidences.length} doc(s)</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

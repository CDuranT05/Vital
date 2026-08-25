import type { VulnerabilityCase } from '../../../types'

export default function CaseVisitsSection({ caseData }: { caseData: VulnerabilityCase }) {
  if (caseData.homeVisits.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-700 mb-3">🏠 Visitas Domiciliarias ({caseData.homeVisits.length})</h2>
      <div className="space-y-4">
        {caseData.homeVisits.map(v => (
          <div key={v.id} className="border border-gray-100 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700">{new Date(v.visitDate).toLocaleDateString('es-VE')}</p>
            <p className="text-sm text-gray-600 mt-1">{v.observations}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <span className={v.informationConfirmed ? 'text-green-600' : 'text-orange-600'}>
                {v.informationConfirmed ? '✓ Información confirmada' : '⚠ Información no confirmada'}
              </span>
              {v.photoPaths.length > 0 && <span className="text-gray-400">📷 {v.photoPaths.length} foto(s)</span>}
              {v.neighborStatements.length > 0 && <span className="text-gray-400">👥 {v.neighborStatements.length} testimonio(s)</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

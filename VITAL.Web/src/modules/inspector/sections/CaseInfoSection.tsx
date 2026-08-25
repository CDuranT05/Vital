import type { VulnerabilityCase } from '../../../types'
import { CaseStatusLabel } from '../../../types'

// Información del ciudadano y descripción de la situación
export default function CaseInfoSection({ caseData }: { caseData: VulnerabilityCase }) {
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-3">👤 Información del Ciudadano</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Nombre:</span> <span className="font-medium">{caseData.citizenName}</span></div>
          <div><span className="text-gray-400">Contrato:</span> <span className="font-medium">{caseData.contractNumber}</span></div>
          <div className="col-span-2"><span className="text-gray-400">Dirección:</span> <span className="font-medium">{caseData.serviceAddress}</span></div>
          <div><span className="text-gray-400">Solicitud:</span> <span className="font-medium">{new Date(caseData.requestDate).toLocaleDateString('es-VE')}</span></div>
          <div>
            <span className="text-gray-400">Estado:</span>{' '}
            <span className="font-medium">{CaseStatusLabel[caseData.status as 1|2|3|4]}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-3">📝 Descripción de la Situación</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{caseData.description}</p>
      </div>
    </>
  )
}

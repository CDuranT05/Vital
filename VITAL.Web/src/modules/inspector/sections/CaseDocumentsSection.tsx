import type { VulnerabilityCase } from '../../../types'

export default function CaseDocumentsSection({ caseData }: { caseData: VulnerabilityCase }) {
  return (
    <div data-tour="case-documents" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-700 mb-3">📄 Documentos ({caseData.evidences.length})</h2>
      {caseData.evidences.length === 0 ? (
        <p className="text-sm text-gray-400">Sin documentos adjuntos</p>
      ) : (
        <div className="space-y-2">
          {caseData.evidences.map(e => (
            <a
              key={e.id}
              href={e.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>{e.contentType.includes('pdf') ? '📕' : '🖼'}</span>
              <span>{e.fileName}</span>
              <span className="text-gray-400 text-xs ml-auto">{new Date(e.uploadedAt).toLocaleDateString('es-VE')}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { reviewCase } from '../../../api/cases'
import type { VulnerabilityCase } from '../../../types'
import { VulnerabilityLevelLabel } from '../../../types'

interface CaseReviewSectionProps {
  caseData: VulnerabilityCase
  /** El resultado de la visita solo puede registrarse con la visita programada */
  visitScheduled: boolean
  onReviewed: (updated: VulnerabilityCase) => void
}

// Flujo de revisión del inspector:
//  Etapa 1 (Pendiente): revisa documentos → aprueba (pasa a Visita Pendiente)
//    o rechaza con comentario obligatorio.
//  Etapa 2 (Visita Pendiente): programa la visita, la realiza y registra el
//    resultado → aprueba indicando el grado de riesgo (el sistema aplica la
//    ayuda en las facturas del contrato) o rechaza con comentario (ej. fraude).
export default function CaseReviewSection({ caseData, visitScheduled, onReviewed }: CaseReviewSectionProps) {
  const [observations, setObservations] = useState('')
  const [level, setLevel] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (status: number, vulnerabilityLevel = 0) => {
    setLoading(true)
    setError('')
    try {
      const updated = await reviewCase(caseData.id, {
        status,
        vulnerabilityLevel,
        observations: observations.trim() || undefined,
      })
      onReviewed(updated)
      setObservations('')
    } catch {
      setError('Error al procesar la revisión.')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = () => {
    if (!observations.trim()) {
      setError('Debes indicar el motivo del rechazo (ej: documentación fraudulenta).')
      return
    }
    submit(4)
  }

  return (
    <div data-tour="case-review" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-4">
      <h2 className="font-semibold text-gray-700 mb-4">⚖️ Revisión del Inspector</h2>

      {/* ── Caso cerrado: aprobado ── */}
      {caseData.status === 3 && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-4 text-center text-sm">
          <p className="text-xl mb-1">✓</p>
          <p className="font-semibold">Ayuda aprobada</p>
          <p className="mt-1">Grado de riesgo: <strong>{VulnerabilityLevelLabel[caseData.vulnerabilityLevel]}</strong></p>
          <p className="text-xs text-green-600 mt-2">
            El descuento fue aplicado automáticamente a las facturas pendientes del contrato.
          </p>
          {caseData.approvalDate && (
            <p className="text-xs mt-1">{new Date(caseData.approvalDate).toLocaleDateString('es-VE')}</p>
          )}
        </div>
      )}

      {/* ── Caso cerrado: rechazado ── */}
      {caseData.status === 4 && (
        <div data-tour="case-rejected" className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 text-sm">
          <p className="text-center text-xl mb-1">✕</p>
          <p className="text-center font-semibold text-red-700">Solicitud rechazada</p>
          {caseData.observations && (
            <div className="mt-3 bg-white border border-red-100 rounded-lg px-3 py-2">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Motivo</p>
              <p className="text-xs text-red-600 leading-relaxed">{caseData.observations}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Etapa 1: Revisión de documentos ── */}
      {caseData.status === 1 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
            <strong>Etapa 1 de 2 · Revisión de documentos.</strong> Verifica las evidencias
            adjuntas. Si son válidas, el caso pasa a visita domiciliaria obligatoria.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={observations}
              onChange={e => { setObservations(e.target.value); setError('') }}
              rows={3}
              placeholder="Opcional al aprobar · obligatorio al rechazar (ej: fraude documental)..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={() => submit(2)}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-semibold bg-[#1a5276] hover:bg-[#154360] transition-colors disabled:opacity-60"
          >
            {loading ? 'Procesando...' : '✓ Aprobar Documentos'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors disabled:opacity-60"
          >
            ✕ Rechazar Solicitud
          </button>
        </div>
      )}

      {/* ── Etapa 2: Resultado de la visita ── */}
      {caseData.status === 2 && (
        <div className="space-y-4" data-tour="case-result">
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
            <strong>Etapa 2 de 2 · Visita domiciliaria.</strong> Documentos aprobados.
            {visitScheduled
              ? ' Realiza la visita y registra aquí el resultado.'
              : ' Programa primero la fecha de la visita en el calendario de abajo.'}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado de riesgo</label>
            <select
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
              disabled={!visitScheduled}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value={1}>Bajo — 25% de descuento</option>
              <option value={2}>Medio — 50% de descuento</option>
              <option value={3}>Alto — 75% de descuento</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Al aprobar, el sistema aplica el descuento en las facturas del contrato.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={observations}
              onChange={e => { setObservations(e.target.value); setError('') }}
              rows={3}
              placeholder="Resultado de la visita · obligatorio al rechazar (ej: fraude)..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={() => submit(3, level)}
            disabled={loading || !visitScheduled}
            title={!visitScheduled ? 'Programa la visita antes de registrar el resultado' : undefined}
            className="w-full py-2.5 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando...' : '✓ Aprobar y Aplicar Ayuda'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors disabled:opacity-60"
          >
            ✕ Rechazar Solicitud
          </button>
        </div>
      )}
    </div>
  )
}

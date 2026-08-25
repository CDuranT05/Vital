import { useState } from 'react'
import Modal from '../../../components/Modal'
import { approveTransfer, rejectTransfer, type TransferRequest } from '../../../api/transfers'

interface ReviewTransferModalProps {
  transfer: TransferRequest
  formatDate: (d: string) => string
  /** Se aprobó o rechazó — quitar la solicitud de la lista */
  onReviewed: (transferId: string) => void
  onClose: () => void
}

export default function ReviewTransferModal({ transfer, formatDate, onReviewed, onClose }: ReviewTransferModalProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    setError('')
    try {
      const updated = await approveTransfer(transfer.id, notes)
      onReviewed(updated.id)
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al aprobar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('Debes indicar el motivo del rechazo.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const updated = await rejectTransfer(transfer.id, notes)
      onReviewed(updated.id)
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al rechazar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} icon="🔄" title="Revisión de Solicitud" subtitle={transfer.contractNumber} size="lg">
      <div className="space-y-4">
        {/* Titular actual */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Titular Actual</p>
          <p className="font-bold text-gray-800">{transfer.currentOwnerName}</p>
          <p className="text-sm text-gray-600">🪪 {transfer.currentOwnerIdentityCard}</p>
          <p className="text-sm text-gray-500">📍 {transfer.serviceAddress}</p>
          {(transfer.municipality || transfer.state) && (
            <p className="text-sm text-gray-500">
              🏙️ {[transfer.parish, transfer.municipality, transfer.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Nuevo titular */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-1">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Nuevo Titular Solicitado</p>
          <p className="font-bold text-blue-800">{transfer.newOwnerFirstName} {transfer.newOwnerLastName}</p>
          <p className="text-sm text-blue-700">🪪 {transfer.newOwnerIdentityCard}</p>
          {transfer.newOwnerPhone && <p className="text-sm text-blue-600">📞 {transfer.newOwnerPhone}</p>}
          {transfer.newOwnerEmail && <p className="text-sm text-blue-600">✉️ {transfer.newOwnerEmail}</p>}
        </div>

        {/* Documentos */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Documentos Adjuntos ({transfer.documents.length})</p>
          {transfer.documents.length === 0 ? (
            <p className="text-xs text-gray-400">Sin documentos adjuntos</p>
          ) : (
            <ul className="space-y-1">
              {transfer.documents.map(d => (
                <li key={d.id} className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex items-center gap-2">
                  <span>📄</span>
                  <span className="truncate">{d.originalName}</span>
                  <span className="ml-auto text-gray-400">{d.documentType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas del inspector
            <span className="text-gray-400 text-xs font-normal ml-1">(requerido para rechazo)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones sobre la documentación presentada..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] resize-none"
          />
        </div>

        <p className="text-xs text-gray-400">
          Solicitud recibida: {formatDate(transfer.createdAt)}
        </p>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button onClick={onClose} className="border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
            Cancelar
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
          >
            Rechazar
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-60"
          >
            {loading ? '...' : 'Aprobar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

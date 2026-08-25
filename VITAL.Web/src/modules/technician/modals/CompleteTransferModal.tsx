import { useState } from 'react'
import Modal from '../../../components/Modal'
import { completeTransfer, type TechnicianTransfer } from '../../../api/transfers'

interface CompleteTransferModalProps {
  transfer: TechnicianTransfer
  onCompleted: (transferId: string) => void
  onClose: () => void
}

export default function CompleteTransferModal({ transfer, onCompleted, onClose }: CompleteTransferModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      await completeTransfer(transfer.id)
      onCompleted(transfer.id)
      setDone(true)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al completar la transferencia.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} icon="🔄" title="Cambio de Titularidad" subtitle={transfer.contractNumber}>
      <div className="space-y-4" data-tour="tech-transfer-modal">
        {done ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-bold text-gray-800 text-lg">Transferencia Completada</p>
            <p className="text-sm text-gray-500 mt-2">
              Se creó el nuevo contrato para <strong>{transfer.newOwnerFirstName} {transfer.newOwnerLastName}</strong>.<br />
              El contrato anterior quedó marcado como <strong>Transferido</strong>.
            </p>
            <button onClick={onClose} className="mt-5 w-full bg-[#1a5276] text-white py-2.5 rounded-lg font-semibold">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Titular Actual</p>
              <p className="font-bold text-gray-800">{transfer.currentOwnerName}</p>
              <p className="text-sm text-gray-600">🪪 {transfer.currentOwnerIdentityCard}</p>
              <p className="text-sm text-gray-500">📍 {transfer.serviceAddress}</p>
              {transfer.parish && (
                <p className="text-xs text-gray-400">{transfer.parish}, {transfer.municipality}, {transfer.state}</p>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Nuevo Titular Aprobado</p>
              <p className="font-bold text-blue-800">{transfer.newOwnerFirstName} {transfer.newOwnerLastName}</p>
              <p className="text-sm text-blue-700">🪪 {transfer.newOwnerIdentityCard}</p>
              {transfer.newOwnerPhone && <p className="text-sm text-blue-600">📞 {transfer.newOwnerPhone}</p>}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
              ⚠️ Verifica los datos en sitio antes de confirmar. Esta acción es irreversible.
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-60"
              >
                {loading ? 'Procesando...' : '✅ Confirmar Cambio'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

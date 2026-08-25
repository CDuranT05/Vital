import { useState } from 'react'
import Modal from '../../../components/Modal'
import { generateInvoice, type GenerateInvoiceResult } from '../../../api/invoices'
import type { QrScanResult } from '../../../types'

interface ReadingModalProps {
  scanResult: QrScanResult
  onGenerated: (result: GenerateInvoiceResult) => void
  onClose: () => void
}

export default function ReadingModal({ scanResult, onGenerated, onClose }: ReadingModalProps) {
  const [reading, setReading] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateInvoice = async () => {
    if (!scanResult.meterId || !reading) return
    setLoading(true)
    setError('')
    try {
      const result = await generateInvoice(scanResult.meterId, parseFloat(reading))
      onGenerated(result)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Error al generar la factura.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} size="sm" padded={false}>
      <div className="p-6" data-tour="reading-modal">
        <h3 className="text-lg font-bold text-gray-800 mb-1">⚡ Registrar Lectura</h3>
        {scanResult.contractNumber && (
          <p className="text-sm text-gray-500 mb-1">{scanResult.contractNumber}</p>
        )}
        {scanResult.serviceAddress && (
          <p className="text-xs text-gray-400 mb-5">{scanResult.serviceAddress}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lectura actual del medidor (kWh)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={reading}
              onChange={e => setReading(e.target.value)}
              placeholder="Ej: 1234"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:border-[#1a5276] focus:ring-0"
              autoFocus
            />
            <p className="text-xs text-gray-400 text-center mt-1">Solo números enteros</p>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleGenerateInvoice}
              disabled={loading || !reading}
              className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg hover:bg-[#154360] disabled:opacity-60 font-semibold"
            >
              {loading ? 'Generando...' : 'Registrar y Facturar'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

import Modal from '../../../components/Modal'
import type { GenerateInvoiceResult } from '../../../api/invoices'

interface InvoiceGeneratedModalProps {
  result: GenerateInvoiceResult
  onClose: () => void
}

export default function InvoiceGeneratedModal({ result, onClose }: InvoiceGeneratedModalProps) {
  return (
    <Modal open onClose={onClose} size="sm" padded={false}>
      <div className="p-6 text-center" data-tour="invoice-done">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Medición Terminada</h3>
        <p className="text-sm text-gray-500 mb-5">
          Contrato <strong>{result.invoice.contractNumber}</strong>
        </p>

        <div className="bg-gray-50 rounded-xl px-5 py-4 text-sm text-left space-y-2 mb-5">
          <div className="flex justify-between">
            <span className="text-gray-500">Lectura registrada</span>
            <span className="font-bold text-gray-800">
              {(result.previousReading + result.consumptionKwh).toFixed(0)} kWh
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Consumo del período</span>
            <span className="font-bold text-[#1a5276]">{result.consumptionKwh.toFixed(0)} kWh</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          La factura fue generada y enviada al cliente automáticamente.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#1a5276] text-white py-2.5 rounded-lg hover:bg-[#154360] font-semibold"
        >
          Escanear otro
        </button>
      </div>
    </Modal>
  )
}

import Modal from '../../../components/Modal'
import { invoiceStatusColor } from '../sections/InvoicesSection'
import type { Invoice, InvoiceStatus } from '../../../types'
import { InvoiceStatusLabel } from '../../../types'

interface InvoiceDetailModalProps {
  invoice: Invoice
  onPay: (invoice: Invoice) => void
  onClose: () => void
}

export default function InvoiceDetailModal({ invoice, onPay, onClose }: InvoiceDetailModalProps) {
  return (
    <Modal open onClose={onClose} icon="🧾" title="Factura" subtitle={invoice.contractNumber} size="sm">
      <div className="space-y-4" data-tour="invoice-detail">
        {/* Info principal */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Contrato</span>
            <span className="font-semibold text-gray-800">{invoice.contractNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fecha emisión</span>
            <span className="font-semibold text-gray-800">
              {new Date(invoice.createdAt).toLocaleDateString('es-VE', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Hora</span>
            <span className="font-semibold text-gray-800">
              {new Date(invoice.createdAt).toLocaleTimeString('es-VE', {
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Período</span>
            <span className="font-semibold text-gray-800 text-right">
              {new Date(invoice.billingPeriodStart).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
              {' – '}
              {new Date(invoice.billingPeriodEnd).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Consumo</span>
            <span className="font-semibold text-gray-800">{invoice.consumptionKwh} kWh</span>
          </div>
        </div>

        {/* Tarifa */}
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Tarifa a pagar</p>
          <div className="flex justify-between text-sm">
            <span className="text-blue-700">Monto base</span>
            <span className="font-semibold text-blue-800">$ {invoice.amount.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Descuento social</span>
              <span className="font-semibold text-green-600">− $ {invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-blue-100 pt-2 mt-1">
            <span className="font-bold text-blue-800">Total</span>
            <span className="font-bold text-xl text-[#1a5276]">$ {invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Estado / acción */}
        {invoice.status === 2 ? (
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-3">
            <span className="text-green-600 text-lg">✓</span>
            <span className="font-semibold text-green-700">Pagada</span>
          </div>
        ) : invoice.status === 1 ? (
          <button
            onClick={() => onPay(invoice)}
            className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-bold py-3 rounded-xl transition-colors"
          >
            💳 Realizar Pago
          </button>
        ) : (
          <div className={`text-center py-3 rounded-xl text-sm font-semibold ${invoiceStatusColor[invoice.status as InvoiceStatus]}`}>
            {InvoiceStatusLabel[invoice.status as InvoiceStatus]}
          </div>
        )}
      </div>
    </Modal>
  )
}

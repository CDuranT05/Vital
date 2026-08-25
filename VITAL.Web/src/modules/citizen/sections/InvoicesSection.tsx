import type { Invoice, InvoiceStatus } from '../../../types'
import { InvoiceStatusLabel } from '../../../types'

export const invoiceStatusColor: Record<InvoiceStatus, string> = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-red-100 text-red-800',
  4: 'bg-gray-100 text-gray-600',
}

interface InvoicesSectionProps {
  invoices: Invoice[]
  onOpenInvoice: (invoice: Invoice) => void
}

export default function InvoicesSection({ invoices, onOpenInvoice }: InvoicesSectionProps) {
  if (invoices.length === 0) {
    return <p className="text-center text-gray-400 py-8">No tienes facturas</p>
  }

  return (
    <div className="space-y-2">
      {/* Muestra todas pero con altura máxima para ver ~2 en móvil */}
      <div className="max-h-[280px] overflow-y-auto space-y-2 pr-0.5">
        {invoices.map(inv => (
          <button
            key={inv.id}
            onClick={() => onOpenInvoice(inv)}
            className="w-full flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:border-[#1a5276]/30 hover:bg-gray-50 transition-all text-left"
          >
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{inv.contractNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(inv.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${invoiceStatusColor[inv.status as InvoiceStatus]}`}>
                {InvoiceStatusLabel[inv.status as InvoiceStatus]}
              </span>
              <span className="text-gray-300 text-sm">›</span>
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-300 pt-1">
        {invoices.length} factura{invoices.length !== 1 ? 's' : ''} en total
      </p>
    </div>
  )
}

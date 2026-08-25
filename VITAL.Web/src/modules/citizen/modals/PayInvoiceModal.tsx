import { useRef, useState } from 'react'
import Modal from '../../../components/Modal'
import { submitPayment } from '../../../api/payments'
import type { Invoice } from '../../../types'

interface PayInvoiceModalProps {
  invoice: Invoice
  onPaid: () => void
  onClose: () => void
}

export default function PayInvoiceModal({ invoice, onPaid, onClose }: PayInvoiceModalProps) {
  const [refNumber, setRefNumber] = useState('')
  const [payMethod, setPayMethod] = useState(2)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [paySuccess, setPaySuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePay = async () => {
    if (!refNumber.trim()) { setPayError('Ingresa el número de referencia.'); return }
    if (!receipt) { setPayError('Adjunta la foto del comprobante de pago.'); return }
    setPaying(true); setPayError('')
    try {
      await submitPayment(invoice.id, refNumber.trim(), payMethod, receipt ?? undefined)
      setPaySuccess(true)
      onPaid()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPayError(msg ?? 'Error al registrar el pago.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <Modal open onClose={onClose} size="sm" padded={false}>
      <div className="p-6" data-tour="pay-modal">
        {paySuccess ? (
          /* ── Estado: Pago aprobado ── */
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">¡Pago validado!</h3>
            <p className="text-sm text-gray-500 mb-1">Contrato {invoice.contractNumber}</p>
            <p className="text-sm text-gray-500 mb-4">
              Ref. <span className="font-mono font-semibold text-emerald-600">{refNumber}</span>
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-left mb-5">
              <p className="text-sm text-emerald-700 font-semibold mb-1">Tu pago fue confirmado correctamente</p>
              <p className="text-xs text-emerald-600">
                Hemos verificado tu transacción con el sistema bancario. La factura ha sido marcada como <strong>Pagada</strong>. Puedes descargar o guardar este comprobante para tus registros.
              </p>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <button onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold transition-colors">
              Listo
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-800 mb-1">💳 Registrar Pago</h3>
            <p className="text-sm text-gray-500 mb-1">{invoice.contractNumber}</p>
            <p className="text-xs text-gray-400 mb-5">
              Total a pagar: <strong className="text-[#1a5276] text-base">$ {invoice.totalAmount.toFixed(2)}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                <select value={payMethod} onChange={e => setPayMethod(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]">
                  <option value={2}>📱 Pago Móvil</option>
                  <option value={1}>🏦 Transferencia Bancaria</option>
                  <option value={3}>💳 Tarjeta de Débito</option>
                  <option value={4}>💳 Tarjeta de Crédito</option>
                  <option value={5}>💵 Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de referencia *
                </label>
                <input type="text" value={refNumber} onChange={e => { setRefNumber(e.target.value); setPayError('') }}
                  placeholder="Ej: 00123456789"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276] ${payError ? 'border-red-300' : 'border-gray-300'}`} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto del comprobante *
                </label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { setReceipt(e.target.files?.[0] ?? null); setPayError('') }} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-500 hover:border-[#1a5276] hover:text-[#1a5276] transition-colors text-center">
                  {receipt ? `📎 ${receipt.name}` : '📷 Seleccionar imagen'}
                </button>
              </div>

              {/* Estado: pago rechazado */}
              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">❌</span>
                    <div>
                      <p className="text-red-700 font-semibold text-sm mb-1">Pago no validado</p>
                      <p className="text-red-600 text-xs leading-relaxed">{payError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Procesando — indicador visual */}
              {paying && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-[#1a5276] border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="text-xs text-blue-700 font-medium">Verificando con el sistema bancario…</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} disabled={paying}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={handlePay} disabled={paying || !refNumber.trim() || !receipt}
                  className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg hover:bg-[#154360] disabled:opacity-60 font-semibold">
                  {paying ? 'Verificando...' : 'Confirmar Pago'}
                </button>
              </div>

              {import.meta.env.VITE_DEMO_MODE === 'true' && (
                <p className="text-center text-xs text-gray-300 pt-1">
                  Demo: ref. <span className="font-mono">2345</span> = aprobado · <span className="font-mono">554874</span> = rechazado
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

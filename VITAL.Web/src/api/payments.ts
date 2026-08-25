import api from './client'
import { mockSubmitPayment } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const submitPayment = async (
  invoiceId: string,
  referenceNumber: string,
  paymentMethod: number,
  receipt?: File
): Promise<void> => {
  if (DEMO) return mockSubmitPayment(invoiceId, referenceNumber)
  const form = new FormData()
  form.append('invoiceId', invoiceId)
  form.append('referenceNumber', referenceNumber)
  form.append('paymentMethod', String(paymentMethod))
  if (receipt) form.append('receipt', receipt)
  await api.post('/payments', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

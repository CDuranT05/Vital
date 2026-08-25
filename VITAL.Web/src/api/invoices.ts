import api from './client'
import type { Invoice } from '../types'
import { mockGetInvoices, mockGenerateInvoice } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export interface GenerateInvoiceResult {
  invoice: Invoice
  previousReading: number
  consumptionKwh: number
}

export const getInvoices = async (): Promise<Invoice[]> => {
  if (DEMO) return mockGetInvoices()
  const { data } = await api.get('/invoices')
  return data
}

export const generateInvoice = async (meterId: string, currentReading: number): Promise<GenerateInvoiceResult> => {
  if (DEMO) return mockGenerateInvoice(meterId, currentReading)
  const { data } = await api.post('/invoices/generate', { meterId, currentReading })
  return data
}

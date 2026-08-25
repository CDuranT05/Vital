import api from './client'
import type { QrScanResult, Meter } from '../types'
import { mockScanQr, mockRegisterMeter, mockRecordReading } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

interface MeterReading {
  id: string
  meterId: string
  meterNumber: string
  currentReading: number
  readingDate: string
  notes?: string
}

export const scanQr = async (qrCode: string): Promise<QrScanResult> => {
  if (DEMO) return mockScanQr(qrCode)
  const { data } = await api.get(`/meters/scan/${encodeURIComponent(qrCode)}`)
  return data
}

export const registerMeter = async (payload: {
  meterNumber: string
  qrCode: string
  contractId: string
}): Promise<Meter> => {
  if (DEMO) return mockRegisterMeter()
  const { data } = await api.post('/meters/register', payload)
  return data
}

export const recordReading = async (
  meterId: string,
  currentReading: number,
  notes?: string
): Promise<MeterReading> => {
  if (DEMO) return mockRecordReading(meterId, currentReading)
  const { data } = await api.post(`/meters/${meterId}/readings`, { currentReading, notes })
  return data
}

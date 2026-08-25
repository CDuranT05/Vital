import api from './client'
import type { VulnerabilityCase } from '../types'
import { mockGetMyCases, mockGetPendingCases, mockGetCase, mockCreateCase, mockReviewCase, mockUploadEvidence } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const getMyCases = async (): Promise<VulnerabilityCase[]> => {
  if (DEMO) return mockGetMyCases()
  const { data } = await api.get('/vulnerabilitycases/my')
  return data
}

export const getPendingCases = async (): Promise<VulnerabilityCase[]> => {
  if (DEMO) return mockGetPendingCases()
  const { data } = await api.get('/vulnerabilitycases/pending')
  return data
}

export const getCase = async (id: string): Promise<VulnerabilityCase> => {
  if (DEMO) return mockGetCase(id)
  const { data } = await api.get(`/vulnerabilitycases/${id}`)
  return data
}

export const createCase = async (payload: {
  contractId: string
  description: string
  requestType: number
  isRepresentative?: boolean
  beneficiaryIdentityCard?: string
  childrenCount?: number
  childrenIdentifiers?: string
}): Promise<VulnerabilityCase> => {
  if (DEMO) return mockCreateCase(payload)
  const { data } = await api.post('/vulnerabilitycases', payload)
  return data
}

export const reviewCase = async (
  id: string,
  payload: { status: number; vulnerabilityLevel: number; observations?: string }
): Promise<VulnerabilityCase> => {
  if (DEMO) return mockReviewCase(id, payload)
  const { data } = await api.put(`/vulnerabilitycases/${id}/review`, payload)
  return data
}

export const uploadEvidence = async (caseId: string, file: File): Promise<void> => {
  if (DEMO) return mockUploadEvidence()
  const form = new FormData()
  form.append('file', file)
  await api.post(`/vulnerabilitycases/${caseId}/evidence`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

import api from './client'
import { mockGetAlerts, mockAcknowledgeIncident, mockGetAssignedIncidents, mockReportIncident, mockResolveIncident } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export interface IncidentAlert {
  id: string
  contractNumber: string
  serviceAddress: string
  parish: string
  municipality: string
  state: string
  citizenName: string
  citizenPhone: string
  citizenIdentityCard: string
  reportedAt: string
}

export const reportIncident = async (contractId: string): Promise<void> => {
  if (DEMO) return mockReportIncident()
  await api.post('/incidents', { contractId })
}

export const getAlerts = async (): Promise<IncidentAlert[]> => {
  if (DEMO) return mockGetAlerts()
  const { data } = await api.get('/incidents/alerts')
  return data
}

export const acknowledgeIncident = async (id: string): Promise<void> => {
  if (DEMO) return mockAcknowledgeIncident(id)
  await api.put(`/incidents/${id}/acknowledge`)
}

export interface AssignedIncident {
  id: string
  contractNumber: string
  serviceAddress: string
  parish: string
  municipality: string
  state: string
  citizenName: string
  citizenPhone: string
  citizenIdentityCard: string
  reportedAt: string
  attendedAt: string | null
  status: number
}

export const getAssignedIncidents = async (): Promise<AssignedIncident[]> => {
  if (DEMO) return mockGetAssignedIncidents()
  const { data } = await api.get('/incidents/assigned')
  return data
}

export const resolveIncident = async (id: string, notes: string, photos: File[]): Promise<void> => {
  if (DEMO) return mockResolveIncident(id)
  const form = new FormData()
  form.append('resolutionNotes', notes)
  photos.forEach(p => form.append('photos', p))
  await api.put(`/incidents/${id}/resolve`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

import api from './client'
import { mockGetScheduledVisits, mockScheduleVisit } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

// Visita domiciliaria programada por el inspector para un caso social
export interface ScheduledVisit {
  id: string
  caseId: string
  /** Día de la visita en formato YYYY-MM-DD */
  date: string
  citizenName: string
  identityCard?: string
  phone?: string
  contractNumber: string
  serviceAddress: string
  /** Motivo de la solicitud social que origina la visita */
  reason: string
}

export const getScheduledVisits = async (): Promise<ScheduledVisit[]> => {
  if (DEMO) return mockGetScheduledVisits()
  const { data } = await api.get('/homevisits/scheduled')
  return data
}

export const scheduleVisit = async (caseId: string, date: string): Promise<ScheduledVisit> => {
  if (DEMO) return mockScheduleVisit(caseId, date)
  const { data } = await api.post(`/vulnerabilitycases/${caseId}/schedule-visit`, { date })
  return data
}

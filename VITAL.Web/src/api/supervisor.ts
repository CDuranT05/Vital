import api from './client'
import { mockGetGlobalMetrics, mockGetBranchMetrics, mockDownloadReport } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export interface TechnicianMetric {
  id: string
  name: string
  identityCard: string
  incidentsAssigned: number
  incidentsResolved: number
  incidentsPending: number
  transfersCompleted: number
}

export interface InspectorMetric {
  id: string
  name: string
  identityCard: string
  casesReviewed: number
  casesApproved: number
  casesRejected: number
  transfersReviewed: number
  transfersApproved: number
  transfersRejected: number
}

export interface BranchMetrics {
  branchId: string
  branchName: string
  city: string
  activeContracts: number
  totalIncidents: number
  resolvedIncidents: number
  pendingIncidents: number
  totalTransfers: number
  pendingTransfers: number
  completedTransfers: number
  totalCases: number
  pendingCases: number
  approvedCases: number
  rejectedCases: number
  technicians: TechnicianMetric[]
  inspectors: InspectorMetric[]
}

export interface GlobalMetrics {
  totalActiveContracts: number
  totalIncidents: number
  totalResolvedIncidents: number
  totalTransfers: number
  totalCompletedTransfers: number
  totalCases: number
  totalApprovedCases: number
  branches: BranchMetrics[]
}

export const getGlobalMetrics = async (): Promise<GlobalMetrics> => {
  if (DEMO) return mockGetGlobalMetrics()
  const { data } = await api.get('/supervisor/metrics')
  return data
}

export const getBranchMetrics = async (branchId: string): Promise<BranchMetrics> => {
  if (DEMO) return mockGetBranchMetrics(branchId)
  const { data } = await api.get(`/supervisor/metrics/${branchId}`)
  return data
}

export const downloadReport = async (
  type: 'technicians' | 'inspectors' | 'cases' | 'contracts',
  branchId?: string
): Promise<void> => {
  if (DEMO) return mockDownloadReport(type)
  const params = new URLSearchParams({ type })
  if (branchId) params.append('branchId', branchId)
  const response = await api.get(`/supervisor/report?${params}`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `vital-${type}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

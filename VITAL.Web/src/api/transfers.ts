import api from './client'
import { mockGetPendingTransfers, mockApproveTransfer, mockRejectTransfer, mockGetAssignedTransfers, mockCompleteTransfer, mockCreateTransferRequest, mockGetPendingTransferForContract } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export interface TransferDocument {
  id: string
  originalName: string
  documentType: string
  uploadedAt: string
}

export interface TransferRequest {
  id: string
  contractId: string
  contractNumber: string
  serviceAddress: string
  parish: string
  municipality: string
  state: string
  currentOwnerName: string
  currentOwnerIdentityCard: string
  newOwnerIdentityCard: string
  newOwnerFirstName: string
  newOwnerLastName: string
  newOwnerPhone: string
  newOwnerEmail: string
  status: number
  statusLabel: string
  reviewNotes: string | null
  createdAt: string
  reviewedAt: string | null
  documents: TransferDocument[]
}

export interface TechnicianTransfer {
  id: string
  contractId: string
  contractNumber: string
  serviceAddress: string
  parish: string
  municipality: string
  state: string
  currentOwnerName: string
  currentOwnerIdentityCard: string
  newOwnerIdentityCard: string
  newOwnerFirstName: string
  newOwnerLastName: string
  newOwnerPhone: string
  createdAt: string
}

export const createTransferRequest = async (
  contractId: string,
  newOwner: { identityCard: string; firstName: string; lastName: string; phone: string; email: string },
  documents: { file: File; type: string }[]
): Promise<TransferRequest> => {
  if (DEMO) return mockCreateTransferRequest()
  const form = new FormData()
  form.append('contractId', contractId)
  form.append('newOwnerIdentityCard', newOwner.identityCard)
  form.append('newOwnerFirstName', newOwner.firstName)
  form.append('newOwnerLastName', newOwner.lastName)
  form.append('newOwnerPhone', newOwner.phone)
  form.append('newOwnerEmail', newOwner.email)
  documents.forEach(d => form.append('documents', d.file))
  const { data } = await api.post('/transfers', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data
}

export const getPendingTransfers = async (): Promise<TransferRequest[]> => {
  if (DEMO) return mockGetPendingTransfers()
  const { data } = await api.get('/transfers')
  return data
}

export const approveTransfer = async (id: string, notes?: string): Promise<TransferRequest> => {
  if (DEMO) return mockApproveTransfer(id, notes)
  const { data } = await api.put(`/transfers/${id}/approve`, { reviewNotes: notes ?? null })
  return data
}

export const rejectTransfer = async (id: string, notes: string): Promise<TransferRequest> => {
  if (DEMO) return mockRejectTransfer(id, notes)
  const { data } = await api.put(`/transfers/${id}/reject`, { reviewNotes: notes })
  return data
}

export const getAssignedTransfers = async (): Promise<TechnicianTransfer[]> => {
  if (DEMO) return mockGetAssignedTransfers()
  const { data } = await api.get('/transfers/assigned')
  return data
}

export const getPendingTransferForContract = async (contractId: string): Promise<TechnicianTransfer | null> => {
  if (DEMO) return mockGetPendingTransferForContract()
  const { data, status } = await api.get(`/transfers/contract/${contractId}/pending`, { validateStatus: s => s < 500 })
  return status === 204 ? null : data
}

export const completeTransfer = async (id: string): Promise<void> => {
  if (DEMO) return mockCompleteTransfer(id)
  await api.put(`/transfers/${id}/complete`)
}

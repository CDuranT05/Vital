import api from './client'
import type { Contract } from '../types'
import { mockGetContracts } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const getContracts = async (): Promise<Contract[]> => {
  if (DEMO) return mockGetContracts()
  const { data } = await api.get('/contracts')
  return data
}

export const getContract = async (id: string): Promise<Contract> => {
  const { data } = await api.get(`/contracts/${id}`)
  return data
}

export const registerContract = async (payload: {
  citizenIdentityCard: string
  citizenFirstName: string
  citizenLastName: string
  citizenPhone: string
  serviceAddress: string
  isPrimaryResidence: boolean
  contractType: number
  parish: string
  municipality: string
  state: string
  branchId: string
}): Promise<Contract> => {
  const { data } = await api.post('/contracts', payload)
  return data
}

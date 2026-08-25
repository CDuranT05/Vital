import api from './client'
import type { AuthUser } from '../types'
import { mockLogin, mockRegister } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const login = async (identityCard: string, password: string): Promise<AuthUser> => {
  if (DEMO) return mockLogin(identityCard, password)
  const { data } = await api.post('/auth/login', { identityCard, password })
  return data
}

export const register = async (payload: {
  identityCard: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  role: string
}): Promise<AuthUser> => {
  if (DEMO) return mockRegister(payload)
  const { data } = await api.post('/auth/register', payload)
  return data
}

import api from './client'
import { mockGetProfile, mockChangePassword, mockChangeEmail, mockChangePhone } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export interface ProfileData {
  firstName: string
  lastName: string
  identityCard: string
  email: string | null
  phone: string | null
}

export const getProfile = async (): Promise<ProfileData> => {
  if (DEMO) return mockGetProfile()
  const { data } = await api.get('/profile')
  return data
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  if (DEMO) return mockChangePassword()
  await api.put('/profile/change-password', { currentPassword, newPassword })
}

export const changeEmail = async (currentPassword: string, newEmail: string): Promise<void> => {
  if (DEMO) return mockChangeEmail(currentPassword, newEmail)
  await api.put('/profile/change-email', { currentPassword, newEmail })
}

export const changePhone = async (currentPassword: string, newPhone: string): Promise<void> => {
  if (DEMO) return mockChangePhone(currentPassword, newPhone)
  await api.put('/profile/change-phone', { currentPassword, newPhone })
}

import api from './client'
import { mockGetBranches } from './mock'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export interface Branch {
  id: string
  name: string
  city: string
}

export const getBranches = async (): Promise<Branch[]> => {
  if (DEMO) return mockGetBranches()
  const { data } = await api.get('/branches')
  return data
}

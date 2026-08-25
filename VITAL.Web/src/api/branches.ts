import api from './client'

export interface Branch {
  id: string
  name: string
  city: string
}

export const getBranches = async (): Promise<Branch[]> => {
  const { data } = await api.get('/branches')
  return data
}

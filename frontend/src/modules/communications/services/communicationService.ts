import api from '@/services/api'
import type { AutomatedCommunication, CommunicationLog } from '../types'

export default {
  async list(): Promise<AutomatedCommunication[]> {
    const response = await api.get('/communications')
    return response.data
  },

  async create(
    data: Partial<AutomatedCommunication>
  ): Promise<AutomatedCommunication> {
    const response = await api.post('/communications', data)
    return response.data
  },

  async update(
    id: number,
    data: Partial<AutomatedCommunication>
  ): Promise<AutomatedCommunication> {
    const response = await api.put(`/communications/${id}`, data)
    return response.data
  },

  async destroy(id: number): Promise<void> {
    await api.delete(`/communications/${id}`)
  },

  async toggle(id: number): Promise<void> {
    await api.patch(`/communications/${id}/toggle`)
  },

  async execute(): Promise<{ sent: number }> {
    const response = await api.post('/communications/execute')
    return response.data
  },

  async getLog(
    communicationId?: number,
    page?: number,
    limit?: number
  ): Promise<{ data: CommunicationLog[]; meta: any }> {
    const response = await api.get('/communications/log', {
      params: { communicationId, page, limit },
    })
    return response.data
  },
}

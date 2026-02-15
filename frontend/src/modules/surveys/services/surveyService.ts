import api from '@/services/api'
import type { Survey, CreateSurveyData, SurveyResponse, SurveyResults } from '../types'

class SurveyService {
  async list(): Promise<Survey[]> {
    const response = await api.get<{ data: Survey[] }>('/surveys')
    return response.data.data
  }

  async getById(id: number): Promise<Survey> {
    const response = await api.get<{ data: Survey }>(`/surveys/${id}`)
    return response.data.data
  }

  async create(data: CreateSurveyData): Promise<Survey> {
    const response = await api.post<{ data: Survey }>('/surveys', data)
    return response.data.data
  }

  async update(id: number, data: Partial<CreateSurveyData>): Promise<Survey> {
    const response = await api.put<{ data: Survey }>(`/surveys/${id}`, data)
    return response.data.data
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/surveys/${id}`)
  }

  async activate(id: number): Promise<Survey> {
    const response = await api.put<{ data: Survey }>(`/surveys/${id}/activate`)
    return response.data.data
  }

  async close(id: number): Promise<Survey> {
    const response = await api.put<{ data: Survey }>(`/surveys/${id}/close`)
    return response.data.data
  }

  async getPending(): Promise<Survey[]> {
    const response = await api.get<{ data: Survey[] }>('/surveys/pending')
    return response.data.data
  }

  async respond(id: number, answers: Record<number, any>): Promise<SurveyResponse> {
    const response = await api.post<{ data: SurveyResponse }>(`/surveys/${id}/respond`, { answers })
    return response.data.data
  }

  async getResults(id: number): Promise<SurveyResults> {
    const response = await api.get<{ data: SurveyResults }>(`/surveys/${id}/results`)
    return response.data.data
  }
}

export default new SurveyService()

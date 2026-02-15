import api from '@/services/api'
import type {
  TurnoverRecord,
  TurnoverRate,
  TurnoverByDepartment,
  TurnoverByReason,
  TurnoverTrend,
} from '../types'

export default {
  async list(filters?: any): Promise<{ data: TurnoverRecord[]; meta: any }> {
    const response = await api.get('/turnover', { params: filters })
    return response.data
  },

  async record(data: Partial<TurnoverRecord>): Promise<TurnoverRecord> {
    const response = await api.post('/turnover', data)
    return response.data
  },

  async getRate(
    from: string,
    to: string,
    departmentId?: number
  ): Promise<TurnoverRate> {
    const response = await api.get('/turnover/rate', {
      params: { from, to, departmentId },
    })
    return response.data
  },

  async getByDepartment(year: number): Promise<TurnoverByDepartment[]> {
    const response = await api.get('/turnover/by-department', {
      params: { year },
    })
    return response.data
  },

  async getByReason(from: string, to: string): Promise<TurnoverByReason[]> {
    const response = await api.get('/turnover/by-reason', {
      params: { from, to },
    })
    return response.data
  },

  async getTrend(months?: number): Promise<TurnoverTrend[]> {
    const response = await api.get('/turnover/trend', {
      params: { months },
    })
    return response.data
  },

  async getAverageTenure(departmentId?: number): Promise<{ averageMonths: number }> {
    const response = await api.get('/turnover/average-tenure', {
      params: { departmentId },
    })
    return response.data
  },
}

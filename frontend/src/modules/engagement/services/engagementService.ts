import api from '@/services/api'
import type { EngagementScore, EngagementRanking, DepartmentAverage } from '../types'

export default {
  async getRanking(
    month: number,
    year: number,
    limit?: number
  ): Promise<EngagementRanking[]> {
    const response = await api.get('/engagement/ranking', {
      params: { month, year, limit },
    })
    return response.data
  },

  async getCompanyAverage(
    month: number,
    year: number
  ): Promise<{ average: number; totalEmployees: number }> {
    const response = await api.get('/engagement/company-average', {
      params: { month, year },
    })
    return response.data
  },

  async getDepartmentAverage(
    departmentId: number,
    month: number,
    year: number
  ): Promise<DepartmentAverage> {
    const response = await api.get(`/engagement/departments/${departmentId}`, {
      params: { month, year },
    })
    return response.data
  },

  async getEmployeeHistory(
    employeeId: number,
    months?: number
  ): Promise<EngagementScore[]> {
    const response = await api.get(`/engagement/employees/${employeeId}/history`, {
      params: { months },
    })
    return response.data
  },

  async calculateForEmployee(
    employeeId: number,
    month: number,
    year: number
  ): Promise<EngagementScore> {
    const response = await api.post('/engagement/calculate', {
      employeeId,
      month,
      year,
    })
    return response.data
  },

  async calculateAll(
    month: number,
    year: number
  ): Promise<{ calculated: number }> {
    const response = await api.post('/engagement/calculate-all', {
      month,
      year,
    })
    return response.data
  },
}

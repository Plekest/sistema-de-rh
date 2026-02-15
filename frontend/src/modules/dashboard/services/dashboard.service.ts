import api from '@/services/api'
import type { AdminDashboard, EmployeeDashboard, BirthdayEmployee } from '../types'

class DashboardService {
  async getAdminDashboard(): Promise<AdminDashboard> {
    const response = await api.get<{ data: AdminDashboard }>('/dashboard/admin')
    return response.data.data
  }

  async getEmployeeDashboard(): Promise<EmployeeDashboard> {
    const response = await api.get<{ data: EmployeeDashboard }>('/dashboard/employee')
    return response.data.data
  }

  async getBirthdays(days: number = 30): Promise<BirthdayEmployee[]> {
    const response = await api.get<{ data: BirthdayEmployee[] }>('/dashboard/birthdays', {
      params: { days },
    })
    return response.data.data
  }
}

export default new DashboardService()

import api from '@/services/api'
import type { LifecycleEvent, LifecycleSummary, LifecycleFilters } from '../types'

class LifecycleService {
  async getTimeline(employeeId: number, filters?: LifecycleFilters): Promise<LifecycleEvent[]> {
    const response = await api.get<{ data: LifecycleEvent[] }>(`/employees/${employeeId}/lifecycle`, { params: filters })
    return response.data.data
  }

  async getSummary(employeeId: number): Promise<LifecycleSummary> {
    const response = await api.get<{ data: LifecycleSummary }>(`/employees/${employeeId}/lifecycle/summary`)
    return response.data.data
  }
}

export default new LifecycleService()

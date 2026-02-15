import axios from '@/services/api'
import type { CareerPath, CareerPathLevel, SuccessionPlan, EmployeeCareerPlan } from '../types'

const BASE_URL = '/career'

export default {
  // Career Paths
  async getPaths(): Promise<CareerPath[]> {
    const { data } = await axios.get(`${BASE_URL}/paths`)
    return data
  },

  async createPath(payload: Partial<CareerPath>): Promise<CareerPath> {
    const { data } = await axios.post(`${BASE_URL}/paths`, payload)
    return data
  },

  async updatePath(id: number, payload: Partial<CareerPath>): Promise<CareerPath> {
    const { data } = await axios.put(`${BASE_URL}/paths/${id}`, payload)
    return data
  },

  async deletePath(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/paths/${id}`)
  },

  // Career Path Levels
  async createLevel(pathId: number, payload: Partial<CareerPathLevel>): Promise<CareerPathLevel> {
    const { data } = await axios.post(`${BASE_URL}/paths/${pathId}/levels`, payload)
    return data
  },

  async updateLevel(id: number, payload: Partial<CareerPathLevel>): Promise<CareerPathLevel> {
    const { data } = await axios.put(`${BASE_URL}/levels/${id}`, payload)
    return data
  },

  async deleteLevel(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/levels/${id}`)
  },

  // Employee Career
  async getEmployeeCareer(employeeId: number): Promise<EmployeeCareerPlan> {
    const { data } = await axios.get(`${BASE_URL}/employees/${employeeId}`)
    return data
  },

  // Succession Planning
  async getSuccessionPlans(): Promise<SuccessionPlan[]> {
    const { data } = await axios.get(`${BASE_URL}/succession`)
    return data
  },

  async createSuccessionPlan(payload: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    const { data } = await axios.post(`${BASE_URL}/succession`, payload)
    return data
  },

  async updateSuccessionPlan(id: number, payload: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
    const { data } = await axios.put(`${BASE_URL}/succession/${id}`, payload)
    return data
  },

  async deleteSuccessionPlan(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/succession/${id}`)
  },

  async getCriticalPositions(): Promise<Array<{ position: { id: number; title: string }; reason: string }>> {
    const { data } = await axios.get(`${BASE_URL}/critical-positions`)
    return data
  },
}

import axios from '@/services/api'
import type {
  SkillCategory,
  Skill,
  EmployeeSkill,
  SkillGapReport,
  DepartmentSkillMatrix,
  CreateSkillCategoryData,
  CreateSkillData,
  AssessSkillData,
} from '../types'

const BASE_URL = '/skills'

export default {
  // Categorias
  async getCategories(): Promise<SkillCategory[]> {
    const { data } = await axios.get(`${BASE_URL}/categories`)
    return data.data
  },

  async createCategory(payload: CreateSkillCategoryData): Promise<SkillCategory> {
    const { data } = await axios.post(`${BASE_URL}/categories`, payload)
    return data.data
  },

  async updateCategory(id: number, payload: Partial<CreateSkillCategoryData>): Promise<SkillCategory> {
    const { data } = await axios.put(`${BASE_URL}/categories/${id}`, payload)
    return data.data
  },

  async deleteCategory(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/categories/${id}`)
  },

  // Skills
  async getSkills(): Promise<Skill[]> {
    const { data } = await axios.get(BASE_URL)
    return data.data
  },

  async createSkill(payload: CreateSkillData): Promise<Skill> {
    const { data } = await axios.post(BASE_URL, payload)
    return data.data
  },

  async updateSkill(id: number, payload: Partial<CreateSkillData>): Promise<Skill> {
    const { data } = await axios.put(`${BASE_URL}/${id}`, payload)
    return data.data
  },

  async deleteSkill(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`)
  },

  // Employee Skills
  async getEmployeeSkills(employeeId: number): Promise<EmployeeSkill[]> {
    const { data } = await axios.get(`${BASE_URL}/employees/${employeeId}`)
    return data.data
  },

  async assessSkill(payload: AssessSkillData): Promise<EmployeeSkill> {
    const { data} = await axios.post(`${BASE_URL}/assess`, payload)
    return data.data
  },

  async assessSkillsBulk(employeeId: number, skills: AssessSkillData[]): Promise<{ assessed: number }> {
    const { data } = await axios.post(`${BASE_URL}/assess/bulk`, { employeeId, skills })
    return data.data
  },

  // Reports
  async getGapReport(employeeId: number): Promise<SkillGapReport> {
    const { data } = await axios.get(`${BASE_URL}/gap-report/${employeeId}`)
    return data.data
  },

  async getDepartmentMatrix(departmentId: number): Promise<DepartmentSkillMatrix> {
    const { data } = await axios.get(`${BASE_URL}/department-matrix/${departmentId}`)
    return data.data
  },

  async getSkillDistribution(skillId: number): Promise<Array<{ level: number; count: number }>> {
    const { data } = await axios.get(`${BASE_URL}/distribution/${skillId}`)
    return data.data
  },
}

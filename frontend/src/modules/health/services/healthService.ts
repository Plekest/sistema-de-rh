import axios from '@/services/api'
import type { OccupationalExam, MedicalCertificate, HealthDashboard } from '../types'

const BASE_URL = '/health'

export default {
  // Exams
  async getExams(): Promise<OccupationalExam[]> {
    const { data } = await axios.get(`${BASE_URL}/exams`)
    return data
  },

  async createExam(payload: Partial<OccupationalExam>): Promise<OccupationalExam> {
    const { data } = await axios.post(`${BASE_URL}/exams`, payload)
    return data
  },

  async updateExam(id: number, payload: Partial<OccupationalExam>): Promise<OccupationalExam> {
    const { data } = await axios.put(`${BASE_URL}/exams/${id}`, payload)
    return data
  },

  async deleteExam(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/exams/${id}`)
  },

  async getUpcomingExams(): Promise<OccupationalExam[]> {
    const { data } = await axios.get(`${BASE_URL}/exams/upcoming`)
    return data
  },

  async getExpiredExams(): Promise<OccupationalExam[]> {
    const { data } = await axios.get(`${BASE_URL}/exams/expired`)
    return data
  },

  async completeExam(id: number, result: OccupationalExam['result'], restrictions?: string): Promise<OccupationalExam> {
    const { data } = await axios.patch(`${BASE_URL}/exams/${id}/complete`, { result, restrictions })
    return data
  },

  // Certificates
  async getCertificates(): Promise<MedicalCertificate[]> {
    const { data } = await axios.get(`${BASE_URL}/certificates`)
    return data
  },

  async createCertificate(payload: Partial<MedicalCertificate>): Promise<MedicalCertificate> {
    const { data } = await axios.post(`${BASE_URL}/certificates`, payload)
    return data
  },

  async approveCertificate(id: number): Promise<MedicalCertificate> {
    const { data } = await axios.patch(`${BASE_URL}/certificates/${id}/approve`)
    return data
  },

  async rejectCertificate(id: number, reason?: string): Promise<MedicalCertificate> {
    const { data } = await axios.patch(`${BASE_URL}/certificates/${id}/reject`, { reason })
    return data
  },

  // Dashboard
  async getDashboard(): Promise<HealthDashboard> {
    const { data } = await axios.get(`${BASE_URL}/dashboard`)
    return data
  },
}

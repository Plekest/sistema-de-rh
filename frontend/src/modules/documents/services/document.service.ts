import api from '@/services/api'
import type { EmployeeDocument } from '../types'
import type { PaginatedResponse } from '@/modules/employees/types'

/**
 * Servico de documentos - gerencia chamadas a API de documents
 */
class DocumentService {
  /**
   * Lista documentos de um colaborador
   */
  async getAll(employeeId: number, params?: { type?: string; page?: number; limit?: number }): Promise<PaginatedResponse<EmployeeDocument>> {
    const response = await api.get<PaginatedResponse<EmployeeDocument>>(`/employees/${employeeId}/documents`, { params })
    return response.data
  }

  /**
   * Busca documento por ID
   */
  async getById(id: number): Promise<EmployeeDocument> {
    const response = await api.get<{ data: EmployeeDocument }>(`/documents/${id}`)
    return response.data.data
  }

  /**
   * Faz upload de documento para um colaborador
   */
  async upload(employeeId: number, formData: FormData): Promise<EmployeeDocument> {
    const response = await api.post<{ data: EmployeeDocument }>(`/employees/${employeeId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  }

  /**
   * Remove documento
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/documents/${id}`)
  }

  /**
   * Retorna URL de download do documento
   */
  getDownloadUrl(id: number): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'
    return `${baseUrl}/documents/${id}/download`
  }

  /**
   * Retorna URL de visualizacao do documento
   */
  getViewUrl(id: number): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'
    return `${baseUrl}/documents/${id}/view`
  }
}

export default new DocumentService()

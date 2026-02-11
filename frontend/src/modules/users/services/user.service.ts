import api from '@/services/api'
import type { SystemUser, UserFormData, UserListParams } from '../types'
import type { PaginatedResponse } from '@/modules/employees/types'

/**
 * Servico de usuarios - gerencia chamadas a API de users
 */
class UserService {
  /**
   * Lista usuarios com paginacao e filtros
   */
  async getAll(params?: UserListParams): Promise<PaginatedResponse<SystemUser>> {
    const response = await api.get<PaginatedResponse<SystemUser>>('/users', { params })
    return response.data
  }

  /**
   * Busca usuario por ID
   */
  async getById(id: number): Promise<SystemUser> {
    const response = await api.get<SystemUser>(`/users/${id}`)
    return response.data
  }

  /**
   * Cria novo usuario
   */
  async create(data: UserFormData): Promise<SystemUser> {
    const response = await api.post<SystemUser>('/users', data)
    return response.data
  }

  /**
   * Atualiza usuario existente
   */
  async update(id: number, data: Partial<UserFormData>): Promise<SystemUser> {
    const response = await api.put<SystemUser>(`/users/${id}`, data)
    return response.data
  }

  /**
   * Remove usuario
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  }
}

export default new UserService()

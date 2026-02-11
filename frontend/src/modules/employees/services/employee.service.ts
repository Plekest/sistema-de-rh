import api from '@/services/api'
import type {
  Employee,
  EmployeeFormData,
  EmployeeListParams,
  Department,
  Position,
  PaginatedResponse,
} from '../types'

/**
 * Servico de colaboradores - gerencia chamadas a API de employees
 */
class EmployeeService {
  /**
   * Lista colaboradores com paginacao e filtros
   */
  async getAll(params?: EmployeeListParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>('/employees', { params })
    return response.data
  }

  /**
   * Busca colaborador por ID
   */
  async getById(id: number): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`)
    return response.data
  }

  /**
   * Cria novo colaborador
   */
  async create(data: EmployeeFormData): Promise<Employee> {
    const response = await api.post<Employee>('/employees', data)
    return response.data
  }

  /**
   * Atualiza colaborador existente
   */
  async update(id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    const response = await api.put<Employee>(`/employees/${id}`, data)
    return response.data
  }

  /**
   * Remove colaborador
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/employees/${id}`)
  }

  /**
   * Lista departamentos
   */
  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/departments')
    return response.data
  }

  /**
   * Lista cargos
   */
  async getPositions(): Promise<Position[]> {
    const response = await api.get<Position[]>('/positions')
    return response.data
  }
}

export default new EmployeeService()

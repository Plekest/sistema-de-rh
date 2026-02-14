import api from '@/services/api'
import type {
  Employee,
  EmployeeFormData,
  EmployeeListParams,
  Department,
  Position,
  PaginatedResponse,
  CreateEmployeeResponse,
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
    const response = await api.get<{ data: Employee }>(`/employees/${id}`)
    return response.data.data
  }

  /**
   * Cria novo colaborador
   * Retorna o colaborador criado e, opcionalmente, a senha temporaria gerada
   */
  async create(data: EmployeeFormData): Promise<CreateEmployeeResponse> {
    const response = await api.post<CreateEmployeeResponse>('/employees', data)
    return response.data
  }

  /**
   * Atualiza colaborador existente
   */
  async update(id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    const response = await api.put<{ data: Employee }>(`/employees/${id}`, data)
    return response.data.data
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
    const response = await api.get<{ data: Department[] }>('/departments')
    return response.data.data
  }

  /**
   * Lista cargos
   */
  async getPositions(): Promise<Position[]> {
    const response = await api.get<{ data: Position[] }>('/positions')
    return response.data.data
  }
}

export default new EmployeeService()

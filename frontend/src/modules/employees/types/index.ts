export interface Employee {
  id: number
  userId?: number
  registrationNumber?: string
  fullName: string
  cpf?: string
  cnpj?: string
  rg?: string
  email: string
  phone?: string
  type: 'clt' | 'pj'
  departmentId?: number
  positionId?: number
  department?: Department
  position?: Position
  hireDate: string
  terminationDate?: string
  salary?: number
  status: 'active' | 'inactive' | 'terminated'
  birthDate?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeFormData {
  fullName: string
  cpf?: string
  cnpj?: string
  rg?: string
  email: string
  phone?: string
  type: 'clt' | 'pj'
  departmentId?: number | null
  positionId?: number | null
  registrationNumber?: string
  hireDate: string
  terminationDate?: string
  salary?: number | null
  status: 'active' | 'inactive' | 'terminated'
  birthDate?: string
  addressStreet?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  notes?: string
}

export interface Department {
  id: number
  name: string
}

export interface Position {
  id: number
  title: string
  departmentId?: number
}

export interface EmployeeListParams {
  page?: number
  limit?: number
  search?: string
  type?: 'clt' | 'pj' | ''
  status?: 'active' | 'inactive' | 'terminated' | ''
  departmentId?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
  }
}

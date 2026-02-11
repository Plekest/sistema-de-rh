export interface SystemUser {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserFormData {
  fullName: string
  email: string
  password?: string
  role: 'admin' | 'manager' | 'employee'
  isActive?: boolean
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: 'admin' | 'manager' | 'employee' | ''
  isActive?: boolean | ''
}

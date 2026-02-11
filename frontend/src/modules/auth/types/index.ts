export interface User {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  role?: 'admin' | 'manager' | 'employee'
}

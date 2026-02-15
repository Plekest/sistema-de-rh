export interface UserPermissions {
  employees: boolean
  attendance: boolean
  hours_bank: boolean
  documents: boolean
  history: boolean
  leave: boolean
  benefits: boolean
  payroll: boolean
  performance: boolean
  recruitment: boolean
  training: boolean
  calendar: boolean
  onboarding: boolean
  surveys: boolean
  orgchart: boolean
  dashboard: boolean
  skills: boolean
  career: boolean
  health: boolean
  analytics: boolean
}

export interface User {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  isActive: boolean
  employeeId: number | null
  permissions: UserPermissions
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

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  password_confirmation: string
}

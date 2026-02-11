import api from '@/services/api'
import type { LoginCredentials, LoginResponse, RegisterData, User, ForgotPasswordData, ResetPasswordData } from '../types'

/**
 * Serviço de autenticação - gerencia chamadas à API de auth
 */
class AuthService {
  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  /**
   * Busca informações do usuário autenticado
   */
  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  }

  /**
   * Registra novo usuário (admin only)
   */
  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  }

  /**
   * Solicita recuperação de senha
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', data)
    return response.data
  }

  /**
   * Redefine a senha com token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', data)
    return response.data
  }
}

export default new AuthService()

import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import { loginValidator, registerValidator } from '#validators/auth_validator'

export default class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * POST /api/v1/auth/login
   * Autentica o usuário e retorna um access token
   */
  async login({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(loginValidator)
      const result = await this.authService.login(data.email, data.password)

      return response.ok({
        token: result.token.value!.release(),
        user: {
          id: result.user.id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
          isActive: result.user.isActive,
        },
      })
    } catch (error) {
      return response.unauthorized({
        message: error.message || 'Credenciais inválidas',
      })
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Revoga o token atual do usuário autenticado
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Revoga todos os tokens do usuário
      await this.authService.logout(user)

      return response.ok({ message: 'Logout realizado com sucesso' })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao fazer logout',
      })
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retorna os dados do usuário autenticado
   */
  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const userData = await this.authService.me(user)

      return response.ok({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
      })
    } catch (error) {
      return response.unauthorized({
        message: 'Não autenticado',
      })
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registra um novo usuário (apenas admin)
   */
  async register({ request, auth, response }: HttpContext) {
    try {
      const currentUser = auth.user

      const data = await request.validateUsing(registerValidator)
      const user = await this.authService.register(data, currentUser)

      return response.created({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao registrar usuário',
      })
    }
  }
}

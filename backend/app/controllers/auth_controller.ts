import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import AuditLogService from '#services/audit_log_service'
import { loginValidator, registerValidator, forgotPasswordValidator, resetPasswordValidator } from '#validators/auth_validator'

export default class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * POST /api/v1/auth/login
   * Autentica o usuario e retorna um access token
   */
  async login({ request, response }: HttpContext) {
    let data: any = null
    try {
      data = await request.validateUsing(loginValidator)
      const result = await this.authService.login(data.email, data.password)

      // Registra login bem-sucedido no audit log
      await AuditLogService.log({
        userId: result.user.id,
        action: 'login',
        resourceType: 'auth',
        resourceId: result.user.id,
        description: `Login realizado com sucesso para ${result.user.email}`,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      })

      return response.ok({
        token: result.token.value!.release(),
        user: result.user,
      })
    } catch (error) {
      // Registra tentativa de login falhada
      await AuditLogService.log({
        userId: null,
        action: 'login',
        resourceType: 'auth',
        resourceId: null,
        description: `Tentativa de login falhada para ${data?.email || 'email desconhecido'}`,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      })

      return response.unauthorized({
        message: error.message || 'Credenciais invalidas',
      })
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Revoga o token atual do usuário autenticado
   */
  async logout({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Revoga todos os tokens do usuário
      await this.authService.logout(user)

      // Registra logout no audit log
      await AuditLogService.log({
        userId: user.id,
        action: 'logout',
        resourceType: 'auth',
        resourceId: user.id,
        description: `Logout realizado para ${user.email}`,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      })

      return response.ok({ message: 'Logout realizado com sucesso' })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao fazer logout',
      })
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retorna os dados do usuario autenticado com employeeId e permissions
   */
  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const userData = await this.authService.me(user)

      return response.ok(userData)
    } catch (error) {
      return response.unauthorized({
        message: 'Nao autenticado',
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

  /**
   * POST /api/v1/auth/forgot-password
   * Solicita recuperação de senha
   */
  async forgotPassword({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(forgotPasswordValidator)
      await this.authService.forgotPassword(data.email)
      return response.ok({
        message: 'Se o email existir, um link de recuperação será enviado',
      })
    } catch (error) {
      // Sempre retorna sucesso para não revelar existência de emails
      return response.ok({
        message: 'Se o email existir, um link de recuperação será enviado',
      })
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   * Redefine a senha usando o token
   */
  async resetPassword({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(resetPasswordValidator)
      await this.authService.resetPassword(data.token, data.password)
      return response.ok({
        message: 'Senha redefinida com sucesso',
      })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao redefinir senha',
      })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware que verifica se o usuário autenticado possui uma das roles permitidas
 */
export default class RoleMiddleware {
  async handle(
    { auth, response }: HttpContext,
    next: NextFn,
    options: { roles: Array<'admin' | 'manager' | 'employee'> }
  ) {
    try {
      // Garante que o usuário está autenticado
      const user = auth.getUserOrFail()

      // Verifica se o usuário possui uma das roles permitidas
      if (!options.roles.includes(user.role)) {
        return response.forbidden({
          message: 'Você não tem permissão para acessar este recurso',
        })
      }

      // Prossegue para o próximo middleware/controller
      await next()
    } catch (error) {
      return response.unauthorized({
        message: 'Não autenticado',
      })
    }
  }
}

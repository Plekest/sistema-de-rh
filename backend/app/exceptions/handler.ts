import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

/**
 * Handler global de erros.
 * Garante respostas padronizadas: { message: string, errors?: Record<string, string[]> }
 * Nunca expoe detalhes internos (stack traces, queries SQL) em producao.
 */
export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  /**
   * Status codes que nao devem ser reportados no log (erros esperados)
   */
  protected ignoreStatuses = [400, 401, 403, 404, 422]

  async handle(error: any, ctx: HttpContext) {
    const status = error.status || error.statusCode || 500
    const code = error.code || undefined

    // Erros de validacao VineJS
    if (code === 'E_VALIDATION_ERROR' || error.messages) {
      return ctx.response.status(422).json({
        message: 'Dados invalidos',
        errors: this.formatValidationErrors(error.messages),
      })
    }

    // Registro nao encontrado (Lucid)
    if (code === 'E_ROW_NOT_FOUND') {
      return ctx.response.notFound({
        message: 'Recurso nao encontrado',
      })
    }

    // Erro de autenticacao
    if (code === 'E_UNAUTHORIZED_ACCESS' || status === 401) {
      return ctx.response.unauthorized({
        message: 'Nao autenticado',
      })
    }

    // Erro de autorizacao (forbidden)
    if (status === 403) {
      return ctx.response.forbidden({
        message: error.message || 'Sem permissao para acessar este recurso',
      })
    }

    // Erro de rota nao encontrada
    if (code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.notFound({
        message: 'Rota nao encontrada',
      })
    }

    // Erros 4xx genericos (bad request, conflict, etc.)
    if (status >= 400 && status < 500) {
      return ctx.response.status(status).json({
        message: error.message || 'Requisicao invalida',
      })
    }

    // Erros 5xx: nunca expor detalhes internos em producao
    if (app.inProduction) {
      return ctx.response.internalServerError({
        message: 'Erro interno do servidor',
      })
    }

    // Em desenvolvimento, expor detalhes para facilitar debug
    return ctx.response.status(status).json({
      message: error.message || 'Erro interno do servidor',
      code,
      stack: error.stack,
    })
  }

  async report(error: any, ctx: HttpContext) {
    const status = error.status || error.statusCode || 500

    // Nao logar erros de validacao e autenticacao (sao esperados)
    if (this.ignoreStatuses.includes(status)) {
      return
    }

    // Logar erros 5xx e inesperados
    ctx.logger.error(
      {
        err: error,
        url: ctx.request.url(),
        method: ctx.request.method(),
        ip: ctx.request.ip(),
        userId: ctx.auth?.user?.id || null,
      },
      error.message || 'Erro nao tratado'
    )
  }

  /**
   * Formata erros de validacao VineJS para o padrao da API
   */
  private formatValidationErrors(messages: any): Record<string, string[]> {
    if (!messages) return {}

    // VineJS retorna array de { field, message, rule }
    if (Array.isArray(messages)) {
      const errors: Record<string, string[]> = {}
      for (const msg of messages) {
        const field = msg.field || 'general'
        if (!errors[field]) {
          errors[field] = []
        }
        errors[field].push(msg.message || 'Valor invalido')
      }
      return errors
    }

    // Caso ja venha como objeto { field: string[] }
    if (typeof messages === 'object') {
      return messages
    }

    return {}
  }
}

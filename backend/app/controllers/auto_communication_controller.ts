import type { HttpContext } from '@adonisjs/core/http'
import AutoCommunicationService from '#services/auto_communication_service'
import {
  createCommunicationValidator,
  updateCommunicationValidator,
} from '#validators/auto_communication_validator'

export default class AutoCommunicationController {
  private service: AutoCommunicationService

  constructor() {
    this.service = new AutoCommunicationService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const isActive = request.input('is_active')
      const filters = isActive !== undefined ? { is_active: isActive === 'true' } : {}

      const communications = await this.service.list(filters)
      return response.ok({ data: communications })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao listar comunicações automatizadas',
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCommunicationValidator)
      const userId = auth.user?.id

      const communication = await this.service.create(data, userId)
      return response.created({ data: communication })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao criar comunicação automatizada',
      })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateCommunicationValidator)
      const userId = auth.user?.id

      const communication = await this.service.update(params.id, data, userId)
      return response.ok({ data: communication })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Comunicação não encontrada' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao atualizar comunicação automatizada',
      })
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      await this.service.delete(params.id, userId)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Comunicação não encontrada' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao deletar comunicação automatizada',
      })
    }
  }

  async toggle({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const communication = await this.service.toggle(params.id, userId)
      return response.ok({ data: communication })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Comunicação não encontrada' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao ativar/desativar comunicação',
      })
    }
  }

  async execute({ request, auth, response }: HttpContext) {
    try {
      const communicationId = request.input('communication_id')
      const userId = auth.user?.id

      const results = await this.service.execute(communicationId, userId)
      return response.ok({ data: results })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao executar comunicações automatizadas',
      })
    }
  }

  async log({ params, request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 20)

      const result = await this.service.getLog(params.id, page, limit)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar histórico de comunicações',
      })
    }
  }
}

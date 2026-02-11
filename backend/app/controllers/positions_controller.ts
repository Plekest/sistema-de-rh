import type { HttpContext } from '@adonisjs/core/http'
import PositionService from '#services/position_service'
import { createPositionValidator, updatePositionValidator } from '#validators/position_validator'

export default class PositionsController {
  private service: PositionService

  constructor() {
    this.service = new PositionService()
  }

  async index({ response }: HttpContext) {
    const positions = await this.service.list()
    return response.ok({ data: positions })
  }

  async show({ params, response }: HttpContext) {
    try {
      const position = await this.service.findById(params.id)
      return response.ok({ data: position })
    } catch {
      return response.notFound({ message: 'Cargo nao encontrado' })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createPositionValidator)
      const position = await this.service.create(data)
      return response.created({ data: position })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar cargo' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updatePositionValidator)
      const position = await this.service.update(params.id, data)
      return response.ok({ data: position })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Cargo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar cargo' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.service.delete(params.id)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Cargo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover cargo' })
    }
  }
}

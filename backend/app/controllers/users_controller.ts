import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'
import { createUserValidator, updateUserValidator, listUserValidator } from '#validators/user_validator'

export default class UsersController {
  private service: UserService

  constructor() {
    this.service = new UserService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listUserValidator)
      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar usuarios' })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const user = await this.service.findById(params.id)
      return response.ok({ data: user })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Usuario nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar usuario' })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createUserValidator)
      const user = await this.service.create(data)
      return response.created({ data: user })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar usuario' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateUserValidator)
      const user = await this.service.update(params.id, data)
      return response.ok({ data: user })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Usuario nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar usuario' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.service.delete(params.id)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Usuario nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao desativar usuario' })
    }
  }
}

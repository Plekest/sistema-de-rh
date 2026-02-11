import type { HttpContext } from '@adonisjs/core/http'
import DepartmentService from '#services/department_service'
import {
  createDepartmentValidator,
  updateDepartmentValidator,
} from '#validators/department_validator'

export default class DepartmentsController {
  private service: DepartmentService

  constructor() {
    this.service = new DepartmentService()
  }

  async index({ response }: HttpContext) {
    const departments = await this.service.list()
    return response.ok({ data: departments })
  }

  async show({ params, response }: HttpContext) {
    try {
      const department = await this.service.findById(params.id)
      return response.ok({ data: department })
    } catch {
      return response.notFound({ message: 'Departamento nao encontrado' })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createDepartmentValidator)
      const department = await this.service.create(data)
      return response.created({ data: department })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar departamento' })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateDepartmentValidator)
      const department = await this.service.update(params.id, data)
      return response.ok({ data: department })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Departamento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar departamento' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.service.delete(params.id)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Departamento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover departamento' })
    }
  }
}

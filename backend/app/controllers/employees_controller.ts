import type { HttpContext } from '@adonisjs/core/http'
import EmployeeService from '#services/employee_service'
import {
  createEmployeeValidator,
  updateEmployeeValidator,
  listEmployeeValidator,
} from '#validators/employee_validator'
import { canAccessEmployee } from '#helpers/rbac_helper'
import Employee from '#models/employee'

export default class EmployeesController {
  private service: EmployeeService

  constructor() {
    this.service = new EmployeeService()
  }

  async index(ctx: HttpContext) {
    const { auth, request, response } = ctx
    try {
      const user = auth.getUserOrFail()

      // Employee nao pode listar todos os colaboradores, apenas ver o proprio perfil
      if (user.role === 'employee') {
        const employee = await Employee.query()
          .where('userId', user.id)
          .where('status', 'active')
          .preload('user')
          .preload('department')
          .preload('position')
          .first()

        if (!employee) {
          return response.ok({ data: [], meta: { total: 0, page: 1, lastPage: 1 } })
        }

        return response.ok({
          data: [employee],
          meta: { total: 1, page: 1, lastPage: 1 },
        })
      }

      // Admin/Manager podem listar todos
      const filters = await request.validateUsing(listEmployeeValidator)
      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar colaboradores' })
    }
  }

  async show(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const employee = await this.service.findById(params.id)
      const canAccess = await canAccessEmployee(ctx, employee.id)
      if (!canAccess) {
        return response.forbidden({
          message: 'Voce nao tem permissao para acessar este colaborador',
        })
      }
      return response.ok({ data: employee })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar colaborador' })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createEmployeeValidator)
      const currentUserId = auth.user?.id
      const { employee, temporaryPassword } = await this.service.create(data, currentUserId)

      const responseData: Record<string, unknown> = { data: employee }
      if (temporaryPassword) {
        responseData.temporaryPassword = temporaryPassword
      }

      return response.created(responseData)
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar colaborador' })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateEmployeeValidator)
      const currentUserId = auth.user?.id
      const employee = await this.service.update(params.id, data, currentUserId)
      return response.ok({ data: employee })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar colaborador' })
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      await this.service.delete(params.id, currentUserId)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover colaborador' })
    }
  }
}

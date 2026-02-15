import type { HttpContext } from '@adonisjs/core/http'
import DataChangeRequestService from '#services/data_change_request_service'
import {
  createDataChangeRequestValidator,
  listDataChangeRequestValidator,
  reviewDataChangeRequestValidator,
} from '#validators/data_change_request_validator'
import Employee from '#models/employee'

export default class DataChangeRequestsController {
  private service: DataChangeRequestService

  constructor() {
    this.service = new DataChangeRequestService()
  }

  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const data = await request.validateUsing(createDataChangeRequestValidator)

      // Employee pode criar apenas para si mesmo
      if (user.role === 'employee') {
        const employee = await Employee.query()
          .where('userId', user.id)
          .where('status', 'active')
          .firstOrFail()

        if (employee.id !== data.employeeId) {
          return response.forbidden({
            message: 'Voce so pode criar solicitacoes para seu proprio cadastro',
          })
        }
      }

      const requestData = await this.service.create({
        employeeId: data.employeeId,
        requestedBy: user.id,
        fieldName: data.fieldName,
        newValue: data.newValue,
        reason: data.reason,
      })

      return response.created({ data: requestData })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao criar solicitacao de alteracao',
      })
    }
  }

  async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      let filters = await request.validateUsing(listDataChangeRequestValidator)

      // Employee so ve suas proprias solicitacoes
      if (user.role === 'employee') {
        const employee = await Employee.query()
          .where('userId', user.id)
          .where('status', 'active')
          .first()

        if (!employee) {
          return response.ok({ data: [], meta: { total: 0, page: 1, lastPage: 1 } })
        }

        filters = { ...filters, employeeId: employee.id }
      }

      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao listar solicitacoes',
      })
    }
  }

  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const requestData = await this.service.findById(params.id)

      // Employee so pode ver suas proprias solicitacoes
      if (user.role === 'employee') {
        const employee = await Employee.query()
          .where('userId', user.id)
          .where('status', 'active')
          .firstOrFail()

        if (requestData.employeeId !== employee.id) {
          return response.forbidden({
            message: 'Voce nao tem permissao para acessar esta solicitacao',
          })
        }
      }

      return response.ok({ data: requestData })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Solicitacao nao encontrada' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao buscar solicitacao',
      })
    }
  }

  async approve({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { reviewNotes } = await request.validateUsing(reviewDataChangeRequestValidator)

      const requestData = await this.service.approve(params.id, user.id, reviewNotes || undefined)
      return response.ok({ data: requestData })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Solicitacao nao encontrada' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao aprovar solicitacao',
      })
    }
  }

  async reject({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { reviewNotes } = await request.validateUsing(reviewDataChangeRequestValidator)

      const requestData = await this.service.reject(params.id, user.id, reviewNotes || undefined)
      return response.ok({ data: requestData })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Solicitacao nao encontrada' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao rejeitar solicitacao',
      })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import EmployeeHistoryService from '#services/employee_history_service'
import {
  createEmployeeHistoryValidator,
  listEmployeeHistoryValidator,
} from '#validators/employee_history_validator'

export default class EmployeeHistoriesController {
  private service: EmployeeHistoryService

  constructor() {
    this.service = new EmployeeHistoryService()
  }

  async index({ params, request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listEmployeeHistoryValidator)
      const result = await this.service.list(params.employeeId, filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao listar historico',
      })
    }
  }

  async store({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createEmployeeHistoryValidator)
      const currentUserId = auth.user?.id
      const history = await this.service.create(params.employeeId, {
        ...data,
        createdBy: currentUserId,
      })
      return response.created({ data: history })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao registrar historico',
      })
    }
  }
}

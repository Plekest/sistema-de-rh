import type { HttpContext } from '@adonisjs/core/http'
import HoursBankService from '#services/hours_bank_service'
import {
  calculateHoursBankValidator,
  listHoursBankValidator,
} from '#validators/hours_bank_validator'

export default class HoursBankController {
  private service: HoursBankService

  constructor() {
    this.service = new HoursBankService()
  }

  async index({ params, request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listHoursBankValidator)
      const result = await this.service.getHistory(params.employeeId, filters)
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
        message: error.message || 'Erro ao listar banco de horas',
      })
    }
  }

  async balance({ params, response }: HttpContext) {
    try {
      const result = await this.service.getBalance(params.employeeId)
      return response.ok({ data: result })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao buscar saldo do banco de horas',
      })
    }
  }

  async calculate({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(calculateHoursBankValidator)
      const result = await this.service.calculateMonth(params.employeeId, data.month, data.year)
      return response.ok({ data: result })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao calcular banco de horas',
      })
    }
  }
}

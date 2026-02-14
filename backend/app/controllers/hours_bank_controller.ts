import type { HttpContext } from '@adonisjs/core/http'
import HoursBankService from '#services/hours_bank_service'
import {
  calculateHoursBankValidator,
  listHoursBankValidator,
} from '#validators/hours_bank_validator'
import { resolveEmployeeId } from '#helpers/rbac_helper'

export default class HoursBankController {
  private service: HoursBankService

  constructor() {
    this.service = new HoursBankService()
  }

  async index(ctx: HttpContext) {
    const { params, request, response } = ctx
    try {
      const employeeId = await resolveEmployeeId(ctx, params.employeeId)
      const filters = await request.validateUsing(listHoursBankValidator)
      const result = await this.service.getHistory(employeeId, filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.message?.includes('permissao')) {
        return response.forbidden({ message: error.message })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao listar banco de horas',
      })
    }
  }

  async balance(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const employeeId = await resolveEmployeeId(ctx, params.employeeId)
      const result = await this.service.getBalance(employeeId)
      return response.ok({ data: result })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.message?.includes('permissao')) {
        return response.forbidden({ message: error.message })
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

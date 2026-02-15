import type { HttpContext } from '@adonisjs/core/http'
import TurnoverService from '#services/turnover_service'
import {
  recordTurnoverValidator,
  listTurnoverValidator,
} from '#validators/turnover_validator'
import { DateTime } from 'luxon'

export default class TurnoverController {
  private service: TurnoverService

  constructor() {
    this.service = new TurnoverService()
  }

  async record({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(recordTurnoverValidator)
      const userId = auth.user?.id

      const record = await this.service.record(
        {
          employee_id: data.employee_id,
          type: data.type,
          reason: data.reason,
          exit_date: DateTime.fromJSDate(data.exit_date),
          exit_interview_done: data.exit_interview_done,
          exit_interview_notes: data.exit_interview_notes,
        },
        userId
      )

      return response.created({ data: record })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao registrar turnover' })
    }
  }

  async list({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listTurnoverValidator)

      const result = await this.service.list({
        page: filters.page,
        limit: filters.limit,
        type: filters.type,
        department_id: filters.department_id,
        from: filters.from ? DateTime.fromJSDate(filters.from) : undefined,
        to: filters.to ? DateTime.fromJSDate(filters.to) : undefined,
      })

      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar turnover' })
    }
  }

  async rate({ request, response }: HttpContext) {
    try {
      const from = request.input('from')
      const to = request.input('to')
      const departmentId = request.input('department_id')

      if (!from || !to) {
        return response.badRequest({
          message: 'Parâmetros "from" e "to" são obrigatórios (formato: YYYY-MM-DD)',
        })
      }

      const rate = await this.service.getTurnoverRate(
        {
          from: DateTime.fromISO(from),
          to: DateTime.fromISO(to),
        },
        departmentId
      )

      return response.ok({ data: { rate, period: { from, to }, departmentId } })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao calcular taxa de turnover' })
    }
  }

  async byDepartment({ request, response }: HttpContext) {
    try {
      const year = request.input('year', new Date().getFullYear())
      const results = await this.service.getTurnoverByDepartment(year)
      return response.ok({ data: results })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar turnover por departamento',
      })
    }
  }

  async byReason({ request, response }: HttpContext) {
    try {
      const from = request.input('from')
      const to = request.input('to')

      if (!from || !to) {
        return response.badRequest({
          message: 'Parâmetros "from" e "to" são obrigatórios (formato: YYYY-MM-DD)',
        })
      }

      const results = await this.service.getTurnoverByReason({
        from: DateTime.fromISO(from),
        to: DateTime.fromISO(to),
      })

      return response.ok({ data: results })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar turnover por motivo',
      })
    }
  }

  async trend({ request, response }: HttpContext) {
    try {
      const months = request.input('months', 12)
      const results = await this.service.getTurnoverTrend(months)
      return response.ok({ data: results })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar tendência' })
    }
  }

  async averageTenure({ request, response }: HttpContext) {
    try {
      const departmentId = request.input('department_id')
      const result = await this.service.getAverageTenure(departmentId)
      return response.ok({ data: result })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao calcular tenure médio' })
    }
  }
}

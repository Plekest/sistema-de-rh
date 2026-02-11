import type { HttpContext } from '@adonisjs/core/http'
import TimeEntryService from '#services/time_entry_service'
import { manualTimeEntryValidator, listTimeEntryValidator } from '#validators/time_entry_validator'

export default class TimeEntriesController {
  private service: TimeEntryService

  constructor() {
    this.service = new TimeEntryService()
  }

  async clockIn({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const employeeId = await this.service.getEmployeeIdFromUser(user.id)
      const entry = await this.service.clockIn(employeeId)
      return response.created({ data: entry })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao registrar entrada' })
    }
  }

  async clockOut({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const employeeId = await this.service.getEmployeeIdFromUser(user.id)
      const entry = await this.service.clockOut(employeeId)
      return response.ok({ data: entry })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao registrar saida' })
    }
  }

  async lunchStart({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const employeeId = await this.service.getEmployeeIdFromUser(user.id)
      const entry = await this.service.lunchStart(employeeId)
      return response.ok({ data: entry })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao registrar saida para almoco',
      })
    }
  }

  async lunchEnd({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const employeeId = await this.service.getEmployeeIdFromUser(user.id)
      const entry = await this.service.lunchEnd(employeeId)
      return response.ok({ data: entry })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao registrar retorno do almoco',
      })
    }
  }

  async today({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const employeeId = await this.service.getEmployeeIdFromUser(user.id)
      const entry = await this.service.getToday(employeeId)
      return response.ok({ data: entry })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar registro de hoje',
      })
    }
  }

  async recent({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const entries = await this.service.getRecent(user.id)
      return response.ok({ data: entries })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar registros recentes',
      })
    }
  }

  async index({ params, request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listTimeEntryValidator)
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
        message: error.message || 'Erro ao listar registros de ponto',
      })
    }
  }

  async manualEntry({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(manualTimeEntryValidator)
      const entry = await this.service.manualEntry(params.employeeId, data)
      return response.created({ data: entry })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao registrar ponto manual',
      })
    }
  }
}

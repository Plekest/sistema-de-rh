import type { HttpContext } from '@adonisjs/core/http'
import EmployeeLifecycleService from '#services/employee_lifecycle_service'
import { DateTime } from 'luxon'

export default class EmployeeLifecycleController {
  private service: EmployeeLifecycleService

  constructor() {
    this.service = new EmployeeLifecycleService()
  }

  async timeline({ params, request, response }: HttpContext) {
    try {
      const from = request.input('from')
      const to = request.input('to')
      const types = request.input('types')

      const filters = {
        from: from ? DateTime.fromISO(from) : undefined,
        to: to ? DateTime.fromISO(to) : undefined,
        types: types ? (Array.isArray(types) ? types : [types]) : undefined,
      }

      const timeline = await this.service.getTimeline(params.employeeId, filters)
      return response.ok({ data: timeline })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar timeline' })
    }
  }

  async summary({ params, response }: HttpContext) {
    try {
      const summary = await this.service.getSummary(params.employeeId)
      return response.ok({ data: summary })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar resumo' })
    }
  }
}

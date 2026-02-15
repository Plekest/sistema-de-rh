import type { HttpContext } from '@adonisjs/core/http'
import DashboardService from '#services/dashboard_service'

export default class DashboardController {
  private service: DashboardService

  constructor() {
    this.service = new DashboardService()
  }

  async admin({ response }: HttpContext) {
    try {
      const result = await this.service.getAdminDashboard()
      return response.ok({ data: result })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao carregar dashboard administrativo',
      })
    }
  }

  async employee({ auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!

      // Load the employee relationship
      await user.load('employee')

      if (!user.employee) {
        return response.notFound({
          message: 'Usuario nao possui vinculo com colaborador',
        })
      }

      const result = await this.service.getEmployeeDashboard(user.employee.id)
      return response.ok({ data: result })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao carregar dashboard do colaborador',
      })
    }
  }

  async birthdays({ request, response }: HttpContext) {
    try {
      const days = request.input('days', 30)
      const daysNumber = Number(days)

      if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 365) {
        return response.badRequest({ message: 'Parametro days deve ser entre 1 e 365' })
      }

      const result = await this.service.getBirthdays(daysNumber)
      return response.ok({ data: result })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao buscar aniversariantes',
      })
    }
  }
}

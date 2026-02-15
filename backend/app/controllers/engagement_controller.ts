import type { HttpContext } from '@adonisjs/core/http'
import EngagementScoreService from '#services/engagement_score_service'

export default class EngagementController {
  private service: EngagementScoreService

  constructor() {
    this.service = new EngagementScoreService()
  }

  async calculate({ params, request, auth, response }: HttpContext) {
    try {
      const month = request.input('month', new Date().getMonth() + 1)
      const year = request.input('year', new Date().getFullYear())
      const userId = auth.user?.id

      const score = await this.service.calculateForEmployee(params.employeeId, month, year, userId)
      return response.ok({ data: score })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao calcular engagement score' })
    }
  }

  async calculateAll({ request, auth, response }: HttpContext) {
    try {
      const month = request.input('month', new Date().getMonth() + 1)
      const year = request.input('year', new Date().getFullYear())
      const userId = auth.user?.id

      const results = await this.service.calculateForAll(month, year, userId)
      return response.ok({ data: results })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao calcular engagement scores',
      })
    }
  }

  async employeeHistory({ params, request, response }: HttpContext) {
    try {
      const months = request.input('months', 12)
      const scores = await this.service.getEmployeeHistory(params.employeeId, months)
      return response.ok({ data: scores })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar histórico' })
    }
  }

  async departmentAverage({ params, request, response }: HttpContext) {
    try {
      const month = request.input('month', new Date().getMonth() + 1)
      const year = request.input('year', new Date().getFullYear())

      const result = await this.service.getDepartmentAverage(params.departmentId, month, year)
      return response.ok({ data: result })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao calcular média' })
    }
  }

  async companyAverage({ request, response }: HttpContext) {
    try {
      const month = request.input('month', new Date().getMonth() + 1)
      const year = request.input('year', new Date().getFullYear())

      const result = await this.service.getCompanyAverage(month, year)
      return response.ok({ data: result })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao calcular média da empresa' })
    }
  }

  async ranking({ request, response }: HttpContext) {
    try {
      const month = request.input('month', new Date().getMonth() + 1)
      const year = request.input('year', new Date().getFullYear())
      const limit = request.input('limit', 10)

      const scores = await this.service.getRanking(month, year, limit)
      return response.ok({ data: scores })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar ranking' })
    }
  }
}

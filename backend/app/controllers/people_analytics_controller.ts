import type { HttpContext } from '@adonisjs/core/http'
import PeopleAnalyticsService from '#services/people_analytics_service'

export default class PeopleAnalyticsController {
  private service: PeopleAnalyticsService

  constructor() {
    this.service = new PeopleAnalyticsService()
  }

  async workforceOverview({ response }: HttpContext) {
    try {
      const data = await this.service.getWorkforceOverview()
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar visão geral da força de trabalho',
      })
    }
  }

  async retentionAnalysis({ request, response }: HttpContext) {
    try {
      const months = request.input('months', 12)
      const data = await this.service.getRetentionAnalysis(months)
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao gerar análise de retenção' })
    }
  }

  async performanceDistribution({ request, response }: HttpContext) {
    try {
      const cycleId = request.input('cycle_id')
      const data = await this.service.getPerformanceDistribution(cycleId)
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar distribuição de desempenho',
      })
    }
  }

  async trainingEffectiveness({ response }: HttpContext) {
    try {
      const data = await this.service.getTrainingEffectiveness()
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar análise de efetividade de treinamentos',
      })
    }
  }

  async engagementOverview({ response }: HttpContext) {
    try {
      const data = await this.service.getEngagementOverview()
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar visão geral de engajamento',
      })
    }
  }

  async compensationAnalysis({ response }: HttpContext) {
    try {
      const data = await this.service.getCompensationAnalysis()
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao gerar análise de compensação' })
    }
  }

  async predictiveInsights({ response }: HttpContext) {
    try {
      const data = await this.service.getPredictiveInsights()
      return response.ok({ data })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao gerar insights preditivos' })
    }
  }

  async generateSnapshot({ auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const snapshot = await this.service.generateMonthlySnapshot(userId)
      return response.created({ data: snapshot })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao gerar snapshot mensal' })
    }
  }

  async snapshotHistory({ request, response }: HttpContext) {
    try {
      const type = request.input('type', 'monthly_summary')
      const months = request.input('months', 12)

      const snapshots = await this.service.getSnapshotHistory(type, months)
      return response.ok({ data: snapshots })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar histórico de snapshots' })
    }
  }
}

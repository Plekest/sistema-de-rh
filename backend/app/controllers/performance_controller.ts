import type { HttpContext } from '@adonisjs/core/http'
import PerformanceService from '#services/performance_service'
import {
  createPerformanceCycleValidator,
  updatePerformanceCycleValidator,
  createCompetencyValidator,
  updateCompetencyValidator,
  addCompetencyToCycleValidator,
  createIndividualGoalValidator,
  updateIndividualGoalValidator,
  createEvaluationValidator,
  submitEvaluationValidator,
  createDevelopmentPlanValidator,
  updateDevelopmentPlanValidator,
  listCyclesValidator,
  listGoalsValidator,
  listDevelopmentPlansValidator,
} from '#validators/performance_validator'

export default class PerformanceController {
  private service: PerformanceService

  constructor() {
    this.service = new PerformanceService()
  }

  // ==========================================
  // Ciclos
  // ==========================================

  /**
   * Lista ciclos de avaliacao
   * GET /api/v1/performance/cycles
   */
  async listCycles({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listCyclesValidator)
      const result = await this.service.listCycles(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar ciclos' })
    }
  }

  /**
   * Detalhe de um ciclo
   * GET /api/v1/performance/cycles/:id
   */
  async getCycle({ params, response }: HttpContext) {
    try {
      const cycle = await this.service.getCycleById(params.id)
      return response.ok({ data: cycle })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar ciclo' })
    }
  }

  /**
   * Cria novo ciclo
   * POST /api/v1/performance/cycles
   */
  async createCycle({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createPerformanceCycleValidator)
      const currentUserId = auth.user?.id
      const cycle = await this.service.createCycle(data, currentUserId)
      return response.created({ data: cycle })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar ciclo' })
    }
  }

  /**
   * Atualiza ciclo
   * PUT /api/v1/performance/cycles/:id
   */
  async updateCycle({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updatePerformanceCycleValidator)
      const cycle = await this.service.updateCycle(params.id, data)
      return response.ok({ data: cycle })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar ciclo' })
    }
  }

  /**
   * Avanca status do ciclo
   * PATCH /api/v1/performance/cycles/:id/advance
   */
  async advanceCycleStatus({ params, response }: HttpContext) {
    try {
      const cycle = await this.service.advanceCycleStatus(params.id)
      return response.ok({ data: cycle })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao avancar status do ciclo' })
    }
  }

  /**
   * Adiciona competencia ao ciclo
   * POST /api/v1/performance/cycles/:id/competencies
   */
  async addCompetency({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(addCompetencyToCycleValidator)
      const cycleCompetency = await this.service.addCompetencyToCycle(
        params.id,
        data.competencyId,
        data.weight || 1.0
      )
      return response.created({ data: cycleCompetency })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo ou competencia nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao adicionar competencia' })
    }
  }

  /**
   * Remove competencia do ciclo
   * DELETE /api/v1/performance/cycles/:cycleId/competencies/:competencyId
   */
  async removeCompetency({ params, response }: HttpContext) {
    try {
      await this.service.removeCompetencyFromCycle(params.cycleId, params.competencyId)
      return response.ok({ message: 'Competencia removida com sucesso' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo ou competencia nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover competencia' })
    }
  }

  // ==========================================
  // Competencias
  // ==========================================

  /**
   * Lista competencias ativas
   * GET /api/v1/performance/competencies
   */
  async listCompetencies({ response }: HttpContext) {
    try {
      const competencies = await this.service.listCompetencies()
      return response.ok({ data: competencies })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar competencias' })
    }
  }

  /**
   * Cria nova competencia
   * POST /api/v1/performance/competencies
   */
  async createCompetency({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCompetencyValidator)
      const competency = await this.service.createCompetency(data)
      return response.created({ data: competency })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar competencia' })
    }
  }

  /**
   * Atualiza competencia
   * PUT /api/v1/performance/competencies/:id
   */
  async updateCompetency({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateCompetencyValidator)
      const competency = await this.service.updateCompetency(params.id, data)
      return response.ok({ data: competency })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Competencia nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar competencia' })
    }
  }

  // ==========================================
  // Metas Individuais
  // ==========================================

  /**
   * Lista metas de um ciclo
   * GET /api/v1/performance/cycles/:cycleId/goals
   */
  async listGoals({ params, request, response }: HttpContext) {
    try {
      const { employeeId } = await request.validateUsing(listGoalsValidator)
      const goals = await this.service.listGoals(params.cycleId, employeeId)
      return response.ok({ data: goals })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar metas' })
    }
  }

  /**
   * Cria nova meta
   * POST /api/v1/performance/goals
   */
  async createGoal({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createIndividualGoalValidator)
      const goal = await this.service.createGoal(data)
      return response.created({ data: goal })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo ou colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar meta' })
    }
  }

  /**
   * Atualiza meta
   * PUT /api/v1/performance/goals/:id
   */
  async updateGoal({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateIndividualGoalValidator)
      const goal = await this.service.updateGoal(params.id, data)
      return response.ok({ data: goal })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Meta nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar meta' })
    }
  }

  // ==========================================
  // Avaliacoes
  // ==========================================

  /**
   * Lista avaliacoes de um ciclo
   * GET /api/v1/performance/cycles/:cycleId/evaluations
   */
  async listEvaluations({ params, response }: HttpContext) {
    try {
      const evaluations = await this.service.getEvaluationsByCycle(params.cycleId)
      return response.ok({ data: evaluations })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar avaliacoes' })
    }
  }

  /**
   * Detalhe de uma avaliacao
   * GET /api/v1/performance/evaluations/:id
   */
  async getEvaluation({ params, response }: HttpContext) {
    try {
      const evaluation = await this.service.getEvaluationDetail(params.id)
      return response.ok({ data: evaluation })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Avaliacao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar avaliacao' })
    }
  }

  /**
   * Cria nova avaliacao
   * POST /api/v1/performance/evaluations
   */
  async createEvaluation({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createEvaluationValidator)
      // Busca o employee associado ao usuario autenticado
      const Employee = (await import('#models/employee')).default
      const employee = await Employee.query().where('userId', auth.user!.id).first()
      const evaluatorId = employee?.id
      const evaluation = await this.service.createEvaluation(data, evaluatorId)
      return response.created({ data: evaluation })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ciclo ou colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar avaliacao' })
    }
  }

  /**
   * Submete avaliacao com notas
   * POST /api/v1/performance/evaluations/:id/submit
   */
  async submitEvaluation({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(submitEvaluationValidator)
      const evaluation = await this.service.submitEvaluation(params.id, data)
      return response.ok({ data: evaluation })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Avaliacao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao submeter avaliacao' })
    }
  }

  // ==========================================
  // Planos de Desenvolvimento (PDI)
  // ==========================================

  /**
   * Lista planos de desenvolvimento
   * GET /api/v1/performance/development-plans
   */
  async listDevelopmentPlans({ request, response }: HttpContext) {
    try {
      const { employeeId } = await request.validateUsing(listDevelopmentPlansValidator)
      const plans = await this.service.listDevelopmentPlans(employeeId)
      return response.ok({ data: plans })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar planos' })
    }
  }

  /**
   * Cria novo plano de desenvolvimento
   * POST /api/v1/performance/development-plans
   */
  async createDevelopmentPlan({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createDevelopmentPlanValidator)
      const plan = await this.service.createDevelopmentPlan(data)
      return response.created({ data: plan })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador ou ciclo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar plano' })
    }
  }

  /**
   * Atualiza plano de desenvolvimento
   * PUT /api/v1/performance/development-plans/:id
   */
  async updateDevelopmentPlan({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateDevelopmentPlanValidator)
      const plan = await this.service.updateDevelopmentPlan(params.id, data)
      return response.ok({ data: plan })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Plano nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar plano' })
    }
  }
}

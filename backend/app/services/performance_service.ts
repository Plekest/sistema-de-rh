import PerformanceCycle from '#models/performance_cycle'
import Competency from '#models/competency'
import CycleCompetency from '#models/cycle_competency'
import IndividualGoal from '#models/individual_goal'
import Evaluation from '#models/evaluation'
import EvaluationScore from '#models/evaluation_score'
import DevelopmentPlan from '#models/development_plan'
import Employee from '#models/employee'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

interface ListCyclesFilters {
  page?: number
  limit?: number
  status?: string
  year?: number
}

interface CreateCycleData {
  name: string
  type: 'semestral' | 'anual'
  startDate: string
  endDate: string
  selfEvalDeadline: string
  managerEvalDeadline: string
}

interface CreateCompetencyData {
  name: string
  category: 'technical' | 'behavioral' | 'leadership'
  description?: string | null
}

interface CreateGoalData {
  cycleId: number
  employeeId: number
  title: string
  description?: string | null
  weight?: number
  targetValue?: string | null
}

interface CreateEvaluationData {
  cycleId: number
  employeeId: number
  type: 'self' | 'manager'
}

interface SubmitEvaluationData {
  overallScore: number
  comments?: string | null
  scores: Array<{
    competencyId: number
    score: number
    comments?: string | null
  }>
}

interface CreateDevelopmentPlanData {
  employeeId: number
  cycleId?: number | null
  action: string
  description?: string | null
  responsibleId?: number | null
  deadline?: string | null
}

export default class PerformanceService {
  // ==========================================
  // Ciclos
  // ==========================================

  /**
   * Lista ciclos de avaliacao com filtros e paginacao
   */
  async listCycles(filters: ListCyclesFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = PerformanceCycle.query()
      .preload('creator')
      .orderBy('start_date', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.year) {
      const yearStart = DateTime.fromObject({ year: filters.year, month: 1, day: 1 })
      const yearEnd = DateTime.fromObject({ year: filters.year, month: 12, day: 31 })
      query.whereBetween('startDate', [yearStart.toISODate()!, yearEnd.toISODate()!])
    }

    return await query.paginate(page, limit)
  }

  /**
   * Busca ciclo por ID com detalhes
   */
  async getCycleById(id: number) {
    const cycle = await PerformanceCycle.query()
      .where('id', id)
      .preload('creator')
      .preload('cycleCompetencies', (query) => {
        query.preload('competency')
      })
      .firstOrFail()

    // Contadores
    const [totalGoals, totalEvaluations, completedEvaluations] = await Promise.all([
      IndividualGoal.query().where('cycleId', id).count('* as total'),
      Evaluation.query().where('cycleId', id).count('* as total'),
      Evaluation.query().where('cycleId', id).where('status', 'completed').count('* as total'),
    ])

    return {
      ...cycle.toJSON(),
      stats: {
        totalGoals: Number(totalGoals[0].$extras.total),
        totalEvaluations: Number(totalEvaluations[0].$extras.total),
        completedEvaluations: Number(completedEvaluations[0].$extras.total),
      },
    }
  }

  /**
   * Cria novo ciclo de avaliacao
   */
  async createCycle(data: CreateCycleData, currentUserId?: number) {
    const start = DateTime.fromISO(data.startDate)
    const end = DateTime.fromISO(data.endDate)
    const selfDeadline = DateTime.fromISO(data.selfEvalDeadline)
    const managerDeadline = DateTime.fromISO(data.managerEvalDeadline)

    if (start >= end) {
      throw new Error('Data de inicio deve ser anterior a data de fim')
    }
    if (selfDeadline < start || selfDeadline > end) {
      throw new Error('Prazo de autoavaliacao deve estar dentro do periodo do ciclo')
    }
    if (managerDeadline < selfDeadline) {
      throw new Error('Prazo de avaliacao do gestor deve ser posterior a autoavaliacao')
    }

    const cycle = await PerformanceCycle.create({
      name: data.name,
      type: data.type,
      startDate: start,
      endDate: end,
      selfEvalDeadline: selfDeadline,
      managerEvalDeadline: managerDeadline,
      status: 'draft',
      createdBy: currentUserId || null,
    })

    await cycle.load('creator')
    return cycle
  }

  /**
   * Atualiza ciclo de avaliacao
   */
  async updateCycle(id: number, data: Partial<CreateCycleData>) {
    const cycle = await PerformanceCycle.findOrFail(id)

    if (cycle.status !== 'draft') {
      throw new Error('Apenas ciclos em rascunho podem ser editados')
    }

    const updateData: any = {}

    if (data.name) updateData.name = data.name
    if (data.type) updateData.type = data.type
    if (data.startDate) updateData.startDate = DateTime.fromISO(data.startDate)
    if (data.endDate) updateData.endDate = DateTime.fromISO(data.endDate)
    if (data.selfEvalDeadline) updateData.selfEvalDeadline = DateTime.fromISO(data.selfEvalDeadline)
    if (data.managerEvalDeadline)
      updateData.managerEvalDeadline = DateTime.fromISO(data.managerEvalDeadline)

    // Validacoes de datas
    const start = updateData.startDate || cycle.startDate
    const end = updateData.endDate || cycle.endDate
    const selfDeadline = updateData.selfEvalDeadline || cycle.selfEvalDeadline
    const managerDeadline = updateData.managerEvalDeadline || cycle.managerEvalDeadline

    if (start >= end) {
      throw new Error('Data de inicio deve ser anterior a data de fim')
    }
    if (selfDeadline < start || selfDeadline > end) {
      throw new Error('Prazo de autoavaliacao deve estar dentro do periodo do ciclo')
    }
    if (managerDeadline < selfDeadline) {
      throw new Error('Prazo de avaliacao do gestor deve ser posterior a autoavaliacao')
    }

    cycle.merge(updateData)
    await cycle.save()
    await cycle.load('creator')

    return cycle
  }

  /**
   * Avanca status do ciclo
   */
  async advanceCycleStatus(id: number) {
    const cycle = await PerformanceCycle.findOrFail(id)

    const statusFlow: Record<string, string> = {
      draft: 'self_eval',
      self_eval: 'manager_eval',
      manager_eval: 'calibration',
      calibration: 'closed',
    }

    const nextStatus = statusFlow[cycle.status]
    if (!nextStatus) {
      throw new Error('Ciclo ja esta fechado ou em status invalido')
    }

    cycle.status = nextStatus as any
    await cycle.save()

    return cycle
  }

  /**
   * Adiciona competencia ao ciclo
   */
  async addCompetencyToCycle(cycleId: number, competencyId: number, weight: number = 1.0) {
    const cycle = await PerformanceCycle.findOrFail(cycleId)

    if (cycle.status !== 'draft') {
      throw new Error('Apenas ciclos em rascunho podem ter competencias adicionadas')
    }

    const competency = await Competency.findOrFail(competencyId)

    if (!competency.isActive) {
      throw new Error('Competencia nao esta ativa')
    }

    // Verifica se ja existe
    const existing = await CycleCompetency.query()
      .where('cycleId', cycleId)
      .where('competencyId', competencyId)
      .first()

    if (existing) {
      throw new Error('Competencia ja adicionada ao ciclo')
    }

    const cycleCompetency = await CycleCompetency.create({
      cycleId,
      competencyId,
      weight,
    })

    await cycleCompetency.load('competency')
    return cycleCompetency
  }

  /**
   * Remove competencia do ciclo
   */
  async removeCompetencyFromCycle(cycleId: number, competencyId: number) {
    const cycle = await PerformanceCycle.findOrFail(cycleId)

    if (cycle.status !== 'draft') {
      throw new Error('Apenas ciclos em rascunho podem ter competencias removidas')
    }

    const cycleCompetency = await CycleCompetency.query()
      .where('cycleId', cycleId)
      .where('competencyId', competencyId)
      .firstOrFail()

    await cycleCompetency.delete()
  }

  // ==========================================
  // Competencias
  // ==========================================

  /**
   * Lista todas as competencias ativas
   */
  async listCompetencies() {
    return await Competency.query()
      .where('isActive', true)
      .orderBy('category', 'asc')
      .orderBy('name', 'asc')
  }

  /**
   * Cria nova competencia
   */
  async createCompetency(data: CreateCompetencyData) {
    return await Competency.create({
      name: data.name,
      category: data.category,
      description: data.description || null,
      isActive: true,
    })
  }

  /**
   * Atualiza competencia
   */
  async updateCompetency(id: number, data: Partial<CreateCompetencyData & { isActive?: boolean }>) {
    const competency = await Competency.findOrFail(id)
    competency.merge(data)
    await competency.save()
    return competency
  }

  // ==========================================
  // Metas Individuais
  // ==========================================

  /**
   * Lista metas de um ciclo
   */
  async listGoals(cycleId: number, employeeId?: number) {
    const query = IndividualGoal.query()
      .where('cycleId', cycleId)
      .preload('employee')
      .preload('cycle')
      .orderBy('created_at', 'desc')

    if (employeeId) {
      query.where('employeeId', employeeId)
    }

    return await query
  }

  /**
   * Cria nova meta individual
   */
  async createGoal(data: CreateGoalData) {
    // Valida se o ciclo existe
    await PerformanceCycle.findOrFail(data.cycleId)

    // Valida se o colaborador existe e esta ativo
    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    const goal = await IndividualGoal.create({
      cycleId: data.cycleId,
      employeeId: data.employeeId,
      title: data.title,
      description: data.description || null,
      weight: data.weight || 1.0,
      targetValue: data.targetValue || null,
      status: 'pending',
    })

    await goal.load('employee')
    await goal.load('cycle')
    return goal
  }

  /**
   * Atualiza meta individual
   */
  async updateGoal(id: number, data: Partial<CreateGoalData & { achievedValue?: string | null; status?: string }>) {
    const goal = await IndividualGoal.findOrFail(id)
    goal.merge(data as any)
    await goal.save()
    await goal.load('employee')
    await goal.load('cycle')
    return goal
  }

  // ==========================================
  // Avaliacoes
  // ==========================================

  /**
   * Lista avaliacoes de um ciclo
   */
  async getEvaluationsByCycle(cycleId: number) {
    return await Evaluation.query()
      .where('cycleId', cycleId)
      .preload('employee')
      .preload('evaluator')
      .preload('scores', (query) => {
        query.preload('competency')
      })
      .orderBy('created_at', 'desc')
  }

  /**
   * Busca avaliacao do colaborador em um ciclo
   */
  async getMyEvaluation(cycleId: number, employeeId: number, type: 'self' | 'manager') {
    return await Evaluation.query()
      .where('cycleId', cycleId)
      .where('employeeId', employeeId)
      .where('type', type)
      .preload('employee')
      .preload('evaluator')
      .preload('cycle')
      .preload('scores', (query) => {
        query.preload('competency')
      })
      .first()
  }

  /**
   * Cria nova avaliacao
   */
  async createEvaluation(data: CreateEvaluationData, evaluatorId?: number) {
    // Valida se o ciclo existe
    const cycle = await PerformanceCycle.findOrFail(data.cycleId)

    // Valida se o colaborador existe e esta ativo
    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    // Verifica se ja existe avaliacao do mesmo tipo
    const existing = await Evaluation.query()
      .where('cycleId', data.cycleId)
      .where('employeeId', data.employeeId)
      .where('type', data.type)
      .first()

    if (existing) {
      throw new Error('Ja existe uma avaliacao deste tipo para este colaborador neste ciclo')
    }

    // Valida status do ciclo
    if (data.type === 'self' && !['self_eval', 'manager_eval'].includes(cycle.status)) {
      throw new Error('Ciclo nao esta aberto para autoavaliacao')
    }

    if (data.type === 'manager' && !['manager_eval', 'calibration'].includes(cycle.status)) {
      throw new Error('Ciclo nao esta aberto para avaliacao de gestor')
    }

    const evaluation = await Evaluation.create({
      cycleId: data.cycleId,
      employeeId: data.employeeId,
      evaluatorId: evaluatorId || null,
      type: data.type,
      status: 'pending',
    })

    await evaluation.load('employee')
    await evaluation.load('evaluator')
    await evaluation.load('cycle')
    return evaluation
  }

  /**
   * Submete avaliacao com notas
   */
  async submitEvaluation(id: number, data: SubmitEvaluationData) {
    const evaluation = await Evaluation.query()
      .where('id', id)
      .preload('cycle')
      .firstOrFail()

    if (evaluation.status === 'completed') {
      throw new Error('Avaliacao ja foi completada')
    }

    // Valida se todas as competencias do ciclo foram avaliadas
    const cycleCompetencies = await CycleCompetency.query()
      .where('cycleId', evaluation.cycleId)
      .exec()

    const competencyIds = cycleCompetencies.map(cc => cc.competencyId)
    const scoredCompetencyIds = data.scores.map(s => s.competencyId)

    const missingCompetencies = competencyIds.filter(id => !scoredCompetencyIds.includes(id))
    if (missingCompetencies.length > 0) {
      throw new Error('Todas as competencias do ciclo devem ser avaliadas')
    }

    // Inicia transacao
    const trx = await db.transaction()

    try {
      // Remove scores anteriores se existirem
      await EvaluationScore.query({ client: trx })
        .where('evaluationId', id)
        .delete()

      // Cria novos scores
      for (const scoreData of data.scores) {
        await EvaluationScore.create({
          evaluationId: id,
          competencyId: scoreData.competencyId,
          score: scoreData.score,
          comments: scoreData.comments || null,
        }, { client: trx })
      }

      // Atualiza avaliacao
      evaluation.useTransaction(trx)
      evaluation.overallScore = data.overallScore
      evaluation.comments = data.comments || null
      evaluation.status = 'completed'
      evaluation.completedAt = DateTime.now()
      await evaluation.save()

      await trx.commit()

      await evaluation.load('scores', (query) => {
        query.preload('competency')
      })

      return evaluation
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Busca detalhes completos de uma avaliacao
   */
  async getEvaluationDetail(id: number) {
    return await Evaluation.query()
      .where('id', id)
      .preload('employee')
      .preload('evaluator')
      .preload('cycle', (query) => {
        query.preload('cycleCompetencies', (ccQuery) => {
          ccQuery.preload('competency')
        })
      })
      .preload('scores', (query) => {
        query.preload('competency')
      })
      .firstOrFail()
  }

  // ==========================================
  // Planos de Desenvolvimento (PDI)
  // ==========================================

  /**
   * Lista planos de desenvolvimento
   */
  async listDevelopmentPlans(employeeId?: number) {
    const query = DevelopmentPlan.query()
      .preload('employee')
      .preload('cycle')
      .preload('responsible')
      .orderBy('created_at', 'desc')

    if (employeeId) {
      query.where('employeeId', employeeId)
    }

    return await query
  }

  /**
   * Cria novo plano de desenvolvimento
   */
  async createDevelopmentPlan(data: CreateDevelopmentPlanData) {
    // Valida se o colaborador existe e esta ativo
    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    // Valida ciclo se informado
    if (data.cycleId) {
      await PerformanceCycle.findOrFail(data.cycleId)
    }

    // Valida responsavel se informado
    if (data.responsibleId) {
      await Employee.findOrFail(data.responsibleId)
    }

    const plan = await DevelopmentPlan.create({
      employeeId: data.employeeId,
      cycleId: data.cycleId || null,
      action: data.action,
      description: data.description || null,
      responsibleId: data.responsibleId || null,
      deadline: data.deadline ? DateTime.fromISO(data.deadline) : null,
      status: 'pending',
    })

    await plan.load('employee')
    await plan.load('cycle')
    await plan.load('responsible')
    return plan
  }

  /**
   * Atualiza plano de desenvolvimento
   */
  async updateDevelopmentPlan(id: number, data: Partial<CreateDevelopmentPlanData & { status?: string }>) {
    const plan = await DevelopmentPlan.findOrFail(id)

    // Valida responsavel se informado
    if (data.responsibleId) {
      await Employee.findOrFail(data.responsibleId)
    }

    const updateData: any = {}
    if (data.action) updateData.action = data.action
    if (data.description !== undefined) updateData.description = data.description
    if (data.responsibleId !== undefined) updateData.responsibleId = data.responsibleId
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? DateTime.fromISO(data.deadline) : null
    }
    if (data.status) updateData.status = data.status

    plan.merge(updateData)
    await plan.save()
    await plan.load('employee')
    await plan.load('cycle')
    await plan.load('responsible')

    return plan
  }
}

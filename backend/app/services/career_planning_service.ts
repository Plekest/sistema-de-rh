import CareerPath from '#models/career_path'
import CareerPathLevel from '#models/career_path_level'
import SuccessionPlan from '#models/succession_plan'
import Employee from '#models/employee'
import Position from '#models/position'
import AuditLogService from '#services/audit_log_service'

interface CreatePathData {
  name: string
  description?: string | null
  department_id?: number | null
}

interface UpdatePathData {
  name?: string
  description?: string | null
  department_id?: number | null
}

interface CreateLevelData {
  career_path_id: number
  position_id?: number | null
  level_order: number
  title: string
  description?: string | null
  min_experience_months?: number | null
  required_skills?: any[] | null
  salary_range_min?: number | null
  salary_range_max?: number | null
}

interface UpdateLevelData {
  position_id?: number | null
  level_order?: number
  title?: string
  description?: string | null
  min_experience_months?: number | null
  required_skills?: any[] | null
  salary_range_min?: number | null
  salary_range_max?: number | null
}

interface CreateSuccessionPlanData {
  position_id: number
  current_holder_id?: number | null
  successor_id?: number | null
  readiness: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'development_needed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  development_actions?: string | null
  notes?: string | null
}

interface UpdateSuccessionPlanData {
  current_holder_id?: number | null
  successor_id?: number | null
  readiness?: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'development_needed'
  priority?: 'critical' | 'high' | 'medium' | 'low'
  development_actions?: string | null
  notes?: string | null
}

interface PathFilters {
  departmentId?: number
  isActive?: boolean
}

interface SuccessionFilters {
  positionId?: number
  priority?: 'critical' | 'high' | 'medium' | 'low'
}

export default class CareerPlanningService {
  /**
   * Lista career paths com filtros
   */
  async listPaths(filters: PathFilters = {}) {
    const query = CareerPath.query()
      .preload('levels', (query) => query.orderBy('level_order', 'asc'))
      .preload('department')

    if (filters.departmentId) {
      query.where('department_id', filters.departmentId)
    }

    if (filters.isActive !== undefined) {
      query.where('is_active', filters.isActive)
    }

    return await query.orderBy('name', 'asc')
  }

  /**
   * Cria career path
   */
  async createPath(data: CreatePathData, userId?: number) {
    const path = await CareerPath.create({
      name: data.name,
      description: data.description || null,
      departmentId: data.department_id || null,
      isActive: true,
      createdBy: userId || null,
    })

    await path.load('department')

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'career_path',
      resourceId: path.id,
      description: `Career path criado: ${path.name}`,
      newValues: { name: path.name },
    })

    return path
  }

  /**
   * Atualiza career path
   */
  async updatePath(id: number, data: UpdatePathData, userId?: number) {
    const path = await CareerPath.findOrFail(id)
    const oldValues = { name: path.name }

    path.merge({
      name: data.name ?? path.name,
      description: data.description !== undefined ? data.description : path.description,
      departmentId: data.department_id !== undefined ? data.department_id : path.departmentId,
    })

    await path.save()
    await path.load('department')

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'career_path',
      resourceId: path.id,
      description: `Career path atualizado: ${path.name}`,
      oldValues,
      newValues: { name: path.name },
    })

    return path
  }

  /**
   * Remove career path (soft delete)
   */
  async deletePath(id: number, userId?: number) {
    const path = await CareerPath.findOrFail(id)
    path.isActive = false
    await path.save()

    await AuditLogService.log({
      userId,
      action: 'delete',
      resourceType: 'career_path',
      resourceId: path.id,
      description: `Career path removido: ${path.name}`,
    })

    return path
  }

  /**
   * Adiciona nivel ao career path
   */
  async addLevel(pathId: number, data: CreateLevelData, userId?: number) {
    const path = await CareerPath.findOrFail(pathId)

    const level = await CareerPathLevel.create({
      careerPathId: data.career_path_id,
      positionId: data.position_id || null,
      levelOrder: data.level_order,
      title: data.title,
      description: data.description || null,
      minExperienceMonths: data.min_experience_months || null,
      requiredSkills: data.required_skills || null,
      salaryRangeMin: data.salary_range_min || null,
      salaryRangeMax: data.salary_range_max || null,
    })

    await level.load('position')

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'career_path_level',
      resourceId: level.id,
      description: `Nível adicionado ao path ${path.name}: ${level.title}`,
      newValues: { title: level.title, levelOrder: level.levelOrder },
    })

    return level
  }

  /**
   * Atualiza nivel
   */
  async updateLevel(levelId: number, data: UpdateLevelData, userId?: number) {
    const level = await CareerPathLevel.findOrFail(levelId)
    const oldValues = { title: level.title }

    level.merge({
      positionId: data.position_id !== undefined ? data.position_id : level.positionId,
      levelOrder: data.level_order ?? level.levelOrder,
      title: data.title ?? level.title,
      description: data.description !== undefined ? data.description : level.description,
      minExperienceMonths:
        data.min_experience_months !== undefined
          ? data.min_experience_months
          : level.minExperienceMonths,
      requiredSkills:
        data.required_skills !== undefined ? data.required_skills : level.requiredSkills,
      salaryRangeMin:
        data.salary_range_min !== undefined ? data.salary_range_min : level.salaryRangeMin,
      salaryRangeMax:
        data.salary_range_max !== undefined ? data.salary_range_max : level.salaryRangeMax,
    })

    await level.save()
    await level.load('position')

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'career_path_level',
      resourceId: level.id,
      description: `Nível atualizado: ${level.title}`,
      oldValues,
      newValues: { title: level.title },
    })

    return level
  }

  /**
   * Remove nivel
   */
  async removeLevel(levelId: number, userId?: number) {
    const level = await CareerPathLevel.findOrFail(levelId)
    await level.delete()

    await AuditLogService.log({
      userId,
      action: 'delete',
      resourceType: 'career_path_level',
      resourceId: level.id,
      description: `Nível removido: ${level.title}`,
    })

    return level
  }

  /**
   * Identifica career path do colaborador baseado na posicao atual
   */
  async getEmployeeCareerPath(employeeId: number) {
    const employee = await Employee.query()
      .where('id', employeeId)
      .preload('position')
      .firstOrFail()

    if (!employee.positionId) {
      return null
    }

    // Busca paths que contenham a posicao atual do colaborador
    const paths = await CareerPath.query()
      .where('is_active', true)
      .preload('levels', (query) => {
        query.orderBy('level_order', 'asc').preload('position')
      })

    const matchingPath = paths.find((path) =>
      path.levels.some((level) => level.positionId === employee.positionId)
    )

    if (!matchingPath) {
      return null
    }

    const currentLevelIndex = matchingPath.levels.findIndex(
      (level) => level.positionId === employee.positionId
    )

    return {
      path: matchingPath,
      currentLevel: matchingPath.levels[currentLevelIndex],
      nextLevel:
        currentLevelIndex < matchingPath.levels.length - 1
          ? matchingPath.levels[currentLevelIndex + 1]
          : null,
      currentLevelIndex,
      totalLevels: matchingPath.levels.length,
    }
  }

  /**
   * Lista planos de sucessao
   */
  async getSuccessionPlans(filters: SuccessionFilters = {}) {
    const query = SuccessionPlan.query()
      .preload('position')
      .preload('currentHolder', (query) => query.preload('position'))
      .preload('successor', (query) => query.preload('position'))

    if (filters.positionId) {
      query.where('position_id', filters.positionId)
    }

    if (filters.priority) {
      query.where('priority', filters.priority)
    }

    return await query.orderBy('priority', 'asc')
  }

  /**
   * Cria plano de sucessao
   */
  async createSuccessionPlan(data: CreateSuccessionPlanData, userId?: number) {
    await Position.findOrFail(data.position_id)

    const plan = await SuccessionPlan.create({
      positionId: data.position_id,
      currentHolderId: data.current_holder_id || null,
      successorId: data.successor_id || null,
      readiness: data.readiness,
      priority: data.priority,
      developmentActions: data.development_actions || null,
      notes: data.notes || null,
      createdBy: userId || null,
    })

    await plan.load('position')
    await plan.load('currentHolder')
    await plan.load('successor')

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'succession_plan',
      resourceId: plan.id,
      description: `Plano de sucessão criado para posição ID ${data.position_id}`,
      newValues: { positionId: data.position_id, priority: data.priority },
    })

    return plan
  }

  /**
   * Atualiza plano de sucessao
   */
  async updateSuccessionPlan(id: number, data: UpdateSuccessionPlanData, userId?: number) {
    const plan = await SuccessionPlan.findOrFail(id)
    const oldValues = { readiness: plan.readiness, priority: plan.priority }

    plan.merge({
      currentHolderId:
        data.current_holder_id !== undefined ? data.current_holder_id : plan.currentHolderId,
      successorId: data.successor_id !== undefined ? data.successor_id : plan.successorId,
      readiness: data.readiness ?? plan.readiness,
      priority: data.priority ?? plan.priority,
      developmentActions:
        data.development_actions !== undefined ? data.development_actions : plan.developmentActions,
      notes: data.notes !== undefined ? data.notes : plan.notes,
    })

    await plan.save()
    await plan.load('position')
    await plan.load('currentHolder')
    await plan.load('successor')

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'succession_plan',
      resourceId: plan.id,
      description: `Plano de sucessão atualizado`,
      oldValues,
      newValues: { readiness: plan.readiness, priority: plan.priority },
    })

    return plan
  }

  /**
   * Remove plano de sucessao
   */
  async deleteSuccessionPlan(id: number, userId?: number) {
    const plan = await SuccessionPlan.findOrFail(id)
    await plan.delete()

    await AuditLogService.log({
      userId,
      action: 'delete',
      resourceType: 'succession_plan',
      resourceId: plan.id,
      description: `Plano de sucessão removido`,
    })

    return plan
  }

  /**
   * Retorna planos onde o colaborador e sucessor
   */
  async getSuccessionPlansByEmployee(employeeId: number) {
    await Employee.findOrFail(employeeId)

    return await SuccessionPlan.query()
      .where('successor_id', employeeId)
      .preload('position')
      .preload('currentHolder')
  }

  /**
   * Retorna posicoes criticas (sem sucessor ou com readiness = development_needed)
   */
  async getCriticalPositions() {
    const allPlans = await SuccessionPlan.query()
      .preload('position')
      .preload('currentHolder')
      .preload('successor')

    const critical = allPlans.filter(
      (plan) =>
        !plan.successorId ||
        plan.readiness === 'development_needed' ||
        plan.priority === 'critical'
    )

    return critical
  }
}

import SkillCategory from '#models/skill_category'
import Skill from '#models/skill'
import EmployeeSkill from '#models/employee_skill'
import Employee from '#models/employee'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

interface CreateCategoryData {
  name: string
  description?: string | null
  display_order?: number
}

interface UpdateCategoryData {
  name?: string
  description?: string | null
  display_order?: number
}

interface CreateSkillData {
  category_id: number
  name: string
  description?: string | null
  level_descriptors?: Record<string, any> | null
}

interface UpdateSkillData {
  category_id?: number
  name?: string
  description?: string | null
  level_descriptors?: Record<string, any> | null
}

interface AssessSkillData {
  employeeId: number
  skillId: number
  currentLevel: number
  targetLevel?: number | null
  assessedBy: number
  notes?: string | null
}

interface SkillFilters {
  categoryId?: number
  isActive?: boolean
}

export default class SkillMatrixService {
  /**
   * Lista categorias de skills com suas skills
   */
  async listCategories() {
    return await SkillCategory.query()
      .where('is_active', true)
      .preload('skills', (query) => query.where('is_active', true))
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc')
  }

  /**
   * Cria nova categoria de skill
   */
  async createCategory(data: CreateCategoryData, userId?: number) {
    const category = await SkillCategory.create({
      name: data.name,
      description: data.description || null,
      displayOrder: data.display_order || 0,
      isActive: true,
    })

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'skill_category',
      resourceId: category.id,
      description: `Categoria de skill criada: ${category.name}`,
      newValues: { name: category.name },
    })

    return category
  }

  /**
   * Atualiza categoria de skill
   */
  async updateCategory(id: number, data: UpdateCategoryData, userId?: number) {
    const category = await SkillCategory.findOrFail(id)
    const oldValues = { name: category.name }

    category.merge({
      name: data.name ?? category.name,
      description: data.description !== undefined ? data.description : category.description,
      displayOrder: data.display_order ?? category.displayOrder,
    })

    await category.save()

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'skill_category',
      resourceId: category.id,
      description: `Categoria de skill atualizada: ${category.name}`,
      oldValues,
      newValues: { name: category.name },
    })

    return category
  }

  /**
   * Remove categoria (soft delete)
   */
  async deleteCategory(id: number, userId?: number) {
    const category = await SkillCategory.findOrFail(id)
    category.isActive = false
    await category.save()

    await AuditLogService.log({
      userId,
      action: 'delete',
      resourceType: 'skill_category',
      resourceId: category.id,
      description: `Categoria de skill removida: ${category.name}`,
    })

    return category
  }

  /**
   * Lista skills com filtros
   */
  async listSkills(filters: SkillFilters = {}) {
    const query = Skill.query().preload('category')

    if (filters.categoryId) {
      query.where('category_id', filters.categoryId)
    }

    if (filters.isActive !== undefined) {
      query.where('is_active', filters.isActive)
    }

    return await query.orderBy('name', 'asc')
  }

  /**
   * Cria nova skill
   */
  async createSkill(data: CreateSkillData, userId?: number) {
    const skill = await Skill.create({
      categoryId: data.category_id,
      name: data.name,
      description: data.description || null,
      levelDescriptors: data.level_descriptors || null,
      isActive: true,
    })

    await skill.load('category')

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'skill',
      resourceId: skill.id,
      description: `Skill criada: ${skill.name}`,
      newValues: { name: skill.name, categoryId: skill.categoryId },
    })

    return skill
  }

  /**
   * Atualiza skill
   */
  async updateSkill(id: number, data: UpdateSkillData, userId?: number) {
    const skill = await Skill.findOrFail(id)
    const oldValues = { name: skill.name }

    skill.merge({
      categoryId: data.category_id ?? skill.categoryId,
      name: data.name ?? skill.name,
      description: data.description !== undefined ? data.description : skill.description,
      levelDescriptors:
        data.level_descriptors !== undefined ? data.level_descriptors : skill.levelDescriptors,
    })

    await skill.save()
    await skill.load('category')

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'skill',
      resourceId: skill.id,
      description: `Skill atualizada: ${skill.name}`,
      oldValues,
      newValues: { name: skill.name },
    })

    return skill
  }

  /**
   * Remove skill (soft delete)
   */
  async deleteSkill(id: number, userId?: number) {
    const skill = await Skill.findOrFail(id)
    skill.isActive = false
    await skill.save()

    await AuditLogService.log({
      userId,
      action: 'delete',
      resourceType: 'skill',
      resourceId: skill.id,
      description: `Skill removida: ${skill.name}`,
    })

    return skill
  }

  /**
   * Retorna skills do colaborador
   */
  async getEmployeeSkills(employeeId: number) {
    await Employee.findOrFail(employeeId)

    return await EmployeeSkill.query()
      .where('employee_id', employeeId)
      .preload('skill', (query) => query.preload('category'))
      .preload('assessor')
      .orderBy('created_at', 'desc')
  }

  /**
   * Avalia skill de um colaborador
   */
  async assessEmployeeSkill(data: AssessSkillData, userId?: number) {
    await Employee.findOrFail(data.employeeId)
    await Skill.findOrFail(data.skillId)

    // Verifica se ja existe avaliacao
    let employeeSkill = await EmployeeSkill.query()
      .where('employee_id', data.employeeId)
      .where('skill_id', data.skillId)
      .first()

    if (employeeSkill) {
      const oldValues = { currentLevel: employeeSkill.currentLevel }
      employeeSkill.currentLevel = data.currentLevel
      employeeSkill.targetLevel = data.targetLevel || null
      employeeSkill.assessedBy = data.assessedBy
      employeeSkill.assessedAt = DateTime.now()
      employeeSkill.notes = data.notes || null
      await employeeSkill.save()

      await AuditLogService.log({
        userId,
        action: 'update',
        resourceType: 'employee_skill',
        resourceId: employeeSkill.id,
        description: `Skill reavaliada para colaborador ID ${data.employeeId}`,
        oldValues,
        newValues: { currentLevel: data.currentLevel },
      })
    } else {
      employeeSkill = await EmployeeSkill.create({
        employeeId: data.employeeId,
        skillId: data.skillId,
        currentLevel: data.currentLevel,
        targetLevel: data.targetLevel || null,
        assessedBy: data.assessedBy,
        assessedAt: DateTime.now(),
        notes: data.notes || null,
      })

      await AuditLogService.log({
        userId,
        action: 'create',
        resourceType: 'employee_skill',
        resourceId: employeeSkill.id,
        description: `Skill avaliada para colaborador ID ${data.employeeId}`,
        newValues: { currentLevel: data.currentLevel, skillId: data.skillId },
      })
    }

    await employeeSkill.load('skill', (query) => query.preload('category'))
    await employeeSkill.load('assessor')

    return employeeSkill
  }

  /**
   * Avaliacao em lote de skills
   */
  async bulkAssessEmployeeSkills(
    employeeId: number,
    assessments: Array<{
      skill_id: number
      current_level: number
      target_level?: number | null
      notes?: string | null
    }>,
    assessedBy: number,
    userId?: number
  ) {
    await Employee.findOrFail(employeeId)

    const results = []
    for (const assessment of assessments) {
      const result = await this.assessEmployeeSkill(
        {
          employeeId,
          skillId: assessment.skill_id,
          currentLevel: assessment.current_level,
          targetLevel: assessment.target_level,
          assessedBy,
          notes: assessment.notes,
        },
        userId
      )
      results.push(result)
    }

    return results
  }

  /**
   * Relatorio de gap de skills (diferenca entre nivel atual e alvo)
   */
  async getSkillGapReport(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const skills = await EmployeeSkill.query()
      .where('employee_id', employeeId)
      .whereNotNull('target_level')
      .preload('skill', (query) => query.preload('category'))

    return skills.map((es) => ({
      skill: es.skill.name,
      category: es.skill.category.name,
      currentLevel: es.currentLevel,
      targetLevel: es.targetLevel,
      gap: es.targetLevel! - es.currentLevel,
    }))
  }

  /**
   * Matrix de skills por departamento
   */
  async getDepartmentSkillMatrix(departmentId: number) {
    const employees = await Employee.query()
      .where('department_id', departmentId)
      .where('status', 'active')
      .preload('position')

    const matrix = []
    for (const employee of employees) {
      const skills = await EmployeeSkill.query()
        .where('employee_id', employee.id)
        .preload('skill', (query) => query.preload('category'))

      matrix.push({
        employeeId: employee.id,
        employeeName: employee.fullName,
        position: employee.position?.title || null,
        skills: skills.map((es) => ({
          skillId: es.skillId,
          skillName: es.skill.name,
          category: es.skill.category.name,
          currentLevel: es.currentLevel,
          targetLevel: es.targetLevel,
        })),
      })
    }

    return matrix
  }

  /**
   * Distribuicao de niveis para uma skill
   */
  async getSkillDistribution(skillId: number) {
    await Skill.findOrFail(skillId)

    const distribution = await db
      .from('employee_skills')
      .select('current_level')
      .where('skill_id', skillId)
      .groupBy('current_level')
      .count('* as total')
      .orderBy('current_level', 'asc')

    return distribution.map((d) => ({
      level: d.current_level,
      count: Number(d.total),
    }))
  }
}

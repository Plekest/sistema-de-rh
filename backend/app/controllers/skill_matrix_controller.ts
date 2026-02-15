import type { HttpContext } from '@adonisjs/core/http'
import SkillMatrixService from '#services/skill_matrix_service'
import {
  createCategoryValidator,
  updateCategoryValidator,
  createSkillValidator,
  updateSkillValidator,
  assessSkillValidator,
  bulkAssessValidator,
} from '#validators/skill_matrix_validator'

export default class SkillMatrixController {
  private service: SkillMatrixService

  constructor() {
    this.service = new SkillMatrixService()
  }

  async listCategories({ response }: HttpContext) {
    try {
      const categories = await this.service.listCategories()
      return response.ok({ data: categories })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar categorias' })
    }
  }

  async createCategory({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCategoryValidator)
      const userId = auth.user?.id

      const category = await this.service.createCategory(data, userId)
      return response.created({ data: category })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar categoria' })
    }
  }

  async updateCategory({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateCategoryValidator)
      const userId = auth.user?.id

      const category = await this.service.updateCategory(params.id, data, userId)
      return response.ok({ data: category })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Categoria não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar categoria' })
    }
  }

  async deleteCategory({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const category = await this.service.deleteCategory(params.id, userId)
      return response.ok({ data: category })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Categoria não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover categoria' })
    }
  }

  async listSkills({ request, response }: HttpContext) {
    try {
      const filters = {
        categoryId: request.input('category_id'),
        isActive: request.input('is_active'),
      }

      const skills = await this.service.listSkills(filters)
      return response.ok({ data: skills })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar skills' })
    }
  }

  async createSkill({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createSkillValidator)
      const userId = auth.user?.id

      const skill = await this.service.createSkill(data, userId)
      return response.created({ data: skill })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar skill' })
    }
  }

  async updateSkill({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateSkillValidator)
      const userId = auth.user?.id

      const skill = await this.service.updateSkill(params.id, data, userId)
      return response.ok({ data: skill })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Skill não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar skill' })
    }
  }

  async deleteSkill({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const skill = await this.service.deleteSkill(params.id, userId)
      return response.ok({ data: skill })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Skill não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover skill' })
    }
  }

  async getEmployeeSkills({ params, response }: HttpContext) {
    try {
      const skills = await this.service.getEmployeeSkills(params.employeeId)
      return response.ok({ data: skills })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar skills do colaborador' })
    }
  }

  async assessSkill({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(assessSkillValidator)
      const userId = auth.user?.id

      const employeeSkill = await this.service.assessEmployeeSkill(
        {
          employeeId: data.employee_id,
          skillId: data.skill_id,
          currentLevel: data.current_level,
          targetLevel: data.target_level,
          assessedBy: userId!,
          notes: data.notes,
        },
        userId
      )

      return response.ok({ data: employeeSkill })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador ou skill não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao avaliar skill' })
    }
  }

  async bulkAssess({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(bulkAssessValidator)
      const userId = auth.user?.id

      const results = await this.service.bulkAssessEmployeeSkills(
        data.employee_id,
        data.assessments,
        userId!,
        userId
      )

      return response.ok({ data: results })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao avaliar skills em lote' })
    }
  }

  async skillGapReport({ params, response }: HttpContext) {
    try {
      const report = await this.service.getSkillGapReport(params.employeeId)
      return response.ok({ data: report })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao gerar relatório de gap' })
    }
  }

  async departmentMatrix({ params, response }: HttpContext) {
    try {
      const matrix = await this.service.getDepartmentSkillMatrix(params.departmentId)
      return response.ok({ data: matrix })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar matriz de skills do departamento',
      })
    }
  }

  async skillDistribution({ params, response }: HttpContext) {
    try {
      const distribution = await this.service.getSkillDistribution(params.skillId)
      return response.ok({ data: distribution })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Skill não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar distribuição de skill' })
    }
  }
}

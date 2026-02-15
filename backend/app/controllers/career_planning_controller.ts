import type { HttpContext } from '@adonisjs/core/http'
import CareerPlanningService from '#services/career_planning_service'
import {
  createPathValidator,
  updatePathValidator,
  createLevelValidator,
  updateLevelValidator,
  createSuccessionPlanValidator,
  updateSuccessionPlanValidator,
} from '#validators/career_planning_validator'

export default class CareerPlanningController {
  private service: CareerPlanningService

  constructor() {
    this.service = new CareerPlanningService()
  }

  async listPaths({ request, response }: HttpContext) {
    try {
      const filters = {
        departmentId: request.input('department_id'),
        isActive: request.input('is_active'),
      }

      const paths = await this.service.listPaths(filters)
      return response.ok({ data: paths })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar career paths' })
    }
  }

  async createPath({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createPathValidator)
      const userId = auth.user?.id

      const path = await this.service.createPath(data, userId)
      return response.created({ data: path })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar career path' })
    }
  }

  async updatePath({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updatePathValidator)
      const userId = auth.user?.id

      const path = await this.service.updatePath(params.id, data, userId)
      return response.ok({ data: path })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Career path não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar career path' })
    }
  }

  async deletePath({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const path = await this.service.deletePath(params.id, userId)
      return response.ok({ data: path })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Career path não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover career path' })
    }
  }

  async addLevel({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createLevelValidator)
      const userId = auth.user?.id

      const level = await this.service.addLevel(params.pathId, data, userId)
      return response.created({ data: level })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Career path não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao adicionar nível' })
    }
  }

  async updateLevel({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateLevelValidator)
      const userId = auth.user?.id

      const level = await this.service.updateLevel(params.id, data, userId)
      return response.ok({ data: level })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Nível não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar nível' })
    }
  }

  async removeLevel({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const level = await this.service.removeLevel(params.id, userId)
      return response.ok({ data: level })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Nível não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover nível' })
    }
  }

  async employeeCareerPath({ params, response }: HttpContext) {
    try {
      const careerPath = await this.service.getEmployeeCareerPath(params.employeeId)

      if (!careerPath) {
        return response.ok({
          data: null,
          message: 'Colaborador não possui career path identificado',
        })
      }

      return response.ok({ data: careerPath })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar career path do colaborador' })
    }
  }

  async listSuccessionPlans({ request, response }: HttpContext) {
    try {
      const filters = {
        positionId: request.input('position_id'),
        priority: request.input('priority'),
      }

      const plans = await this.service.getSuccessionPlans(filters)
      return response.ok({ data: plans })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar planos de sucessão' })
    }
  }

  async createSuccessionPlan({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createSuccessionPlanValidator)
      const userId = auth.user?.id

      const plan = await this.service.createSuccessionPlan(data, userId)
      return response.created({ data: plan })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Posição não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar plano de sucessão' })
    }
  }

  async updateSuccessionPlan({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateSuccessionPlanValidator)
      const userId = auth.user?.id

      const plan = await this.service.updateSuccessionPlan(params.id, data, userId)
      return response.ok({ data: plan })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Plano de sucessão não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar plano de sucessão' })
    }
  }

  async deleteSuccessionPlan({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const plan = await this.service.deleteSuccessionPlan(params.id, userId)
      return response.ok({ data: plan })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Plano de sucessão não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover plano de sucessão' })
    }
  }

  async criticalPositions({ response }: HttpContext) {
    try {
      const positions = await this.service.getCriticalPositions()
      return response.ok({ data: positions })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar posições críticas' })
    }
  }
}

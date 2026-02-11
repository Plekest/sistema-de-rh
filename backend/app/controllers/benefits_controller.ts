import type { HttpContext } from '@adonisjs/core/http'
import BenefitService from '#services/benefit_service'
import {
  createBenefitValidator,
  updateBenefitValidator,
  createBenefitPlanValidator,
  updateBenefitPlanValidator,
  enrollEmployeeValidator,
  listBenefitValidator,
  addDependentValidator,
} from '#validators/benefit_validator'

export default class BenefitsController {
  private service: BenefitService

  constructor() {
    this.service = new BenefitService()
  }

  /**
   * Lista beneficios
   * GET /api/v1/benefits
   */
  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listBenefitValidator)
      const result = await this.service.listBenefits(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar beneficios' })
    }
  }

  /**
   * Detalhe de beneficio com planos
   * GET /api/v1/benefits/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const benefit = await this.service.findBenefitById(params.id)
      return response.ok({ data: benefit })
    } catch {
      return response.notFound({ message: 'Beneficio nao encontrado' })
    }
  }

  /**
   * Cria novo beneficio (admin only)
   * POST /api/v1/benefits
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createBenefitValidator)
      const benefit = await this.service.createBenefit(data)
      return response.created({ data: benefit })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar beneficio' })
    }
  }

  /**
   * Atualiza beneficio (admin only)
   * PUT /api/v1/benefits/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateBenefitValidator)
      const benefit = await this.service.updateBenefit(params.id, data)
      return response.ok({ data: benefit })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Beneficio nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar beneficio' })
    }
  }

  /**
   * Desativa beneficio (admin only)
   * DELETE /api/v1/benefits/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const benefit = await this.service.deleteBenefit(params.id)
      return response.ok({ data: benefit })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Beneficio nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao desativar beneficio' })
    }
  }

  /**
   * Cria plano para um beneficio (admin only)
   * POST /api/v1/benefits/:id/plans
   */
  async storePlan({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createBenefitPlanValidator)
      const plan = await this.service.createPlan(data)
      return response.created({ data: plan })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Beneficio nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar plano' })
    }
  }

  /**
   * Atualiza plano de beneficio (admin only)
   * PUT /api/v1/benefit-plans/:id
   */
  async updatePlan({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateBenefitPlanValidator)
      const plan = await this.service.updatePlan(params.id, data)
      return response.ok({ data: plan })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Plano de beneficio nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar plano' })
    }
  }

  /**
   * Lista beneficios de um colaborador
   * GET /api/v1/employees/:employeeId/benefits
   */
  async employeeBenefits({ params, response }: HttpContext) {
    try {
      const benefits = await this.service.getEmployeeBenefits(params.employeeId)
      return response.ok({ data: benefits })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar beneficios do colaborador' })
    }
  }

  /**
   * Adesao de colaborador a beneficio
   * POST /api/v1/employees/:employeeId/benefits
   */
  async enroll({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(enrollEmployeeValidator)
      const employeeBenefit = await this.service.enrollEmployee(data)
      return response.created({ data: employeeBenefit })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador ou plano de beneficio nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao realizar adesao' })
    }
  }

  /**
   * Cancela adesao de colaborador
   * DELETE /api/v1/employees/:employeeId/benefits/:id
   */
  async cancelEnrollment({ params, response }: HttpContext) {
    try {
      const employeeBenefit = await this.service.cancelEnrollment(params.id)
      return response.ok({ data: employeeBenefit })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Adesao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao cancelar adesao' })
    }
  }

  /**
   * Adiciona dependente a beneficio
   * POST /api/v1/employee-benefits/:id/dependents
   */
  async addDependent({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(addDependentValidator)
      const dependent = await this.service.addDependent(params.id, data)
      return response.created({ data: dependent })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Beneficio do colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao adicionar dependente' })
    }
  }

  /**
   * Remove dependente
   * DELETE /api/v1/benefit-dependents/:id
   */
  async removeDependent({ params, response }: HttpContext) {
    try {
      const dependent = await this.service.removeDependent(params.id)
      return response.ok({ data: dependent })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Dependente nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover dependente' })
    }
  }
}

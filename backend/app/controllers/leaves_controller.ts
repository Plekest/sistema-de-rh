import type { HttpContext } from '@adonisjs/core/http'
import LeaveService from '#services/leave_service'
import {
  createLeaveValidator,
  approveRejectLeaveValidator,
  listLeaveValidator,
  updateLeaveConfigValidator,
} from '#validators/leave_validator'

export default class LeavesController {
  private service: LeaveService

  constructor() {
    this.service = new LeaveService()
  }

  /**
   * Lista solicitacoes de ferias/licencas
   * GET /api/v1/leaves
   */
  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listLeaveValidator)
      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar solicitacoes' })
    }
  }

  /**
   * Detalhe de uma solicitacao
   * GET /api/v1/leaves/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const leave = await this.service.findById(params.id)
      return response.ok({ data: leave })
    } catch {
      return response.notFound({ message: 'Solicitacao nao encontrada' })
    }
  }

  /**
   * Cria nova solicitacao de ferias/licenca
   * POST /api/v1/leaves
   */
  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createLeaveValidator)
      const currentUserId = auth.user?.id
      const leave = await this.service.create(data, currentUserId)
      return response.created({ data: leave })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar solicitacao' })
    }
  }

  /**
   * Aprova uma solicitacao
   * PATCH /api/v1/leaves/:id/approve
   */
  async approve({ params, auth, response }: HttpContext) {
    try {
      const approverUserId = auth.user!.id
      const leave = await this.service.approve(params.id, approverUserId)
      return response.ok({ data: leave })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Solicitacao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao aprovar solicitacao' })
    }
  }

  /**
   * Rejeita uma solicitacao
   * PATCH /api/v1/leaves/:id/reject
   */
  async reject({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(approveRejectLeaveValidator)
      const approverUserId = auth.user!.id
      const leave = await this.service.reject(params.id, approverUserId, data.rejectionReason)
      return response.ok({ data: leave })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Solicitacao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao rejeitar solicitacao' })
    }
  }

  /**
   * Cancela uma solicitacao
   * PATCH /api/v1/leaves/:id/cancel
   * Employee: apenas as proprias. Admin/Manager: qualquer.
   */
  async cancel({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const leave = await this.service.cancel(params.id, user.id, user.role)
      return response.ok({ data: leave })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Solicitacao nao encontrada' })
      }
      if (error.message?.includes('permissao')) {
        return response.forbidden({ message: error.message })
      }
      return response.badRequest({ message: error.message || 'Erro ao cancelar solicitacao' })
    }
  }

  // ==========================================
  // Saldo de Ferias
  // ==========================================

  /**
   * Lista saldo de ferias de um colaborador
   * GET /api/v1/employees/:employeeId/leave-balance
   */
  async balances({ params, response }: HttpContext) {
    try {
      const balances = await this.service.getBalances(params.employeeId)
      return response.ok({ data: balances })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar saldos de ferias' })
    }
  }

  /**
   * Calcula/atualiza periodos aquisitivos de ferias de um colaborador
   * POST /api/v1/employees/:employeeId/leave-balance/calculate
   */
  async calculateBalances({ params, response }: HttpContext) {
    try {
      const balances = await this.service.calculateBalances(params.employeeId)
      return response.ok({ data: balances })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao calcular saldos' })
    }
  }

  // ==========================================
  // Configuracoes
  // ==========================================

  /**
   * Lista configuracoes de tipos de licenca
   * GET /api/v1/leave-configs
   */
  async configs({ response }: HttpContext) {
    try {
      // Garante que as configuracoes padrao existam
      await this.service.seedDefaultConfigs()
      const configs = await this.service.getConfigs()
      return response.ok({ data: configs })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar configuracoes' })
    }
  }

  /**
   * Atualiza configuracao de um tipo de licenca
   * PUT /api/v1/leave-configs/:id
   */
  async updateConfig({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateLeaveConfigValidator)
      const config = await this.service.updateConfig(params.id, data)
      return response.ok({ data: config })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Configuracao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar configuracao' })
    }
  }

  // ==========================================
  // Calendario
  // ==========================================

  /**
   * Retorna calendario de ausencias
   * GET /api/v1/leaves/calendar?startDate=...&endDate=...&departmentId=...
   */
  async calendar({ request, response }: HttpContext) {
    try {
      const startDate = request.input('startDate')
      const endDate = request.input('endDate')
      const departmentId = request.input('departmentId')

      if (!startDate || !endDate) {
        return response.badRequest({ message: 'startDate e endDate sao obrigatorios' })
      }

      const leaves = await this.service.getCalendar(startDate, endDate, departmentId)
      return response.ok({ data: leaves })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar calendario' })
    }
  }
}

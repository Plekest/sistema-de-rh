import type { HttpContext } from '@adonisjs/core/http'
import PayrollService from '#services/payroll_service'
import AuditLogService from '#services/audit_log_service'
import Employee from '#models/employee'
import {
  createPayrollPeriodValidator,
  listPayrollPeriodsValidator,
  createPayrollComponentValidator,
  updatePayrollComponentValidator,
  createPayrollEntryValidator,
  listPaySlipsValidator,
} from '#validators/payroll_validator'

export default class PayrollController {
  private service: PayrollService

  constructor() {
    this.service = new PayrollService()
  }

  /**
   * Retorna o employeeId vinculado ao usuario logado (para role employee).
   * Retorna null se nao encontrar.
   */
  private async getEmployeeIdForUser(userId: number): Promise<number | null> {
    const employee = await Employee.query()
      .where('userId', userId)
      .where('status', 'active')
      .first()
    return employee?.id || null
  }

  // ==========================================
  // Periodos de Folha
  // ==========================================

  /**
   * Lista periodos de folha de pagamento
   * GET /api/v1/payroll/periods
   */
  async periods({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listPayrollPeriodsValidator)
      const result = await this.service.listPeriods(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar periodos' })
    }
  }

  /**
   * Cria um novo periodo de folha
   * POST /api/v1/payroll/periods
   */
  async createPeriod({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createPayrollPeriodValidator)
      const period = await this.service.createPeriod(data)
      return response.created({ data: period })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar periodo' })
    }
  }

  /**
   * Fecha um periodo de folha
   * PATCH /api/v1/payroll/periods/:id/close
   */
  async closePeriod({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user!.id
      const period = await this.service.closePeriod(params.id, userId)
      return response.ok({ data: period })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Periodo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao fechar periodo' })
    }
  }

  // ==========================================
  // Componentes Salariais
  // ==========================================

  /**
   * Lista componentes salariais de um colaborador
   * GET /api/v1/employees/:employeeId/payroll-components
   * Admin/Manager: qualquer employee. Employee: apenas os proprios.
   */
  async components({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      if (user.role === 'employee') {
        const employeeId = await this.getEmployeeIdForUser(user.id)
        if (!employeeId || Number(params.employeeId) !== employeeId) {
          return response.forbidden({ message: 'Acesso negado a estes dados salariais' })
        }
      }

      const components = await this.service.getComponents(params.employeeId)
      return response.ok({ data: components })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar componentes salariais' })
    }
  }

  /**
   * Cria um novo componente salarial
   * POST /api/v1/payroll/components
   */
  async createComponent({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createPayrollComponentValidator)
      const component = await this.service.createComponent(data)
      return response.created({ data: component })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar componente' })
    }
  }

  /**
   * Atualiza um componente salarial
   * PUT /api/v1/payroll/components/:id
   */
  async updateComponent({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updatePayrollComponentValidator)
      const component = await this.service.updateComponent(params.id, data)
      return response.ok({ data: component })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Componente nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar componente' })
    }
  }

  // ==========================================
  // Calculo de Folha
  // ==========================================

  /**
   * Calcula a folha de pagamento de um periodo
   * POST /api/v1/payroll/periods/:id/calculate
   */
  async calculatePayroll({ params, auth, response }: HttpContext) {
    try {
      const slips = await this.service.calculatePayroll(params.id)

      // Registra no audit log
      await AuditLogService.log({
        userId: auth.user?.id,
        action: 'process',
        resourceType: 'payroll',
        resourceId: Number(params.id),
        description: `Folha de pagamento processada para período ID ${params.id}. ${slips.length} contracheques gerados.`,
      })

      return response.ok({ data: slips })
    } catch (error) {
      console.error('Erro ao calcular folha:', error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Periodo nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao calcular folha' })
    }
  }

  // ==========================================
  // Lancamentos
  // ==========================================

  /**
   * Cria um lancamento manual na folha
   * POST /api/v1/payroll/entries
   */
  async createEntry({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createPayrollEntryValidator)
      const entry = await this.service.createEntry(data)
      return response.created({ data: entry })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Periodo ou colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar lancamento' })
    }
  }

  // ==========================================
  // Contracheques
  // ==========================================

  /**
   * Lista contracheques de um periodo
   * GET /api/v1/payroll/periods/:periodId/slips
   * Admin/Manager: veem todos. Employee: ve apenas o proprio.
   */
  async slips({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      if (user.role === 'employee') {
        const employeeId = await this.getEmployeeIdForUser(user.id)
        if (!employeeId) {
          return response.ok({ data: [] })
        }
        const slips = await this.service.getPaySlips(params.periodId, employeeId)
        return response.ok({ data: slips })
      }

      const slips = await this.service.getPaySlips(params.periodId)
      return response.ok({ data: slips })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar contracheques' })
    }
  }

  /**
   * Lista contracheques de um colaborador
   * GET /api/v1/payroll/slips
   * Admin/Manager: podem filtrar por qualquer employeeId. Employee: apenas os proprios.
   */
  async employeeSlips({ request, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const filters = await request.validateUsing(listPaySlipsValidator)

      if (user.role === 'employee') {
        const employeeId = await this.getEmployeeIdForUser(user.id)
        if (!employeeId) {
          return response.ok({ data: [], meta: { total: 0, page: 1, lastPage: 1 } })
        }
        filters.employeeId = employeeId
      }

      const result = await this.service.getEmployeePaySlips(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar contracheques' })
    }
  }

  /**
   * Retorna detalhes de um contracheque
   * GET /api/v1/payroll/slips/:id
   * Admin/Manager: qualquer contracheque. Employee: apenas o proprio.
   */
  async slipDetail({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const detail = await this.service.getPaySlipDetail(params.id)

      if (user.role === 'employee') {
        const employeeId = await this.getEmployeeIdForUser(user.id)
        if (!employeeId || detail.slip.employeeId !== employeeId) {
          return response.forbidden({ message: 'Acesso negado a este contracheque' })
        }
      }

      return response.ok({ data: detail })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Contracheque nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar detalhes' })
    }
  }

  /**
   * Baixar PDF do contracheque
   * GET /api/v1/payroll/slips/:id/pdf
   */
  async downloadPdf({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const paySlip = await this.service.getPaySlipById(params.id)

      // Employee pode baixar apenas seu proprio contracheque
      if (user.role === 'employee') {
        const employeeId = await this.getEmployeeIdForUser(user.id)
        if (!employeeId || paySlip.employeeId !== employeeId) {
          return response.forbidden({ message: 'Acesso negado a este contracheque' })
        }
      }

      const PdfService = (await import('#services/pdf_service')).default
      const pdfService = new PdfService()
      const pdfStream = await pdfService.generatePaySlipPdf(paySlip)

      response.header('Content-Type', 'application/pdf')
      response.header(
        'Content-Disposition',
        `attachment; filename="contracheque_${paySlip.id}.pdf"`
      )
      response.stream(pdfStream)
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Contracheque nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao gerar PDF' })
    }
  }
}

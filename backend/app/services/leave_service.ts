import Leave from '#models/leave'
import LeaveBalance from '#models/leave_balance'
import LeaveConfig from '#models/leave_config'
import Employee from '#models/employee'
import EmployeeHistoryService from '#services/employee_history_service'
import NotificationService from '#services/notification_service'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  employeeId?: number
  type?: string
  status?: string
}

interface CreateLeaveData {
  employeeId: number
  type: 'vacation' | 'medical' | 'maternity' | 'paternity' | 'bereavement' | 'wedding' | 'blood_donation' | 'military' | 'other'
  startDate: string
  endDate: string
  daysCount: number
  isPaid?: boolean
  sellDays?: number
  leaveBalanceId?: number | null
  notes?: string | null
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Ferias',
  medical: 'Licenca Medica',
  maternity: 'Licenca Maternidade',
  paternity: 'Licenca Paternidade',
  bereavement: 'Licenca Luto',
  wedding: 'Licenca Casamento',
  blood_donation: 'Doacao de Sangue',
  military: 'Servico Militar',
  other: 'Outros',
}

export default class LeaveService {
  private historyService = new EmployeeHistoryService()
  private notificationService = new NotificationService()

  /**
   * Lista solicitacoes de ferias/licencas com filtros e paginacao
   */
  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Leave.query()
      .preload('employee')
      .preload('approver')
      .orderBy('createdAt', 'desc')

    if (filters.employeeId) {
      query.where('employeeId', filters.employeeId)
    }
    if (filters.type) {
      query.where('type', filters.type)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Busca uma solicitacao por ID
   */
  async findById(id: number) {
    return await Leave.query()
      .where('id', id)
      .preload('employee')
      .preload('approver')
      .preload('leaveBalance')
      .firstOrFail()
  }

  /**
   * Cria uma nova solicitacao de ferias/licenca
   * Valida regras CLT para ferias:
   * - Periodo minimo de 14 dias para uma parcela
   * - Maximo 3 periodos de fracionamento
   * - Abono pecuniario maximo de 1/3 (10 dias)
   */
  async create(data: CreateLeaveData, currentUserId?: number) {
    // Valida se o colaborador existe e esta ativo
    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    // Para ferias, valida regras CLT
    if (data.type === 'vacation') {
      await this.validateVacationRules(data)
    }

    const leave = await Leave.create({
      employeeId: data.employeeId,
      leaveBalanceId: data.leaveBalanceId || null,
      type: data.type,
      status: 'pending',
      startDate: DateTime.fromISO(data.startDate),
      endDate: DateTime.fromISO(data.endDate),
      daysCount: data.daysCount,
      isPaid: data.isPaid !== undefined ? data.isPaid : true,
      sellDays: data.sellDays || 0,
      notes: data.notes || null,
      requestedBy: currentUserId || null,
    })

    await leave.load('employee')
    return leave
  }

  /**
   * Aprova uma solicitacao
   */
  async approve(id: number, approverUserId: number) {
    const leave = await Leave.findOrFail(id)

    if (leave.status !== 'pending') {
      throw new Error('Apenas solicitacoes pendentes podem ser aprovadas')
    }

    leave.status = 'approved'
    leave.approvedBy = approverUserId
    leave.approvedAt = DateTime.now()
    await leave.save()

    // Se for ferias e tiver leaveBalanceId, atualiza o saldo
    if (leave.type === 'vacation' && leave.leaveBalanceId) {
      await this.updateLeaveBalance(leave.leaveBalanceId, leave.daysCount, leave.sellDays)
    }

    await leave.load('employee')
    await leave.load('approver')

    // Registra no historico do colaborador
    const typeLabel = LEAVE_TYPE_LABELS[leave.type] || leave.type
    await this.historyService.recordLeaveApproval(
      leave.employeeId,
      typeLabel,
      leave.startDate.toISODate()!,
      leave.endDate.toISODate()!,
      leave.daysCount,
      approverUserId
    ).catch(() => {})

    // Envia notificacao para o colaborador (se tiver usuario vinculado)
    if (leave.employee.userId) {
      await this.notificationService
        .create(leave.employee.userId, {
          type: 'leave_approved',
          title: 'Solicitação Aprovada',
          message: `Sua solicitação de ${typeLabel} de ${leave.startDate.toFormat('dd/MM/yyyy')} a ${leave.endDate.toFormat('dd/MM/yyyy')} foi aprovada.`,
          metadata: {
            leaveId: leave.id,
            leaveType: leave.type,
            startDate: leave.startDate.toISODate(),
            endDate: leave.endDate.toISODate(),
          },
        })
        .catch(() => {})
    }

    return leave
  }

  /**
   * Rejeita uma solicitacao
   */
  async reject(id: number, approverUserId: number, reason?: string | null) {
    const leave = await Leave.findOrFail(id)

    if (leave.status !== 'pending') {
      throw new Error('Apenas solicitacoes pendentes podem ser rejeitadas')
    }

    leave.status = 'rejected'
    leave.approvedBy = approverUserId
    leave.approvedAt = DateTime.now()
    leave.rejectionReason = reason || null
    await leave.save()

    await leave.load('employee')
    await leave.load('approver')

    // Registra no historico do colaborador
    const typeLabel = LEAVE_TYPE_LABELS[leave.type] || leave.type
    await this.historyService.recordLeaveRejection(
      leave.employeeId,
      typeLabel,
      reason || undefined,
      approverUserId
    ).catch(() => {})

    // Envia notificacao para o colaborador (se tiver usuario vinculado)
    if (leave.employee.userId) {
      await this.notificationService
        .create(leave.employee.userId, {
          type: 'leave_rejected',
          title: 'Solicitação Rejeitada',
          message: `Sua solicitação de ${typeLabel} foi rejeitada. ${reason ? `Motivo: ${reason}` : ''}`,
          metadata: {
            leaveId: leave.id,
            leaveType: leave.type,
            rejectionReason: reason,
          },
        })
        .catch(() => {})
    }

    return leave
  }

  /**
   * Cancela uma solicitacao (pelo proprio colaborador ou admin/manager)
   * Verifica propriedade: employee so pode cancelar suas proprias solicitacoes
   */
  async cancel(id: number, userId: number, userRole: string) {
    const leave = await Leave.query()
      .where('id', id)
      .preload('employee')
      .firstOrFail()

    if (!['pending', 'approved'].includes(leave.status)) {
      throw new Error('Apenas solicitacoes pendentes ou aprovadas podem ser canceladas')
    }

    // Verifica propriedade: employee so pode cancelar as proprias
    if (userRole === 'employee') {
      if (!leave.employee || leave.employee.userId !== userId) {
        throw new Error('Voce nao tem permissao para cancelar esta solicitacao')
      }
    }

    // Se estava aprovada e tinha afetado o saldo, reverte
    if (leave.status === 'approved' && leave.type === 'vacation' && leave.leaveBalanceId) {
      await this.revertLeaveBalance(leave.leaveBalanceId, leave.daysCount, leave.sellDays)
    }

    leave.status = 'cancelled'
    await leave.save()

    return leave
  }

  // ==========================================
  // Saldo de Ferias (Leave Balance)
  // ==========================================

  /**
   * Lista saldos de ferias de um colaborador
   */
  async getBalances(employeeId: number) {
    return await LeaveBalance.query()
      .where('employeeId', employeeId)
      .preload('employee')
      .orderBy('accrualStartDate', 'desc')
  }

  /**
   * Calcula e gera/atualiza periodos aquisitivos de ferias para um colaborador
   * Regra CLT: a cada 12 meses de trabalho, ganha 30 dias de ferias
   */
  async calculateBalances(employeeId: number) {
    const employee = await Employee.findOrFail(employeeId)
    const hireDate = employee.hireDate
    const today = DateTime.now()

    // Calcula quantos periodos aquisitivos completos existem
    const monthsSinceHire = today.diff(hireDate, 'months').months
    const completePeriods = Math.floor(monthsSinceHire / 12)

    const balances: LeaveBalance[] = []

    for (let i = 0; i < completePeriods + 1; i++) {
      const accrualStart = hireDate.plus({ years: i })
      const accrualEnd = hireDate.plus({ years: i + 1 }).minus({ days: 1 })

      // Verifica se ja existe esse periodo
      const existing = await LeaveBalance.query()
        .where('employeeId', employeeId)
        .where('accrualStartDate', accrualStart.toISODate()!)
        .first()

      if (existing) {
        // Atualiza status se necessario
        if (i < completePeriods && existing.status === 'accruing') {
          existing.status = existing.usedDays > 0 ? 'partially_used' : 'available'
          await existing.save()
        }
        balances.push(existing)
      } else {
        // Cria novo periodo
        const isComplete = i < completePeriods
        const balance = await LeaveBalance.create({
          employeeId,
          accrualStartDate: accrualStart,
          accrualEndDate: accrualEnd,
          totalDays: 30,
          usedDays: 0,
          soldDays: 0,
          remainingDays: 30,
          status: isComplete ? 'available' : 'accruing',
        })
        balances.push(balance)
      }
    }

    return balances
  }

  // ==========================================
  // Configuracoes de tipos de licenca
  // ==========================================

  /**
   * Lista todas as configuracoes de tipos de licenca
   */
  async getConfigs() {
    return await LeaveConfig.query().orderBy('leaveType', 'asc')
  }

  /**
   * Atualiza configuracao de um tipo de licenca
   */
  async updateConfig(id: number, data: Partial<{ defaultDays: number; requiresApproval: boolean; requiresDocument: boolean; isPaid: boolean; isActive: boolean }>) {
    const config = await LeaveConfig.findOrFail(id)
    config.merge(data)
    await config.save()
    return config
  }

  /**
   * Inicializa configuracoes padrao de licencas se nao existirem
   */
  async seedDefaultConfigs() {
    const existing = await LeaveConfig.query().first()
    if (existing) return

    const defaults = [
      { leaveType: 'vacation', label: 'Ferias', defaultDays: 30, requiresApproval: true, requiresDocument: false, isPaid: true },
      { leaveType: 'medical', label: 'Licenca Medica', defaultDays: 1, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'maternity', label: 'Licenca Maternidade', defaultDays: 120, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'paternity', label: 'Licenca Paternidade', defaultDays: 5, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'bereavement', label: 'Licenca Luto', defaultDays: 2, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'wedding', label: 'Licenca Casamento', defaultDays: 3, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'blood_donation', label: 'Doacao de Sangue', defaultDays: 1, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'military', label: 'Servico Militar', defaultDays: 2, requiresApproval: true, requiresDocument: true, isPaid: true },
      { leaveType: 'other', label: 'Outros', defaultDays: 1, requiresApproval: true, requiresDocument: false, isPaid: false },
    ]

    for (const config of defaults) {
      await LeaveConfig.create(config)
    }
  }

  // ==========================================
  // Calendario de ausencias
  // ==========================================

  /**
   * Retorna ferias/licencas aprovadas e em andamento para um periodo (para calendario)
   */
  async getCalendar(startDate: string, endDate: string, departmentId?: number) {
    const query = Leave.query()
      .whereIn('status', ['approved', 'in_progress'])
      .where('startDate', '<=', endDate)
      .where('endDate', '>=', startDate)
      .preload('employee')

    if (departmentId) {
      query.whereHas('employee', (eq) => {
        eq.where('departmentId', departmentId)
      })
    }

    return await query.orderBy('startDate', 'asc')
  }

  // ==========================================
  // Metodos privados
  // ==========================================

  /**
   * Valida regras CLT para ferias
   */
  private async validateVacationRules(data: CreateLeaveData) {
    // Abono pecuniario maximo de 1/3 (10 dias)
    if (data.sellDays && data.sellDays > 10) {
      throw new Error('O abono pecuniario nao pode exceder 1/3 das ferias (10 dias)')
    }

    // Periodo minimo de 5 dias (Reforma Trabalhista)
    if (data.daysCount < 5) {
      throw new Error('O periodo minimo de ferias e de 5 dias corridos')
    }

    // Se tem leaveBalanceId, valida saldo disponivel
    if (data.leaveBalanceId) {
      const balance = await LeaveBalance.findOrFail(data.leaveBalanceId)
      const totalNeeded = data.daysCount + (data.sellDays || 0)
      if (totalNeeded > balance.remainingDays) {
        throw new Error(`Saldo insuficiente. Disponivel: ${balance.remainingDays} dias. Solicitado: ${totalNeeded} dias.`)
      }
    }

    // Verifica se ja tem 3 periodos de ferias fracionadas no mesmo balance
    if (data.leaveBalanceId) {
      const existingLeaves = await Leave.query()
        .where('leaveBalanceId', data.leaveBalanceId)
        .whereNotIn('status', ['rejected', 'cancelled'])
        .exec()

      if (existingLeaves.length >= 3) {
        throw new Error('Ferias podem ser fracionadas em no maximo 3 periodos')
      }

      // Se sera o primeiro periodo, deve ser de no minimo 14 dias
      if (existingLeaves.length === 0 && data.daysCount < 14) {
        throw new Error('O primeiro periodo de ferias deve ter no minimo 14 dias corridos')
      }
    }
  }

  /**
   * Atualiza saldo de ferias apos aprovacao
   */
  private async updateLeaveBalance(balanceId: number, daysUsed: number, daysSold: number) {
    const balance = await LeaveBalance.findOrFail(balanceId)
    balance.usedDays += daysUsed
    balance.soldDays += daysSold
    balance.remainingDays = balance.totalDays - balance.usedDays - balance.soldDays

    if (balance.remainingDays <= 0) {
      balance.status = 'used'
    } else {
      balance.status = 'partially_used'
    }

    await balance.save()
  }

  /**
   * Reverte saldo de ferias apos cancelamento
   */
  private async revertLeaveBalance(balanceId: number, daysUsed: number, daysSold: number) {
    const balance = await LeaveBalance.findOrFail(balanceId)
    balance.usedDays = Math.max(0, balance.usedDays - daysUsed)
    balance.soldDays = Math.max(0, balance.soldDays - daysSold)
    balance.remainingDays = balance.totalDays - balance.usedDays - balance.soldDays

    if (balance.usedDays === 0 && balance.soldDays === 0) {
      balance.status = 'available'
    } else {
      balance.status = 'partially_used'
    }

    await balance.save()
  }
}

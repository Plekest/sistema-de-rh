import Employee from '#models/employee'
import TimeEntry from '#models/time_entry'
import PayrollPeriod from '#models/payroll_period'
import PaySlip from '#models/pay_slip'
import Leave from '#models/leave'
import Training from '#models/training'
import { DateTime } from 'luxon'
import { toNumber } from '#utils/number_helper'

interface EmployeeFilters {
  type?: 'clt' | 'pj'
  status?: 'active' | 'inactive' | 'terminated'
  departmentId?: number
}

interface LeaveFilters {
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface TrainingFilters {
  type?: string
  status?: string
  category?: string
}

export default class ReportService {
  /**
   * UTF-8 BOM para garantir que o Excel abra corretamente arquivos com acentuacao
   */
  private readonly BOM = '\uFEFF'

  /**
   * Exporta lista de colaboradores para CSV
   */
  async exportEmployeesCSV(filters: EmployeeFilters = {}): Promise<string> {
    const query = Employee.query()
      .preload('department')
      .preload('position')
      .orderBy('fullName', 'asc')

    if (filters.type) {
      query.where('type', filters.type)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.departmentId) {
      query.where('departmentId', filters.departmentId)
    }

    const employees = await query

    const headers = [
      'Nome',
      'CPF/CNPJ',
      'Email',
      'Telefone',
      'Tipo',
      'Departamento',
      'Cargo',
      'Salario',
      'Status',
      'Data Admissao',
      'Data Desligamento',
    ].join(';')

    const rows = employees.map((emp) => {
      const cpfCnpj = emp.type === 'clt' ? emp.cpf || '-' : emp.cnpj || '-'
      const department = emp.department ? emp.department.name : '-'
      const position = emp.position ? emp.position.title : '-'
      const salary = emp.salary ? this.formatCurrency(emp.salary) : '-'
      const statusLabel = this.formatStatus(emp.status)
      const hireDate = emp.hireDate ? this.formatDate(emp.hireDate) : '-'
      const termDate = emp.terminationDate ? this.formatDate(emp.terminationDate) : '-'
      const typeLabel = emp.type === 'clt' ? 'CLT' : 'PJ'

      return [
        this.escapeCsvField(emp.fullName),
        this.escapeCsvField(cpfCnpj),
        this.escapeCsvField(emp.email),
        this.escapeCsvField(emp.phone || '-'),
        typeLabel,
        this.escapeCsvField(department),
        this.escapeCsvField(position),
        salary,
        statusLabel,
        hireDate,
        termDate,
      ].join(';')
    })

    return this.BOM + headers + '\n' + rows.join('\n')
  }

  /**
   * Exporta registros de ponto para CSV
   */
  async exportAttendanceCSV(
    month: number,
    year: number,
    employeeId?: number
  ): Promise<string> {
    const startDate = DateTime.fromObject({ year, month, day: 1 })
    const endDate = startDate.endOf('month')

    const query = TimeEntry.query()
      .preload('employee')
      .whereBetween('date', [startDate.toISODate()!, endDate.toISODate()!])
      .orderBy('date', 'asc')
      .orderBy('employeeId', 'asc')

    if (employeeId) {
      query.where('employeeId', employeeId)
    }

    const entries = await query

    const headers = [
      'Colaborador',
      'Data',
      'Entrada',
      'Saida Almoco',
      'Retorno Almoco',
      'Saida',
      'Horas Trabalhadas',
      'Atraso (min)',
      'Tipo',
      'Observacoes',
    ].join(';')

    const rows = entries.map((entry) => {
      const employeeName = entry.employee.fullName
      const date = this.formatDate(entry.date)
      const clockIn = entry.clockIn ? this.formatTime(entry.clockIn) : '-'
      const lunchStart = entry.lunchStart ? this.formatTime(entry.lunchStart) : '-'
      const lunchEnd = entry.lunchEnd ? this.formatTime(entry.lunchEnd) : '-'
      const clockOut = entry.clockOut ? this.formatTime(entry.clockOut) : '-'
      const hoursWorked = this.formatMinutesToHours(entry.totalWorkedMinutes)
      const lateMinutes = entry.isLate ? entry.lateMinutes.toString() : '0'
      const typeLabel = this.formatAttendanceType(entry.type)
      const notes = entry.notes || '-'

      return [
        this.escapeCsvField(employeeName),
        date,
        clockIn,
        lunchStart,
        lunchEnd,
        clockOut,
        hoursWorked,
        lateMinutes,
        typeLabel,
        this.escapeCsvField(notes),
      ].join(';')
    })

    return this.BOM + headers + '\n' + rows.join('\n')
  }

  /**
   * Exporta folha de pagamento para CSV
   */
  async exportPayrollCSV(periodId: number): Promise<string> {
    await PayrollPeriod.findOrFail(periodId)

    const slips = await PaySlip.query()
      .where('payrollPeriodId', periodId)
      .preload('employee')
      .orderBy('employeeId', 'asc')

    const headers = [
      'Colaborador',
      'CPF/CNPJ',
      'Salario Base',
      'Total Proventos',
      'Total Descontos',
      'INSS',
      'IRRF',
      'FGTS (Patronal)',
      'Salario Liquido',
      'Status',
    ].join(';')

    const rows = slips.map((slip) => {
      const employee = slip.employee
      const cpfCnpj = employee.type === 'clt' ? employee.cpf || '-' : employee.cnpj || '-'
      const baseSalary = employee.salary ? this.formatCurrency(employee.salary) : '-'
      const totalEarnings = this.formatCurrency(toNumber(slip.totalEarnings))
      const totalDeductions = this.formatCurrency(toNumber(slip.totalDeductions))
      const inss = this.formatCurrency(toNumber(slip.inssAmount))
      const irrf = this.formatCurrency(toNumber(slip.irrfAmount))
      const fgts = this.formatCurrency(toNumber(slip.fgtsAmount))
      const netSalary = this.formatCurrency(toNumber(slip.netSalary))
      const statusLabel = this.formatPaySlipStatus(slip.status)

      return [
        this.escapeCsvField(employee.fullName),
        this.escapeCsvField(cpfCnpj),
        baseSalary,
        totalEarnings,
        totalDeductions,
        inss,
        irrf,
        fgts,
        netSalary,
        statusLabel,
      ].join(';')
    })

    return this.BOM + headers + '\n' + rows.join('\n')
  }

  /**
   * Exporta solicitacoes de ferias/licencas para CSV
   */
  async exportLeaveCSV(filters: LeaveFilters = {}): Promise<string> {
    const query = Leave.query()
      .preload('employee')
      .preload('approver')
      .orderBy('startDate', 'desc')

    if (filters.type) {
      query.where('type', filters.type)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.startDate) {
      query.where('startDate', '>=', filters.startDate)
    }
    if (filters.endDate) {
      query.where('endDate', '<=', filters.endDate)
    }

    const leaves = await query

    const headers = [
      'Colaborador',
      'Tipo',
      'Data Inicio',
      'Data Fim',
      'Dias',
      'Status',
      'Aprovado Por',
      'Data Aprovacao',
      'Observacoes',
    ].join(';')

    const rows = leaves.map((leave) => {
      const employeeName = leave.employee.fullName
      const typeLabel = this.formatLeaveType(leave.type)
      const startDate = this.formatDate(leave.startDate)
      const endDate = this.formatDate(leave.endDate)
      const days = leave.daysCount.toString()
      const statusLabel = this.formatLeaveStatus(leave.status)
      const approver = leave.approver ? leave.approver.fullName : '-'
      const approvedAt = leave.approvedAt ? this.formatDateTime(leave.approvedAt) : '-'
      const notes = leave.notes || '-'

      return [
        this.escapeCsvField(employeeName),
        typeLabel,
        startDate,
        endDate,
        days,
        statusLabel,
        this.escapeCsvField(approver),
        approvedAt,
        this.escapeCsvField(notes),
      ].join(';')
    })

    return this.BOM + headers + '\n' + rows.join('\n')
  }

  /**
   * Exporta treinamentos para CSV
   */
  async exportTrainingsCSV(filters: TrainingFilters = {}): Promise<string> {
    const query = Training.query()
      .preload('enrollments', (q) => q.preload('employee'))
      .orderBy('startDate', 'desc')

    if (filters.type) {
      query.where('type', filters.type)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.category) {
      query.whereILike('category', `%${filters.category}%`)
    }

    const trainings = await query

    const headers = [
      'Titulo',
      'Tipo',
      'Categoria',
      'Instrutor',
      'Data Inicio',
      'Data Fim',
      'Duracao (h)',
      'Inscritos',
      'Concluidos',
      'Status',
      'Obrigatorio',
    ].join(';')

    const rows = trainings.map((training) => {
      const typeLabel = this.formatTrainingType(training.type)
      const startDate = this.formatDate(training.startDate)
      const endDate = this.formatDate(training.endDate)
      const duration = training.durationHours.toString()
      const enrolled = training.enrollments.length.toString()
      const completed = training.enrollments.filter((e) => e.status === 'completed').length.toString()
      const statusLabel = this.formatTrainingStatus(training.status)
      const mandatory = training.isMandatory ? 'Sim' : 'Nao'

      return [
        this.escapeCsvField(training.title),
        typeLabel,
        this.escapeCsvField(training.category || '-'),
        this.escapeCsvField(training.instructor || '-'),
        startDate,
        endDate,
        duration,
        enrolled,
        completed,
        statusLabel,
        mandatory,
      ].join(';')
    })

    return this.BOM + headers + '\n' + rows.join('\n')
  }

  // ==========================================
  // Metodos auxiliares de formatacao
  // ==========================================

  /**
   * Formata data no padrao brasileiro DD/MM/YYYY
   */
  private formatDate(date: DateTime): string {
    return date.toFormat('dd/MM/yyyy')
  }

  /**
   * Formata data e hora no padrao brasileiro DD/MM/YYYY HH:mm
   */
  private formatDateTime(dateTime: DateTime): string {
    return dateTime.toFormat('dd/MM/yyyy HH:mm')
  }

  /**
   * Formata hora no padrao HH:mm
   */
  private formatTime(dateTime: DateTime): string {
    return dateTime.toFormat('HH:mm')
  }

  /**
   * Formata minutos para horas (ex: 480 -> 8:00)
   */
  private formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  /**
   * Formata valor monetario no padrao brasileiro
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Escapa campo CSV (adiciona aspas se necessario)
   */
  private escapeCsvField(field: string | null): string {
    if (!field) return '-'
    if (field.includes(';') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }

  /**
   * Formata status do colaborador
   */
  private formatStatus(status: string): string {
    const map: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      terminated: 'Desligado',
    }
    return map[status] || status
  }

  /**
   * Formata tipo de registro de ponto
   */
  private formatAttendanceType(type: string): string {
    const map: Record<string, string> = {
      regular: 'Regular',
      overtime: 'Hora Extra',
      absence: 'Ausencia',
      holiday: 'Feriado',
    }
    return map[type] || type
  }

  /**
   * Formata status do contracheque
   */
  private formatPaySlipStatus(status: string): string {
    const map: Record<string, string> = {
      draft: 'Rascunho',
      approved: 'Aprovado',
      paid: 'Pago',
    }
    return map[status] || status
  }

  /**
   * Formata tipo de licenca/ferias
   */
  private formatLeaveType(type: string): string {
    const map: Record<string, string> = {
      vacation: 'Ferias',
      medical: 'Atestado Medico',
      maternity: 'Licenca Maternidade',
      paternity: 'Licenca Paternidade',
      bereavement: 'Luto',
      wedding: 'Casamento',
      blood_donation: 'Doacao de Sangue',
      military: 'Servico Militar',
      other: 'Outro',
    }
    return map[type] || type
  }

  /**
   * Formata status de licenca/ferias
   */
  private formatLeaveStatus(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      cancelled: 'Cancelado',
      in_progress: 'Em Andamento',
      completed: 'Concluido',
    }
    return map[status] || status
  }

  /**
   * Formata tipo de treinamento
   */
  private formatTrainingType(type: string): string {
    const map: Record<string, string> = {
      online: 'Online',
      presential: 'Presencial',
      hybrid: 'Hibrido',
    }
    return map[type] || type
  }

  /**
   * Formata status de treinamento
   */
  private formatTrainingStatus(status: string): string {
    const map: Record<string, string> = {
      planned: 'Planejado',
      in_progress: 'Em Andamento',
      completed: 'Concluido',
      cancelled: 'Cancelado',
    }
    return map[status] || status
  }
}

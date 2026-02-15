import AutomatedCommunication from '#models/automated_communication'
import CommunicationLog from '#models/communication_log'
import Employee from '#models/employee'
import Document from '#models/document'
import Leave from '#models/leave'
import EmployeeChecklist from '#models/employee_checklist'
import NotificationService from '#services/notification_service'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'

interface CreateCommunicationData {
  name: string
  trigger_type:
    | 'birthday'
    | 'work_anniversary'
    | 'document_expiring'
    | 'probation_ending'
    | 'leave_returning'
    | 'onboarding_incomplete'
  trigger_days_before?: number | null
  message_template: string
  target_roles?: string[] | null
  is_active?: boolean
}

export default class AutoCommunicationService {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  /**
   * Lista comunicacoes automatizadas
   */
  async list(filters: { is_active?: boolean } = {}) {
    const query = AutomatedCommunication.query().orderBy('name', 'asc')

    if (filters.is_active !== undefined) {
      query.where('isActive', filters.is_active)
    }

    return await query
  }

  /**
   * Cria nova comunicacao automatizada
   */
  async create(data: CreateCommunicationData, userId?: number) {
    const communication = await AutomatedCommunication.create({
      name: data.name,
      triggerType: data.trigger_type,
      triggerDaysBefore: data.trigger_days_before || 0,
      messageTemplate: data.message_template,
      targetRoles: data.target_roles || null,
      isActive: data.is_active !== undefined ? data.is_active : true,
      createdBy: userId || null,
    })

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'create',
      resourceType: 'automated_communication',
      resourceId: communication.id,
      description: `Comunicacao automatizada criada: ${communication.name}`,
      newValues: {
        name: communication.name,
        triggerType: communication.triggerType,
      },
    })

    return communication
  }

  /**
   * Atualiza comunicacao
   */
  async update(id: number, data: Partial<CreateCommunicationData>, userId?: number) {
    const communication = await AutomatedCommunication.findOrFail(id)

    const updateData: Record<string, any> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.trigger_type !== undefined) updateData.triggerType = data.trigger_type
    if (data.trigger_days_before !== undefined)
      updateData.triggerDaysBefore = data.trigger_days_before
    if (data.message_template !== undefined) updateData.messageTemplate = data.message_template
    if (data.target_roles !== undefined) updateData.targetRoles = data.target_roles
    if (data.is_active !== undefined) updateData.isActive = data.is_active

    communication.merge(updateData)
    await communication.save()

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'automated_communication',
      resourceId: communication.id,
      description: `Comunicacao automatizada atualizada: ${communication.name}`,
      newValues: updateData,
    })

    return communication
  }

  /**
   * Deleta comunicacao
   */
  async delete(id: number, userId?: number) {
    const communication = await AutomatedCommunication.findOrFail(id)
    const name = communication.name

    await communication.delete()

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'delete',
      resourceType: 'automated_communication',
      resourceId: id,
      description: `Comunicacao automatizada deletada: ${name}`,
    })
  }

  /**
   * Ativa/desativa comunicacao
   */
  async toggle(id: number, userId?: number) {
    const communication = await AutomatedCommunication.findOrFail(id)
    communication.isActive = !communication.isActive
    await communication.save()

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'automated_communication',
      resourceId: communication.id,
      description: `Comunicacao ${communication.isActive ? 'ativada' : 'desativada'}: ${communication.name}`,
      newValues: { isActive: communication.isActive },
    })

    return communication
  }

  /**
   * Executa comunicacoes ativas (ou uma especifica)
   */
  async execute(communicationId?: number, userId?: number) {
    let communications: AutomatedCommunication[]

    if (communicationId) {
      const comm = await AutomatedCommunication.findOrFail(communicationId)
      communications = [comm]
    } else {
      communications = await AutomatedCommunication.query().where('isActive', true)
    }

    const results = []

    for (const comm of communications) {
      try {
        const sent = await this.executeOne(comm, userId)
        results.push({ communicationId: comm.id, name: comm.name, sent, success: true })
      } catch (error) {
        results.push({ communicationId: comm.id, name: comm.name, error: error.message, success: false })
      }
    }

    return results
  }

  /**
   * Executa uma comunicacao especifica
   */
  private async executeOne(communication: AutomatedCommunication, userId?: number) {
    const today = DateTime.now()
    const targetDate = today.plus({ days: communication.triggerDaysBefore })

    let employees: Employee[] = []

    switch (communication.triggerType) {
      case 'birthday':
        employees = await this.findBirthdayEmployees(targetDate)
        break
      case 'work_anniversary':
        employees = await this.findAnniversaryEmployees(targetDate)
        break
      case 'document_expiring':
        employees = await this.findDocumentExpiringEmployees(targetDate)
        break
      case 'probation_ending':
        employees = await this.findProbationEndingEmployees(targetDate)
        break
      case 'leave_returning':
        employees = await this.findLeaveReturningEmployees(targetDate)
        break
      case 'onboarding_incomplete':
        employees = await this.findOnboardingIncompleteEmployees()
        break
    }

    let sentCount = 0

    for (const employee of employees) {
      // Filtra por role se especificado
      if (communication.targetRoles && communication.targetRoles.length > 0) {
        await employee.load('user')
        if (!employee.user || !communication.targetRoles.includes(employee.user.role)) {
          continue
        }
      }

      const message = this.processTemplate(communication.messageTemplate, employee)

      // Envia notificacao
      if (employee.userId) {
        await this.notificationService.create(employee.userId, {
          type: 'general',
          title: communication.name,
          message,
          metadata: { communicationId: communication.id },
        })

        // Registra log
        await CommunicationLog.create({
          communicationId: communication.id,
          employeeId: employee.id,
          userId: employee.userId,
          message,
          sentAt: DateTime.now(),
          status: 'sent',
        })

        sentCount++
      }
    }

    // Atualiza lastExecutedAt
    communication.lastExecutedAt = DateTime.now()
    await communication.save()

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'process',
      resourceType: 'automated_communication',
      resourceId: communication.id,
      description: `Comunicacao executada: ${communication.name} - ${sentCount} envios`,
      newValues: { sentCount },
    })

    return sentCount
  }

  /**
   * Encontra colaboradores com aniversario na data alvo
   */
  private async findBirthdayEmployees(targetDate: DateTime): Promise<Employee[]> {
    const month = targetDate.month
    const day = targetDate.day

    const employees = await Employee.query()
      .where('status', 'active')
      .whereNotNull('birthDate')
      .whereRaw('EXTRACT(MONTH FROM birth_date) = ?', [month])
      .whereRaw('EXTRACT(DAY FROM birth_date) = ?', [day])

    return employees
  }

  /**
   * Encontra colaboradores com aniversario de empresa na data alvo
   */
  private async findAnniversaryEmployees(targetDate: DateTime): Promise<Employee[]> {
    const month = targetDate.month
    const day = targetDate.day

    const employees = await Employee.query()
      .where('status', 'active')
      .whereRaw('EXTRACT(MONTH FROM hire_date) = ?', [month])
      .whereRaw('EXTRACT(DAY FROM hire_date) = ?', [day])

    return employees
  }

  /**
   * Encontra colaboradores com documentos expirando
   */
  private async findDocumentExpiringEmployees(targetDate: DateTime): Promise<Employee[]> {
    const documents = await Document.query()
      .whereNotNull('expiryDate')
      .where('expiryDate', '=', targetDate.toSQLDate()!)
      .preload('employee')

    const employees = documents.map((doc) => doc.employee).filter((emp) => emp.status === 'active')
    return employees
  }

  /**
   * Encontra colaboradores com fim de experiencia proximo
   */
  private async findProbationEndingEmployees(targetDate: DateTime): Promise<Employee[]> {
    const employees = await Employee.query()
      .where('status', 'active')
      .where('type', 'clt')

    // Filtra os que estao com 90 dias de contratacao na data alvo
    return employees.filter((emp) => {
      const probationEnd = emp.hireDate.plus({ days: 90 })
      return probationEnd.hasSame(targetDate, 'day')
    })
  }

  /**
   * Encontra colaboradores retornando de ferias/licenca
   */
  private async findLeaveReturningEmployees(targetDate: DateTime): Promise<Employee[]> {
    const leaves = await Leave.query()
      .where('status', 'approved')
      .where('endDate', '=', targetDate.toSQLDate()!)
      .preload('employee')

    return leaves.map((leave) => leave.employee)
  }

  /**
   * Encontra colaboradores com onboarding incompleto
   */
  private async findOnboardingIncompleteEmployees(): Promise<Employee[]> {
    const checklists = await EmployeeChecklist.query()
      .whereNot('status', 'completed')
      .preload('employee')

    return checklists
      .map((checklist) => checklist.employee)
      .filter((emp) => emp.status === 'active')
  }

  /**
   * Processa template substituindo variaveis
   */
  processTemplate(template: string, employee: Employee): string {
    let message = template

    message = message.replace(/\{\{name\}\}/g, employee.fullName.split(' ')[0])
    message = message.replace(/\{\{full_name\}\}/g, employee.fullName)
    message = message.replace(/\{\{email\}\}/g, employee.email)

    if (employee.birthDate) {
      message = message.replace(/\{\{birth_date\}\}/g, employee.birthDate.toFormat('dd/MM'))
    }

    if (employee.hireDate) {
      message = message.replace(/\{\{hire_date\}\}/g, employee.hireDate.toFormat('dd/MM/yyyy'))
      const years = DateTime.now().diff(employee.hireDate, 'years').years
      message = message.replace(/\{\{tenure_years\}\}/g, Math.floor(years).toString())
    }

    return message
  }

  /**
   * Retorna historico de envios
   */
  async getLog(communicationId: number, page: number = 1, limit: number = 20) {
    const query = CommunicationLog.query()
      .where('communicationId', communicationId)
      .preload('employee')
      .preload('user')
      .orderBy('sent_at', 'desc')

    const result = await query.paginate(page, limit)
    return result
  }
}

import DataChangeRequest from '#models/data_change_request'
import Employee from '#models/employee'
import AuditLogService from '#services/audit_log_service'
import EmployeeHistoryService from '#services/employee_history_service'
import { DateTime } from 'luxon'

interface CreateRequestData {
  employeeId: number
  requestedBy: number
  fieldName: string
  newValue: string
  reason?: string | null
}

interface ListFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'approved' | 'rejected'
  employeeId?: number
}

const ALLOWED_FIELDS = [
  'phone',
  'email',
  'addressStreet',
  'addressNumber',
  'addressComplement',
  'addressNeighborhood',
  'addressCity',
  'addressState',
  'addressZip',
]

export default class DataChangeRequestService {
  private historyService: EmployeeHistoryService

  constructor() {
    this.historyService = new EmployeeHistoryService()
  }

  async create(data: CreateRequestData) {
    // Valida se o campo eh editavel
    if (!ALLOWED_FIELDS.includes(data.fieldName)) {
      throw new Error(`Campo ${data.fieldName} nao pode ser editado via self-service`)
    }

    const employee = await Employee.findOrFail(data.employeeId)

    // Pega o valor atual do campo
    const oldValue = (employee as any)[data.fieldName] || null

    const request = await DataChangeRequest.create({
      employeeId: data.employeeId,
      requestedBy: data.requestedBy,
      fieldName: data.fieldName,
      oldValue,
      newValue: data.newValue,
      reason: data.reason || null,
      status: 'pending',
    })

    await request.load('employee')
    await request.load('requestor')

    return request
  }

  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = DataChangeRequest.query()
      .preload('employee', (empQuery) => {
        empQuery.preload('department')
      })
      .preload('requestor')
      .preload('reviewer')
      .orderBy('created_at', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.employeeId) {
      query.where('employee_id', filters.employeeId)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async findById(id: number) {
    const request = await DataChangeRequest.query()
      .where('id', id)
      .preload('employee')
      .preload('requestor')
      .preload('reviewer')
      .firstOrFail()

    return request
  }

  async approve(id: number, reviewedBy: number, reviewNotes?: string) {
    const request = await DataChangeRequest.findOrFail(id)

    if (request.status !== 'pending') {
      throw new Error('Apenas solicitacoes pendentes podem ser aprovadas')
    }

    const employee = await Employee.findOrFail(request.employeeId)

    // Aplica a mudanca no employee
    const fieldName = request.fieldName
    const oldValue = (employee as any)[fieldName]
    ;(employee as any)[fieldName] = request.newValue
    await employee.save()

    // Atualiza a solicitacao
    request.status = 'approved'
    request.reviewedBy = reviewedBy
    request.reviewedAt = DateTime.now()
    request.reviewNotes = reviewNotes || null
    await request.save()

    await request.load('employee')
    await request.load('requestor')
    await request.load('reviewer')

    // Registra no historico do colaborador
    await this.historyService.create(employee.id, {
      type: 'other',
      title: `Alteração de ${this.getFieldLabel(fieldName)}`,
      description: `Campo ${this.getFieldLabel(fieldName)} alterado de "${oldValue || 'N/A'}" para "${request.newValue}"`,
      oldValue: oldValue,
      newValue: request.newValue,
      eventDate: DateTime.now().toISODate()!,
      createdBy: reviewedBy,
    })

    // Registra no audit log
    await AuditLogService.log({
      userId: reviewedBy,
      action: 'approve',
      resourceType: 'data_change_request',
      resourceId: request.id,
      description: `Solicitação de alteração de dados aprovada para colaborador ${employee.fullName}`,
      oldValues: { [fieldName]: oldValue },
      newValues: { [fieldName]: request.newValue },
    })

    return request
  }

  async reject(id: number, reviewedBy: number, reviewNotes?: string) {
    const request = await DataChangeRequest.findOrFail(id)

    if (request.status !== 'pending') {
      throw new Error('Apenas solicitacoes pendentes podem ser rejeitadas')
    }

    request.status = 'rejected'
    request.reviewedBy = reviewedBy
    request.reviewedAt = DateTime.now()
    request.reviewNotes = reviewNotes || null
    await request.save()

    await request.load('employee')
    await request.load('requestor')
    await request.load('reviewer')

    // Registra no audit log
    await AuditLogService.log({
      userId: reviewedBy,
      action: 'reject',
      resourceType: 'data_change_request',
      resourceId: request.id,
      description: `Solicitação de alteração de dados rejeitada para colaborador ${request.employee.fullName}`,
    })

    return request
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      phone: 'Telefone',
      email: 'E-mail',
      addressStreet: 'Rua',
      addressNumber: 'Número',
      addressComplement: 'Complemento',
      addressNeighborhood: 'Bairro',
      addressCity: 'Cidade',
      addressState: 'Estado',
      addressZip: 'CEP',
    }
    return labels[fieldName] || fieldName
  }
}

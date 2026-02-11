import EmployeeHistory from '#models/employee_history'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  type?: string
  startDate?: string
  endDate?: string
}

interface CreateHistoryData {
  type:
    | 'hire'
    | 'promotion'
    | 'transfer'
    | 'salary_change'
    | 'warning'
    | 'note'
    | 'termination'
    | 'document'
    | 'other'
  title: string
  description?: string | null
  oldValue?: string | null
  newValue?: string | null
  eventDate: string
  createdBy?: number | null
}

export default class EmployeeHistoryService {
  async list(employeeId: number, filters: ListFilters = {}) {
    await Employee.findOrFail(employeeId)

    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = EmployeeHistory.query()
      .where('employeeId', employeeId)
      .preload('creator')
      .orderBy('eventDate', 'desc')
      .orderBy('createdAt', 'desc')

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.startDate) {
      query.where('eventDate', '>=', filters.startDate)
    }

    if (filters.endDate) {
      query.where('eventDate', '<=', filters.endDate)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async create(employeeId: number, data: CreateHistoryData) {
    await Employee.findOrFail(employeeId)

    const history = await EmployeeHistory.create({
      employeeId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      oldValue: data.oldValue || null,
      newValue: data.newValue || null,
      createdBy: data.createdBy || null,
      eventDate: DateTime.fromISO(data.eventDate),
    })

    await history.load('creator')
    return history
  }

  async recordHire(employeeId: number, employeeName: string, hireDate: string, userId?: number) {
    return this.create(employeeId, {
      type: 'hire',
      title: `Admissao de ${employeeName}`,
      description: 'Colaborador admitido na empresa',
      eventDate: hireDate,
      createdBy: userId,
    })
  }

  async recordSalaryChange(
    employeeId: number,
    oldSalary: number | null,
    newSalary: number | null,
    userId?: number
  ) {
    return this.create(employeeId, {
      type: 'salary_change',
      title: 'Alteracao de salario',
      oldValue: oldSalary !== null ? String(oldSalary) : null,
      newValue: newSalary !== null ? String(newSalary) : null,
      eventDate: DateTime.now().toISODate()!,
      createdBy: userId,
    })
  }

  async recordTransfer(
    employeeId: number,
    oldDepartment: string | null,
    newDepartment: string | null,
    userId?: number
  ) {
    return this.create(employeeId, {
      type: 'transfer',
      title: 'Transferencia de departamento',
      oldValue: oldDepartment,
      newValue: newDepartment,
      eventDate: DateTime.now().toISODate()!,
      createdBy: userId,
    })
  }

  async recordDocument(employeeId: number, documentTitle: string, userId?: number) {
    return this.create(employeeId, {
      type: 'document',
      title: `Documento adicionado: ${documentTitle}`,
      eventDate: DateTime.now().toISODate()!,
      createdBy: userId,
    })
  }
}

import Employee from '#models/employee'
import Department from '#models/department'
import EmployeeHistoryService from '#services/employee_history_service'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  search?: string
  type?: 'clt' | 'pj'
  status?: 'active' | 'inactive' | 'terminated'
  departmentId?: number
}

interface CreateEmployeeData {
  userId?: number | null
  registrationNumber?: string | null
  fullName: string
  cpf?: string | null
  cnpj?: string | null
  rg?: string | null
  email: string
  phone?: string | null
  type?: 'clt' | 'pj'
  departmentId?: number | null
  positionId?: number | null
  hireDate: string
  terminationDate?: string | null
  salary?: number | null
  status?: 'active' | 'inactive' | 'terminated'
  birthDate?: string | null
  addressStreet?: string | null
  addressNumber?: string | null
  addressComplement?: string | null
  addressNeighborhood?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressZip?: string | null
  notes?: string | null
}

export default class EmployeeService {
  private historyService: EmployeeHistoryService

  constructor() {
    this.historyService = new EmployeeHistoryService()
  }

  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Employee.query()
      .preload('department')
      .preload('position')
      .orderBy('fullName', 'asc')

    if (filters.search) {
      const search = `%${filters.search}%`
      query.where((q) => {
        q.whereILike('fullName', search)
          .orWhereILike('email', search)
          .orWhereILike('registrationNumber', search)
          .orWhereILike('cpf', search)
      })
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.departmentId) {
      query.where('departmentId', filters.departmentId)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async findById(id: number) {
    const employee = await Employee.query()
      .where('id', id)
      .preload('department')
      .preload('position')
      .preload('user')
      .firstOrFail()
    return employee
  }

  async create(data: CreateEmployeeData, currentUserId?: number) {
    const employee = await Employee.create({
      ...data,
      hireDate: DateTime.fromISO(data.hireDate),
      terminationDate: data.terminationDate ? DateTime.fromISO(data.terminationDate) : null,
      birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : null,
      type: data.type || 'clt',
      status: data.status || 'active',
    })

    await employee.load('department')
    await employee.load('position')

    await this.historyService.recordHire(
      employee.id,
      employee.fullName,
      data.hireDate,
      currentUserId
    )

    return employee
  }

  async update(id: number, data: Partial<CreateEmployeeData>, currentUserId?: number) {
    const employee = await Employee.findOrFail(id)

    const oldSalary = employee.salary
    const oldDepartmentId = employee.departmentId

    const updateData: Record<string, unknown> = { ...data }

    if (data.hireDate) {
      updateData.hireDate = DateTime.fromISO(data.hireDate)
    }
    if (data.terminationDate !== undefined) {
      updateData.terminationDate = data.terminationDate
        ? DateTime.fromISO(data.terminationDate)
        : null
    }
    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate ? DateTime.fromISO(data.birthDate) : null
    }

    employee.merge(updateData as Record<string, unknown> & Partial<Employee>)
    await employee.save()

    if (data.salary !== undefined && data.salary !== oldSalary) {
      await this.historyService.recordSalaryChange(
        employee.id,
        oldSalary,
        data.salary ?? null,
        currentUserId
      )
    }

    if (data.departmentId !== undefined && data.departmentId !== oldDepartmentId) {
      let oldDeptName: string | null = null
      let newDeptName: string | null = null

      if (oldDepartmentId) {
        const oldDept = await Department.find(oldDepartmentId)
        oldDeptName = oldDept?.name || null
      }
      if (data.departmentId) {
        const newDept = await Department.find(data.departmentId)
        newDeptName = newDept?.name || null
      }

      await this.historyService.recordTransfer(
        employee.id,
        oldDeptName,
        newDeptName,
        currentUserId
      )
    }

    await employee.load('department')
    await employee.load('position')
    return employee
  }

  async delete(id: number) {
    const employee = await Employee.findOrFail(id)
    employee.status = 'terminated'
    employee.terminationDate = DateTime.now()
    await employee.save()
    return employee
  }
}

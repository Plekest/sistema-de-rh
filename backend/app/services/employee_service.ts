import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import EmployeeHistoryService from '#services/employee_history_service'
import { generateRandomPassword } from '#utils/password_generator'
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
    // Se nao foi informado um userId, cria automaticamente um usuario para o colaborador
    let userId = data.userId || null
    if (!userId) {
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        userId = existingUser.id
      } else {
        const randomPassword = generateRandomPassword()
        const newUser = await User.create({
          fullName: data.fullName,
          email: data.email,
          password: randomPassword,
          role: 'employee',
          isActive: true,
        })
        userId = newUser.id
      }
    }

    const employee = await Employee.create({
      ...data,
      userId,
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
    const oldStatus = employee.status
    const oldPositionId = employee.positionId

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

    // Registra mudanca de status
    if (data.status !== undefined && data.status !== oldStatus) {
      await this.historyService.recordStatusChange(
        employee.id,
        oldStatus,
        data.status,
        currentUserId
      )
    }

    // Registra mudanca de cargo
    if (data.positionId !== undefined && data.positionId !== oldPositionId) {
      let oldPosTitle: string | null = null
      let newPosTitle: string | null = null

      if (oldPositionId) {
        const { default: Position } = await import('#models/position')
        const oldPos = await Position.find(oldPositionId)
        oldPosTitle = oldPos?.title || null
      }
      if (data.positionId) {
        const { default: Position } = await import('#models/position')
        const newPos = await Position.find(data.positionId)
        newPosTitle = newPos?.title || null
      }

      await this.historyService.create(employee.id, {
        type: 'promotion',
        title: 'Alteracao de cargo',
        oldValue: oldPosTitle,
        newValue: newPosTitle,
        eventDate: DateTime.now().toISODate()!,
        createdBy: currentUserId,
      })
    }

    await employee.load('department')
    await employee.load('position')
    return employee
  }

  async delete(id: number, currentUserId?: number) {
    const employee = await Employee.findOrFail(id)
    const oldStatus = employee.status
    employee.status = 'terminated'
    employee.terminationDate = DateTime.now()
    await employee.save()

    await this.historyService.recordStatusChange(
      employee.id,
      oldStatus,
      'terminated',
      currentUserId
    ).catch(() => {})

    return employee
  }
}

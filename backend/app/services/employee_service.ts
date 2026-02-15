import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import PayrollComponent from '#models/payroll_component'
import EmployeeHistoryService from '#services/employee_history_service'
import NotificationService from '#services/notification_service'
import AuditLogService from '#services/audit_log_service'
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
  private notificationService: NotificationService

  constructor() {
    this.historyService = new EmployeeHistoryService()
    this.notificationService = new NotificationService()
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
    // Valida unicidade de CPF e CNPJ
    await this.validateUniqueCpfCnpj(data.cpf, data.cnpj)

    // Se nao foi informado um userId, cria automaticamente um usuario para o colaborador
    let userId = data.userId || null
    let temporaryPassword: string | null = null

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
        temporaryPassword = randomPassword
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

    // Auto-gerar componente base_salary (B1.10)
    if (data.salary && data.salary > 0) {
      await this.ensureBaseSalaryComponent(employee.id, data.salary, data.hireDate)
    }

    await this.historyService.recordHire(
      employee.id,
      employee.fullName,
      data.hireDate,
      currentUserId
    )

    // Registra no audit log
    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'employee',
      resourceId: employee.id,
      description: `Colaborador ${employee.fullName} cadastrado no sistema`,
      newValues: {
        fullName: employee.fullName,
        email: employee.email,
        type: employee.type,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
      },
    })

    return { employee, temporaryPassword }
  }

  async update(id: number, data: Partial<CreateEmployeeData>, currentUserId?: number) {
    const employee = await Employee.findOrFail(id)

    // Valida unicidade de CPF e CNPJ (excluindo o registro atual)
    await this.validateUniqueCpfCnpj(data.cpf, data.cnpj, id)

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

      // Atualiza componente base_salary (B1.10)
      if (data.salary && data.salary > 0) {
        await this.ensureBaseSalaryComponent(employee.id, data.salary)
      }

      // Envia notificacao para o colaborador (se tiver usuario vinculado)
      if (employee.userId && data.salary) {
        const oldSalaryFormatted = oldSalary
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              oldSalary
            )
          : 'N/A'
        const newSalaryFormatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(data.salary)

        await this.notificationService
          .create(employee.userId, {
            type: 'salary_changed',
            title: 'Alteração Salarial',
            message: `Seu salário foi alterado de ${oldSalaryFormatted} para ${newSalaryFormatted}.`,
            metadata: {
              employeeId: employee.id,
              oldSalary: oldSalary,
              newSalary: data.salary,
            },
          })
          .catch(() => {})
      }
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

      // Desativa User associado ao mudar para 'terminated'
      if (data.status === 'terminated' && employee.userId) {
        const user = await User.find(employee.userId)
        if (user) {
          user.isActive = false
          await user.save()
        }
      }
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

    // Registra no audit log
    const changedFields: Record<string, any> = {}
    if (data.fullName !== undefined) changedFields.fullName = data.fullName
    if (data.email !== undefined) changedFields.email = data.email
    if (data.departmentId !== undefined) changedFields.departmentId = data.departmentId
    if (data.positionId !== undefined) changedFields.positionId = data.positionId
    if (data.salary !== undefined) changedFields.salary = data.salary
    if (data.status !== undefined) changedFields.status = data.status

    if (Object.keys(changedFields).length > 0) {
      await AuditLogService.log({
        userId: currentUserId,
        action: 'update',
        resourceType: 'employee',
        resourceId: employee.id,
        description: `Colaborador ${employee.fullName} atualizado`,
        newValues: changedFields,
      })
    }

    return employee
  }

  /**
   * Cria ou atualiza o componente base_salary do colaborador.
   * Ao criar employee com salary, auto-gera o componente.
   * Ao atualizar salary, atualiza o componente existente.
   */
  private async ensureBaseSalaryComponent(employeeId: number, salary: number, effectiveFrom?: string) {
    const existing = await PayrollComponent.query()
      .where('employeeId', employeeId)
      .where('type', 'base_salary')
      .where('isActive', true)
      .first()

    if (existing) {
      existing.amount = salary
      await existing.save()
    } else {
      await PayrollComponent.create({
        employeeId,
        type: 'base_salary',
        description: 'Salario Base',
        amount: salary,
        isActive: true,
        effectiveFrom: effectiveFrom
          ? DateTime.fromISO(effectiveFrom)
          : DateTime.now(),
        effectiveUntil: null,
      })
    }
  }

  /**
   * Valida que CPF e CNPJ sao unicos na tabela de colaboradores.
   * Ignora valores nulos/vazios e exclui o proprio registro em caso de update.
   */
  private async validateUniqueCpfCnpj(
    cpf?: string | null,
    cnpj?: string | null,
    excludeId?: number
  ) {
    if (cpf) {
      const normalizedCpf = cpf.replace(/\D/g, '')
      const existingByCpf = await Employee.query()
        .where((query) => {
          query.where('cpf', cpf).orWhere('cpf', normalizedCpf)
        })
        .if(excludeId, (query) => query.whereNot('id', excludeId!))
        .first()

      if (existingByCpf) {
        throw new Error('Ja existe um colaborador cadastrado com este CPF')
      }
    }

    if (cnpj) {
      const normalizedCnpj = cnpj.replace(/\D/g, '')
      const existingByCnpj = await Employee.query()
        .where((query) => {
          query.where('cnpj', cnpj).orWhere('cnpj', normalizedCnpj)
        })
        .if(excludeId, (query) => query.whereNot('id', excludeId!))
        .first()

      if (existingByCnpj) {
        throw new Error('Ja existe um colaborador cadastrado com este CNPJ')
      }
    }
  }

  async delete(id: number, currentUserId?: number) {
    const employee = await Employee.findOrFail(id)
    const oldStatus = employee.status
    employee.status = 'terminated'
    employee.terminationDate = DateTime.now()
    await employee.save()

    // Desativa o User associado para impedir login de ex-colaboradores
    if (employee.userId) {
      const user = await User.find(employee.userId)
      if (user) {
        user.isActive = false
        await user.save()
      }
    }

    await this.historyService.recordStatusChange(
      employee.id,
      oldStatus,
      'terminated',
      currentUserId
    ).catch(() => {})

    // Registra no audit log
    await AuditLogService.log({
      userId: currentUserId,
      action: 'delete',
      resourceType: 'employee',
      resourceId: employee.id,
      description: `Colaborador ${employee.fullName} desligado`,
      oldValues: { status: oldStatus },
      newValues: { status: 'terminated' },
    })

    return employee
  }
}

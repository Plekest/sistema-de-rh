import TurnoverRecord from '#models/turnover_record'
import Employee from '#models/employee'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

interface RecordTurnoverData {
  employee_id: number
  type: 'voluntary' | 'involuntary' | 'retirement' | 'end_of_contract'
  reason?: string | null
  exit_date: DateTime
  exit_interview_done?: boolean
  exit_interview_notes?: string | null
}

interface ListFilters {
  page?: number
  limit?: number
  type?: 'voluntary' | 'involuntary' | 'retirement' | 'end_of_contract'
  department_id?: number
  from?: DateTime
  to?: DateTime
}

export default class TurnoverService {
  /**
   * Registra um desligamento
   */
  async record(data: RecordTurnoverData, userId?: number) {
    const validTypes = ['voluntary', 'involuntary', 'retirement', 'end_of_contract']
    if (!validTypes.includes(data.type)) {
      throw new Error(`Tipo de desligamento inválido: ${data.type}`)
    }

    const employee = await Employee.query()
      .where('id', data.employee_id)
      .preload('department')
      .preload('position')
      .firstOrFail()

    // Calcula tenure em meses
    const hireDate = employee.hireDate
    const exitDate = data.exit_date
    const tenureMonths = Math.floor(exitDate.diff(hireDate, 'months').months)

    const record = await TurnoverRecord.create({
      employeeId: data.employee_id,
      type: data.type,
      reason: data.reason || null,
      exitDate: data.exit_date,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      tenureMonths,
      salaryAtExit: employee.salary,
      exitInterviewDone: data.exit_interview_done || false,
      exitInterviewNotes: data.exit_interview_notes || null,
    })

    await record.load('employee')
    await record.load('department')
    await record.load('position')

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'create',
      resourceType: 'turnover_record',
      resourceId: record.id,
      description: `Desligamento registrado: ${employee.fullName} - ${data.type}`,
      newValues: {
        employeeId: data.employee_id,
        type: data.type,
        exitDate: data.exit_date.toISODate(),
      },
    })

    return record
  }

  /**
   * Lista registros de turnover com filtros
   */
  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = TurnoverRecord.query()
      .preload('employee')
      .preload('department')
      .preload('position')
      .orderBy('exit_date', 'desc')

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.department_id) {
      query.where('departmentId', filters.department_id)
    }

    if (filters.from) {
      query.where('exitDate', '>=', filters.from.toSQLDate()!)
    }

    if (filters.to) {
      query.where('exitDate', '<=', filters.to.toSQLDate()!)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  /**
   * Calcula taxa de turnover para um periodo
   * Formula: (desligamentos no periodo / media de ativos) * 100
   */
  async getTurnoverRate(
    period: { from: DateTime; to: DateTime },
    departmentId?: number
  ): Promise<number> {
    let query = TurnoverRecord.query().whereBetween('exitDate', [
      period.from.toSQLDate()!,
      period.to.toSQLDate()!,
    ])

    if (departmentId) {
      query = query.where('departmentId', departmentId)
    }

    const turnoverCount = await query.count('* as total')
    const totalTurnovers = Number(turnoverCount[0].$extras.total)

    // Calcula media de colaboradores ativos no periodo
    let employeeQuery = Employee.query().where('status', 'active')
    if (departmentId) {
      employeeQuery = employeeQuery.where('departmentId', departmentId)
    }

    const activeEmployees = await employeeQuery.count('* as total')
    const avgActive = Number(activeEmployees[0].$extras.total)

    if (avgActive === 0) return 0

    return Math.round((totalTurnovers / avgActive) * 100 * 100) / 100 // 2 casas decimais
  }

  /**
   * Retorna taxa de turnover por departamento
   */
  async getTurnoverByDepartment(year: number) {
    const startDate = DateTime.fromObject({ year, month: 1, day: 1 })
    const endDate = DateTime.fromObject({ year, month: 12, day: 31 })

    const results = await db
      .from('turnover_records')
      .select('department_id')
      .join('departments', 'departments.id', 'turnover_records.department_id')
      .select('departments.name as department_name')
      .whereBetween('exit_date', [startDate.toSQLDate()!, endDate.toSQLDate()!])
      .groupBy('department_id', 'departments.name')
      .count('* as total')
      .orderBy('total', 'desc')

    return results.map((r) => ({
      departmentId: r.department_id,
      departmentName: r.department_name,
      count: Number(r.total),
    }))
  }

  /**
   * Agrupa turnover por motivo/tipo
   */
  async getTurnoverByReason(period: { from: DateTime; to: DateTime }) {
    const results = await TurnoverRecord.query()
      .select('type')
      .whereBetween('exitDate', [period.from.toSQLDate()!, period.to.toSQLDate()!])
      .groupBy('type')
      .count('* as total')
      .orderBy('total', 'desc')

    return results.map((r) => ({
      type: r.type,
      count: Number(r.$extras.total),
    }))
  }

  /**
   * Retorna tendencia de turnover mes a mes
   */
  async getTurnoverTrend(months: number = 12) {
    const endDate = DateTime.now()
    const startDate = endDate.minus({ months })

    const results = await db.rawQuery(
      `
      SELECT
        EXTRACT(YEAR FROM exit_date) as year,
        EXTRACT(MONTH FROM exit_date) as month,
        COUNT(*) as total
      FROM turnover_records
      WHERE exit_date >= ? AND exit_date <= ?
      GROUP BY EXTRACT(YEAR FROM exit_date), EXTRACT(MONTH FROM exit_date)
      ORDER BY year, month
    `,
      [startDate.toSQLDate(), endDate.toSQLDate()]
    )

    return results.rows.map((r: any) => ({
      year: Number(r.year),
      month: Number(r.month),
      count: Number(r.total),
    }))
  }

  /**
   * Retorna tempo medio de casa dos desligados
   */
  async getAverageTenure(departmentId?: number) {
    let query = TurnoverRecord.query()

    if (departmentId) {
      query = query.where('departmentId', departmentId)
    }

    const result = await query.avg('tenure_months as avg_tenure').first()

    const avgMonths = result?.$extras.avg_tenure ? Number(result.$extras.avg_tenure) : null

    return {
      averageTenureMonths: avgMonths ? Math.round(avgMonths) : null,
      averageTenureYears: avgMonths ? Math.round((avgMonths / 12) * 10) / 10 : null, // 1 casa decimal
    }
  }
}

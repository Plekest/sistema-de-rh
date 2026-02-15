import { DateTime } from 'luxon'
import Leave from '#models/leave'
import Employee from '#models/employee'

interface CalendarEvent {
  type: 'leave' | 'birthday' | 'holiday'
  title: string
  date?: string
  startDate?: string
  endDate?: string
  employeeId?: number
}

export default class CalendarService {
  /**
   * Feriados nacionais brasileiros 2026
   */
  private static HOLIDAYS_2026 = [
    { date: '2026-01-01', name: 'Ano Novo' },
    { date: '2026-02-16', name: 'Carnaval' },
    { date: '2026-02-17', name: 'Carnaval' },
    { date: '2026-04-03', name: 'Sexta-feira Santa' },
    { date: '2026-04-21', name: 'Tiradentes' },
    { date: '2026-05-01', name: 'Dia do Trabalho' },
    { date: '2026-06-04', name: 'Corpus Christi' },
    { date: '2026-09-07', name: 'Independência do Brasil' },
    { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
    { date: '2026-11-02', name: 'Finados' },
    { date: '2026-11-15', name: 'Proclamação da República' },
    { date: '2026-12-25', name: 'Natal' },
  ]

  async getMonthCalendar(month: number, year: number, departmentId?: number) {
    const events: CalendarEvent[] = []

    // Calcula inicio e fim do mes
    const startOfMonth = DateTime.fromObject({ year, month, day: 1 }).startOf('day')
    const endOfMonth = startOfMonth.endOf('month')

    // 1. Buscar férias aprovadas do mês
    const leavesQuery = Leave.query()
      .whereIn('status', ['approved', 'in_progress'])
      .where((q) => {
        q.whereBetween('start_date', [startOfMonth.toSQLDate()!, endOfMonth.toSQLDate()!])
          .orWhereBetween('end_date', [startOfMonth.toSQLDate()!, endOfMonth.toSQLDate()!])
          .orWhere((subq) => {
            subq
              .where('start_date', '<=', startOfMonth.toSQLDate()!)
              .where('end_date', '>=', endOfMonth.toSQLDate()!)
          })
      })
      .preload('employee', (employeeQuery) => {
        if (departmentId) {
          employeeQuery.where('department_id', departmentId)
        }
      })

    const leaves = await leavesQuery

    for (const leave of leaves) {
      // Filtra por departamento se necessario
      if (departmentId && leave.employee.departmentId !== departmentId) {
        continue
      }

      events.push({
        type: 'leave',
        title: `${leave.employee.fullName} - Férias`,
        startDate: leave.startDate.toFormat('yyyy-MM-dd'),
        endDate: leave.endDate.toFormat('yyyy-MM-dd'),
        employeeId: leave.employeeId,
      })
    }

    // 2. Buscar aniversariantes do mês
    const employeesQuery = Employee.query().where('status', 'active').whereNotNull('birth_date')

    if (departmentId) {
      employeesQuery.where('department_id', departmentId)
    }

    const employees = await employeesQuery

    for (const employee of employees) {
      if (!employee.birthDate) continue

      // Verifica se o aniversario eh neste mes
      if (employee.birthDate.month === month) {
        const birthdayThisYear = DateTime.fromObject({
          year,
          month,
          day: employee.birthDate.day,
        })

        events.push({
          type: 'birthday',
          title: `${employee.fullName} - Aniversário`,
          date: birthdayThisYear.toFormat('yyyy-MM-dd'),
          employeeId: employee.id,
        })
      }
    }

    // 3. Adicionar feriados do mês
    const holidaysInMonth = CalendarService.HOLIDAYS_2026.filter((holiday) => {
      const holidayDate = DateTime.fromISO(holiday.date)
      return holidayDate.year === year && holidayDate.month === month
    })

    for (const holiday of holidaysInMonth) {
      events.push({
        type: 'holiday',
        title: holiday.name,
        date: holiday.date,
      })
    }

    return { events }
  }
}

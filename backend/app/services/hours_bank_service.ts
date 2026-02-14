import HoursBank from '#models/hours_bank'
import TimeEntry from '#models/time_entry'
import Employee from '#models/employee'
import { toDecimal } from '#utils/number_helper'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  year?: number
}

export default class HoursBankService {
  async calculateMonth(employeeId: number, month: number, year: number) {
    const employee = await Employee.findOrFail(employeeId)

    const startDate = DateTime.fromObject({ year, month, day: 1 })
    const endDate = startDate.endOf('month')

    const entries = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', '>=', startDate.toISODate()!)
      .where('date', '<=', endDate.toISODate()!)

    const workedMinutes = entries.reduce((sum, entry) => sum + toDecimal(entry.totalWorkedMinutes), 0)

    const expectedMinutes = this.calculateExpectedMinutes(startDate, endDate, employee.type)

    const balanceMinutes = workedMinutes - expectedMinutes

    const previousBank = await HoursBank.query()
      .where('employeeId', employeeId)
      .where((q) => {
        q.where((inner) => {
          inner.where('referenceYear', '<', year)
        }).orWhere((inner) => {
          inner.where('referenceYear', year).where('referenceMonth', '<', month)
        })
      })
      .orderBy('referenceYear', 'desc')
      .orderBy('referenceMonth', 'desc')
      .first()

    const previousAccumulated = toDecimal(previousBank?.accumulatedBalanceMinutes)
    const accumulatedBalanceMinutes = previousAccumulated + balanceMinutes

    const hoursBank = await HoursBank.updateOrCreate(
      {
        employeeId,
        referenceMonth: month,
        referenceYear: year,
      },
      {
        expectedMinutes,
        workedMinutes,
        balanceMinutes,
        accumulatedBalanceMinutes,
      }
    )

    return hoursBank
  }

  async getBalance(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const latestBank = await HoursBank.query()
      .where('employeeId', employeeId)
      .orderBy('referenceYear', 'desc')
      .orderBy('referenceMonth', 'desc')
      .first()

    return {
      accumulatedBalanceMinutes: toDecimal(latestBank?.accumulatedBalanceMinutes),
      lastMonth: latestBank
        ? { month: latestBank.referenceMonth, year: latestBank.referenceYear }
        : null,
    }
  }

  async getHistory(employeeId: number, filters: ListFilters = {}) {
    await Employee.findOrFail(employeeId)

    const page = filters.page || 1
    const limit = filters.limit || 12

    const query = HoursBank.query()
      .where('employeeId', employeeId)
      .orderBy('referenceYear', 'desc')
      .orderBy('referenceMonth', 'desc')

    if (filters.year) {
      query.where('referenceYear', filters.year)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async recalculate(employeeId: number, month: number, year: number) {
    return this.calculateMonth(employeeId, month, year)
  }

  private calculateExpectedMinutes(
    startDate: DateTime,
    endDate: DateTime,
    _employeeType: 'clt' | 'pj'
  ): number {
    const minutesPerDay = 8 * 60
    let workDays = 0
    let current = startDate

    while (current <= endDate) {
      const dayOfWeek = current.weekday
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workDays++
      }
      current = current.plus({ days: 1 })
    }

    return workDays * minutesPerDay
  }
}

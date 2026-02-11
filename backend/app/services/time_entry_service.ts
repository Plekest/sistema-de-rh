import TimeEntry from '#models/time_entry'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

interface ManualEntryData {
  date: string
  clockIn?: string | null
  clockOut?: string | null
  lunchStart?: string | null
  lunchEnd?: string | null
  type?: 'regular' | 'overtime' | 'absence' | 'holiday'
  notes?: string | null
}

export default class TimeEntryService {
  async getEmployeeIdFromUser(userId: number): Promise<number> {
    const employee = await Employee.query()
      .where('userId', userId)
      .where('status', 'active')
      .first()

    if (!employee) {
      throw new Error('Nenhum colaborador ativo vinculado a este usuario')
    }

    return employee.id
  }

  async clockIn(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const today = DateTime.now().toISODate()!
    let entry = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', today)
      .first()

    if (entry && entry.clockIn) {
      throw new Error('Entrada ja registrada para hoje')
    }

    if (!entry) {
      entry = await TimeEntry.create({
        employeeId,
        date: DateTime.fromISO(today),
        clockIn: DateTime.now(),
        type: 'regular',
        totalWorkedMinutes: 0,
      })
    } else {
      entry.clockIn = DateTime.now()
      await entry.save()
    }

    return entry
  }

  async clockOut(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const today = DateTime.now().toISODate()!
    const entry = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', today)
      .first()

    if (!entry || !entry.clockIn) {
      throw new Error('Nenhuma entrada registrada para hoje')
    }

    if (entry.clockOut) {
      throw new Error('Saida ja registrada para hoje')
    }

    entry.clockOut = DateTime.now()
    entry.totalWorkedMinutes = this.calculateWorkedMinutes(entry)
    await entry.save()

    return entry
  }

  async lunchStart(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const today = DateTime.now().toISODate()!
    const entry = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', today)
      .first()

    if (!entry || !entry.clockIn) {
      throw new Error('Nenhuma entrada registrada para hoje')
    }

    if (entry.lunchStart) {
      throw new Error('Saida para almoco ja registrada para hoje')
    }

    entry.lunchStart = DateTime.now()
    await entry.save()

    return entry
  }

  async lunchEnd(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const today = DateTime.now().toISODate()!
    const entry = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', today)
      .first()

    if (!entry || !entry.lunchStart) {
      throw new Error('Nenhuma saida para almoco registrada para hoje')
    }

    if (entry.lunchEnd) {
      throw new Error('Retorno do almoco ja registrado para hoje')
    }

    entry.lunchEnd = DateTime.now()
    await entry.save()

    return entry
  }

  async getToday(employeeId: number) {
    await Employee.findOrFail(employeeId)

    const today = DateTime.now().toISODate()!
    const entry = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', today)
      .first()

    return entry
  }

  async getRecent(userId: number) {
    const employeeId = await this.getEmployeeIdFromUser(userId)

    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toISODate()!
    const entries = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', '>=', sevenDaysAgo)
      .orderBy('date', 'desc')

    return entries
  }

  async list(employeeId: number, filters: ListFilters = {}) {
    await Employee.findOrFail(employeeId)

    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = TimeEntry.query()
      .where('employeeId', employeeId)
      .orderBy('date', 'desc')

    if (filters.startDate) {
      query.where('date', '>=', filters.startDate)
    }

    if (filters.endDate) {
      query.where('date', '<=', filters.endDate)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async manualEntry(employeeId: number, data: ManualEntryData) {
    await Employee.findOrFail(employeeId)

    const existing = await TimeEntry.query()
      .where('employeeId', employeeId)
      .where('date', data.date)
      .first()

    if (existing) {
      existing.merge({
        clockIn: data.clockIn ? DateTime.fromISO(data.clockIn) : existing.clockIn,
        clockOut: data.clockOut ? DateTime.fromISO(data.clockOut) : existing.clockOut,
        lunchStart: data.lunchStart ? DateTime.fromISO(data.lunchStart) : existing.lunchStart,
        lunchEnd: data.lunchEnd ? DateTime.fromISO(data.lunchEnd) : existing.lunchEnd,
        type: data.type || existing.type,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      })
      existing.totalWorkedMinutes = this.calculateWorkedMinutes(existing)
      await existing.save()
      return existing
    }

    const entry = await TimeEntry.create({
      employeeId,
      date: DateTime.fromISO(data.date),
      clockIn: data.clockIn ? DateTime.fromISO(data.clockIn) : null,
      clockOut: data.clockOut ? DateTime.fromISO(data.clockOut) : null,
      lunchStart: data.lunchStart ? DateTime.fromISO(data.lunchStart) : null,
      lunchEnd: data.lunchEnd ? DateTime.fromISO(data.lunchEnd) : null,
      type: data.type || 'regular',
      notes: data.notes || null,
      totalWorkedMinutes: 0,
    })

    entry.totalWorkedMinutes = this.calculateWorkedMinutes(entry)
    await entry.save()

    return entry
  }

  calculateWorkedMinutes(entry: TimeEntry): number {
    if (!entry.clockIn || !entry.clockOut) {
      return 0
    }

    const clockIn = entry.clockIn
    const clockOut = entry.clockOut
    let totalMinutes = clockOut.diff(clockIn, 'minutes').minutes

    if (entry.lunchStart && entry.lunchEnd) {
      const lunchMinutes = entry.lunchEnd.diff(entry.lunchStart, 'minutes').minutes
      totalMinutes -= lunchMinutes
    }

    return Math.max(0, Math.round(totalMinutes))
  }
}

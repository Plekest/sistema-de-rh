import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RolePermission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare role: 'admin' | 'manager' | 'employee'

  @column()
  declare module:
    | 'employees'
    | 'attendance'
    | 'hours_bank'
    | 'documents'
    | 'history'
    | 'leave'
    | 'benefits'
    | 'payroll'
    | 'performance'
    | 'recruitment'
    | 'training'
    | 'calendar'
    | 'onboarding'
    | 'surveys'
    | 'orgchart'
    | 'dashboard'
    | 'skills'
    | 'career'
    | 'health'
    | 'analytics'

  @column()
  declare canAccess: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

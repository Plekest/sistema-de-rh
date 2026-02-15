export interface CalendarEvent {
  id: string
  type: 'leave' | 'birthday' | 'holiday'
  title: string
  description?: string
  date: string
  employeeName?: string
  department?: string
  startDate?: string
  endDate?: string
}

export interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

export interface CalendarParams {
  month: number
  year: number
  departmentId?: number
}

export interface TimeEntry {
  id: number
  employeeId: number
  employee?: { id: number; fullName: string }
  date: string
  clockIn?: string
  clockOut?: string
  lunchStart?: string
  lunchEnd?: string
  totalWorkedMinutes: number
  type: 'regular' | 'overtime' | 'absence' | 'holiday'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface TimeEntryFormData {
  employeeId: number
  date: string
  clockIn?: string
  clockOut?: string
  lunchStart?: string
  lunchEnd?: string
  type: 'regular' | 'overtime' | 'absence' | 'holiday'
  notes?: string
}

export interface AttendanceListParams {
  page?: number
  limit?: number
  employeeId?: number | null
  startDate?: string
  endDate?: string
}

export interface ClockAction {
  type: 'clock_in' | 'lunch_start' | 'lunch_end' | 'clock_out'
}

export interface TurnoverRate {
  period: string
  rate: number
  hires: number
  departures: number
  avgHeadcount: number
}

export interface TurnoverByDepartment {
  departmentId: number
  departmentName: string
  rate: number
  departures: number
}

export interface TurnoverByReason {
  type: string
  count: number
  percentage: number
}

export interface TurnoverRecord {
  id: number
  employeeId: number
  employeeName?: string
  type: 'voluntary' | 'involuntary' | 'retirement' | 'end_of_contract'
  reason?: string
  exitDate: string
  departmentName?: string
  positionTitle?: string
  tenureMonths?: number
  salaryAtExit?: number
  exitInterviewDone: boolean
}

export interface TurnoverTrend {
  month: string
  rate: number
  departures: number
}

export const TURNOVER_TYPE_LABELS: Record<string, string> = {
  voluntary: 'Voluntário',
  involuntary: 'Involuntário',
  retirement: 'Aposentadoria',
  end_of_contract: 'Fim de Contrato',
}

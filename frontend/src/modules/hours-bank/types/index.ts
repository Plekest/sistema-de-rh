export interface HoursBankEntry {
  id: number
  employeeId: number
  employee?: { id: number; fullName: string }
  referenceMonth: number
  referenceYear: number
  expectedMinutes: number
  workedMinutes: number
  balanceMinutes: number
  accumulatedBalanceMinutes: number
  createdAt?: string
  updatedAt?: string
}

export interface HoursBankParams {
  employeeId?: number | null
  year?: number
  page?: number
  limit?: number
}

export interface HoursBankSummary {
  currentBalance: number
  totalExpected: number
  totalWorked: number
}

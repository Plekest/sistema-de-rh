export interface TaxTable {
  id: number
  type: 'inss' | 'irrf'
  bracketMin: number
  bracketMax: number
  rate: number
  deductionValue: number
  effectiveFrom: string
  effectiveUntil: string | null
}

export interface PayrollPeriod {
  id: number
  referenceMonth: number
  referenceYear: number
  status: 'open' | 'calculating' | 'closed'
  closedBy: number | null
  closedAt: string | null
  createdAt: string
}

export interface PayrollComponent {
  id: number
  employeeId: number
  type: 'base_salary' | 'fixed_bonus' | 'hazard_pay' | 'unhealthy_pay' | 'other'
  description: string
  amount: number
  isActive: boolean
  effectiveFrom: string
  effectiveUntil: string | null
  createdAt: string
  employee?: {
    id: number
    fullName: string
  }
}

export interface PayrollEntry {
  id: number
  payrollPeriodId: number
  employeeId: number
  componentType: 'earning' | 'deduction'
  code: string
  description: string
  referenceValue: number | null
  quantity: number | null
  amount: number
  createdAt: string
}

export interface PaySlip {
  id: number
  payrollPeriodId: number
  employeeId: number
  grossSalary: number
  totalEarnings: number
  totalDeductions: number
  netSalary: number
  inssAmount: number
  irrfAmount: number
  fgtsAmount: number
  details: Record<string, any> | null
  status: 'draft' | 'final'
  createdAt: string
  employee?: {
    id: number
    fullName: string
    department?: { id: number; name: string }
    position?: { id: number; name: string }
  }
  entries?: PayrollEntry[]
}

export interface CreatePeriodData {
  referenceMonth: number
  referenceYear: number
}

export interface CreateComponentData {
  employeeId: number
  type: string
  description: string
  amount: number
  effectiveFrom: string
  effectiveUntil?: string | null
}

export interface CreateEntryData {
  payrollPeriodId: number
  employeeId: number
  componentType: 'earning' | 'deduction'
  code: string
  description: string
  referenceValue?: number | null
  quantity?: number | null
  amount: number
}

export interface PeriodFilters {
  page?: number
  limit?: number
  year?: number
  status?: string
}

export const COMPONENT_TYPE_LABELS: Record<string, string> = {
  base_salary: 'Salario Base',
  fixed_bonus: 'Adicional Fixo',
  hazard_pay: 'Periculosidade',
  unhealthy_pay: 'Insalubridade',
  other: 'Outros',
}

export const ENTRY_CODE_LABELS: Record<string, string> = {
  base_salary: 'Salario Base',
  overtime_50: 'Hora Extra 50%',
  overtime_100: 'Hora Extra 100%',
  night_shift: 'Adicional Noturno',
  bonus: 'Bonus',
  commission: 'Comissao',
  fixed_bonus: 'Adicional Fixo',
  hazard_pay: 'Periculosidade',
  unhealthy_pay: 'Insalubridade',
  inss: 'INSS',
  irrf: 'IRRF',
  fgts: 'FGTS',
  vt_discount: 'Desconto VT',
  benefit_discount: 'Desconto Beneficio',
  absence: 'Falta',
  advance: 'Adiantamento',
  other: 'Outros',
}

export const PERIOD_STATUS_LABELS: Record<string, string> = {
  open: 'Aberta',
  calculating: 'Calculando',
  closed: 'Fechada',
}

export const MONTH_LABELS: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Marco',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
}

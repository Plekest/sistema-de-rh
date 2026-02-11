import vine from '@vinejs/vine'

/**
 * Validator para criacao de periodo de folha de pagamento
 */
export const createPayrollPeriodValidator = vine.compile(
  vine.object({
    referenceMonth: vine.number().min(1).max(12),
    referenceYear: vine.number().positive(),
  })
)

/**
 * Validator para listagem de periodos de folha
 */
export const listPayrollPeriodsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    year: vine.number().positive().optional(),
    status: vine.enum(['open', 'calculating', 'closed']).optional(),
  })
)

/**
 * Validator para criacao de componente salarial
 */
export const createPayrollComponentValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
    type: vine.enum(['base_salary', 'fixed_bonus', 'hazard_pay', 'unhealthy_pay', 'other']),
    description: vine.string().trim().maxLength(255),
    amount: vine.number().positive(),
    effectiveFrom: vine.string().trim(),
    effectiveUntil: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de componente salarial
 */
export const updatePayrollComponentValidator = vine.compile(
  vine.object({
    description: vine.string().trim().maxLength(255).optional(),
    amount: vine.number().positive().optional(),
    isActive: vine.boolean().optional(),
    effectiveUntil: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para criacao de lancamento de folha
 */
export const createPayrollEntryValidator = vine.compile(
  vine.object({
    payrollPeriodId: vine.number().positive(),
    employeeId: vine.number().positive(),
    componentType: vine.enum(['earning', 'deduction']),
    code: vine.enum([
      'base_salary',
      'overtime_50',
      'overtime_100',
      'night_shift',
      'bonus',
      'commission',
      'fixed_bonus',
      'hazard_pay',
      'unhealthy_pay',
      'inss',
      'irrf',
      'fgts',
      'vt_discount',
      'benefit_discount',
      'absence',
      'advance',
      'other',
    ]),
    description: vine.string().trim().maxLength(255),
    referenceValue: vine.number().optional().nullable(),
    quantity: vine.number().optional().nullable(),
    amount: vine.number(),
  })
)

/**
 * Validator para listagem de contracheques
 */
export const listPaySlipsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    employeeId: vine.number().positive().optional(),
    status: vine.enum(['draft', 'final']).optional(),
  })
)

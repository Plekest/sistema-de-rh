import vine from '@vinejs/vine'

/**
 * Validator para criacao de solicitacao de ferias/licenca
 */
export const createLeaveValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
    type: vine.enum([
      'vacation',
      'medical',
      'maternity',
      'paternity',
      'bereavement',
      'wedding',
      'blood_donation',
      'military',
      'other',
    ]),
    startDate: vine.string().trim(),
    endDate: vine.string().trim(),
    daysCount: vine.number().positive(),
    isPaid: vine.boolean().optional(),
    sellDays: vine.number().min(0).optional(),
    leaveBalanceId: vine.number().positive().optional().nullable(),
    notes: vine.string().trim().maxLength(1000).optional().nullable(),
  })
)

/**
 * Validator para aprovacao/rejeicao de solicitacao
 */
export const approveRejectLeaveValidator = vine.compile(
  vine.object({
    rejectionReason: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

/**
 * Validator para listagem de solicitacoes
 */
export const listLeaveValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    employeeId: vine.number().positive().optional(),
    type: vine.enum([
      'vacation',
      'medical',
      'maternity',
      'paternity',
      'bereavement',
      'wedding',
      'blood_donation',
      'military',
      'other',
    ]).optional(),
    status: vine
      .enum(['pending', 'approved', 'rejected', 'cancelled', 'in_progress', 'completed'])
      .optional(),
  })
)

/**
 * Validator para configuracao de tipo de licenca
 */
export const updateLeaveConfigValidator = vine.compile(
  vine.object({
    defaultDays: vine.number().positive().optional(),
    requiresApproval: vine.boolean().optional(),
    requiresDocument: vine.boolean().optional(),
    isPaid: vine.boolean().optional(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para listagem de saldo de ferias
 */
export const listLeaveBalanceValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive().optional(),
  })
)

import vine from '@vinejs/vine'

/**
 * Validator para registro de turnover
 */
export const recordTurnoverValidator = vine.compile(
  vine.object({
    employee_id: vine.number(),
    type: vine.enum(['voluntary', 'involuntary', 'retirement', 'end_of_contract']),
    reason: vine.string().trim().optional().nullable(),
    exit_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }),
    exit_interview_done: vine.boolean().optional(),
    exit_interview_notes: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para listagem de turnover
 */
export const listTurnoverValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    type: vine.enum(['voluntary', 'involuntary', 'retirement', 'end_of_contract']).optional(),
    department_id: vine.number().optional(),
    from: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }).optional(),
    to: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }).optional(),
  })
)

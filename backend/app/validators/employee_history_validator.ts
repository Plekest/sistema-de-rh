import vine from '@vinejs/vine'

export const createEmployeeHistoryValidator = vine.compile(
  vine.object({
    type: vine.enum([
      'hire',
      'promotion',
      'transfer',
      'salary_change',
      'warning',
      'note',
      'termination',
      'document',
      'other',
    ]),
    title: vine.string().trim().minLength(2).maxLength(255),
    description: vine.string().trim().optional().nullable(),
    oldValue: vine.string().trim().optional().nullable(),
    newValue: vine.string().trim().optional().nullable(),
    eventDate: vine.string().trim(),
  })
)

export const listEmployeeHistoryValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    type: vine
      .enum([
        'hire',
        'promotion',
        'transfer',
        'salary_change',
        'warning',
        'note',
        'termination',
        'document',
        'other',
      ])
      .optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
  })
)

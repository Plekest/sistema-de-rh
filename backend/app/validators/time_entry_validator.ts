import vine from '@vinejs/vine'

export const manualTimeEntryValidator = vine.compile(
  vine.object({
    date: vine.string().trim(),
    clockIn: vine.string().trim().optional().nullable(),
    clockOut: vine.string().trim().optional().nullable(),
    lunchStart: vine.string().trim().optional().nullable(),
    lunchEnd: vine.string().trim().optional().nullable(),
    type: vine.enum(['regular', 'overtime', 'absence', 'holiday']).optional(),
    notes: vine.string().trim().optional().nullable(),
  })
)

export const listTimeEntryValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
  })
)

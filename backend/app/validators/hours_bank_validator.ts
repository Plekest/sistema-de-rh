import vine from '@vinejs/vine'

export const calculateHoursBankValidator = vine.compile(
  vine.object({
    month: vine.number().min(1).max(12),
    year: vine.number().min(2000).max(2100),
  })
)

export const listHoursBankValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    year: vine.number().min(2000).max(2100).optional(),
  })
)

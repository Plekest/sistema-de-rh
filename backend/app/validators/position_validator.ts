import vine from '@vinejs/vine'

export const createPositionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    departmentId: vine.number().positive().optional(),
  })
)

export const updatePositionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255).optional(),
    departmentId: vine.number().positive().optional().nullable(),
  })
)

import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string().minLength(8).maxLength(255),
    role: vine.enum(['admin', 'manager', 'employee']),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255).optional(),
    email: vine.string().trim().email().normalizeEmail().optional(),
    password: vine.string().minLength(8).maxLength(255).optional(),
    role: vine.enum(['admin', 'manager', 'employee']).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listUserValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    search: vine.string().trim().optional(),
    role: vine.enum(['admin', 'manager', 'employee']).optional(),
    isActive: vine.boolean().optional(),
  })
)

import vine from '@vinejs/vine'

// Templates
export const createTemplateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    type: vine.enum(['onboarding', 'offboarding']),
    isActive: vine.boolean().optional(),
  })
)

export const updateTemplateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    type: vine.enum(['onboarding', 'offboarding']).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const listTemplatesValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1).optional(),
    limit: vine.number().positive().max(500).optional(),
    type: vine.enum(['onboarding', 'offboarding']).optional(),
    isActive: vine.boolean().optional(),
  })
)

// Template Items
export const createTemplateItemValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    responsibleRole: vine.enum(['hr', 'manager', 'it', 'employee', 'other']),
    dueDays: vine.number().min(0).max(365).optional().nullable(),
    isRequired: vine.boolean().optional(),
    order: vine.number().min(0).optional(),
  })
)

export const updateTemplateItemValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    responsibleRole: vine.enum(['hr', 'manager', 'it', 'employee', 'other']).optional(),
    dueDays: vine.number().min(0).max(365).optional().nullable(),
    isRequired: vine.boolean().optional(),
    order: vine.number().min(0).optional(),
  })
)

// Checklists
export const createChecklistValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
    templateId: vine.number().positive(),
    startedAt: vine.string().trim().optional(),
  })
)

export const listChecklistsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1).optional(),
    limit: vine.number().positive().max(500).optional(),
    employeeId: vine.number().positive().optional(),
    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    type: vine.enum(['onboarding', 'offboarding']).optional(),
  })
)

export const completeItemValidator = vine.compile(
  vine.object({
    notes: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

export const skipItemValidator = vine.compile(
  vine.object({
    notes: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

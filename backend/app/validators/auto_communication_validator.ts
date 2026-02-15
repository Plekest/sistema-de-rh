import vine from '@vinejs/vine'

/**
 * Validator para criacao de comunicacao automatizada
 */
export const createCommunicationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    trigger_type: vine.enum([
      'birthday',
      'work_anniversary',
      'document_expiring',
      'probation_ending',
      'leave_returning',
      'onboarding_incomplete',
    ]),
    trigger_days_before: vine.number().min(0).max(365).optional().nullable(),
    message_template: vine.string().trim().minLength(10),
    target_roles: vine.array(vine.enum(['admin', 'manager', 'employee'])).optional().nullable(),
    is_active: vine.boolean().optional(),
  })
)

/**
 * Validator para atualizacao de comunicacao
 */
export const updateCommunicationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    trigger_type: vine
      .enum([
        'birthday',
        'work_anniversary',
        'document_expiring',
        'probation_ending',
        'leave_returning',
        'onboarding_incomplete',
      ])
      .optional(),
    trigger_days_before: vine.number().min(0).max(365).optional().nullable(),
    message_template: vine.string().trim().minLength(10).optional(),
    target_roles: vine.array(vine.enum(['admin', 'manager', 'employee'])).optional().nullable(),
    is_active: vine.boolean().optional(),
  })
)

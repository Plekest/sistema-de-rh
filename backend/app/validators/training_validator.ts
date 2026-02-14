import vine from '@vinejs/vine'

/**
 * Validator para criacao de treinamento
 */
export const createTrainingValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(5000).optional().nullable(),
    type: vine.enum(['online', 'presential', 'hybrid']),
    category: vine.string().trim().maxLength(100).optional().nullable(),
    instructor: vine.string().trim().maxLength(255).optional().nullable(),
    provider: vine.string().trim().maxLength(255).optional().nullable(),
    startDate: vine.string().trim(),
    endDate: vine.string().trim(),
    durationHours: vine.number().positive().min(1),
    maxParticipants: vine.number().positive().optional().nullable(),
    location: vine.string().trim().maxLength(255).optional().nullable(),
    status: vine.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
    isMandatory: vine.boolean().optional(),
    notes: vine.string().trim().maxLength(1000).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de treinamento
 */
export const updateTrainingValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(5000).optional().nullable(),
    type: vine.enum(['online', 'presential', 'hybrid']).optional(),
    category: vine.string().trim().maxLength(100).optional().nullable(),
    instructor: vine.string().trim().maxLength(255).optional().nullable(),
    provider: vine.string().trim().maxLength(255).optional().nullable(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    durationHours: vine.number().positive().min(1).optional(),
    maxParticipants: vine.number().positive().optional().nullable(),
    location: vine.string().trim().maxLength(255).optional().nullable(),
    status: vine.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
    isMandatory: vine.boolean().optional(),
    notes: vine.string().trim().maxLength(1000).optional().nullable(),
  })
)

/**
 * Validator para listagem de treinamentos
 */
export const listTrainingValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    status: vine.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
    type: vine.enum(['online', 'presential', 'hybrid']).optional(),
    category: vine.string().trim().optional(),
  })
)

/**
 * Validator para inscricao em treinamento
 */
export const enrollValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
  })
)

/**
 * Validator para inscricao em massa
 */
export const bulkEnrollValidator = vine.compile(
  vine.object({
    employeeIds: vine.array(vine.number().positive()).minLength(1),
  })
)

/**
 * Validator para atualizacao de inscricao
 */
export const updateEnrollmentValidator = vine.compile(
  vine.object({
    status: vine
      .enum(['enrolled', 'in_progress', 'completed', 'cancelled', 'no_show'])
      .optional(),
    score: vine.number().min(0).max(100).optional().nullable(),
    certificateUrl: vine.string().trim().url().maxLength(500).optional().nullable(),
    feedback: vine.string().trim().maxLength(2000).optional().nullable(),
    feedbackRating: vine.number().min(1).max(5).optional().nullable(),
    notes: vine.string().trim().maxLength(1000).optional().nullable(),
  })
)

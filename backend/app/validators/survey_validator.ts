import vine from '@vinejs/vine'

// Surveys
export const createSurveyValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    type: vine.enum(['pulse', 'enps', 'climate', 'satisfaction', 'custom']),
    isAnonymous: vine.boolean().optional(),
    startDate: vine.string().trim().optional().nullable(),
    endDate: vine.string().trim().optional().nullable(),
    targetDepartments: vine.array(vine.number().positive()).optional().nullable(),
    questions: vine
      .array(
        vine.object({
          text: vine.string().trim().minLength(3).maxLength(500),
          type: vine.enum(['scale', 'multiple_choice', 'text', 'yes_no', 'enps']),
          options: vine.array(vine.string().trim()).optional().nullable(),
          order: vine.number().min(0).optional(),
          isRequired: vine.boolean().optional(),
        })
      )
      .optional(),
  })
)

export const updateSurveyValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    type: vine.enum(['pulse', 'enps', 'climate', 'satisfaction', 'custom']).optional(),
    isAnonymous: vine.boolean().optional(),
    startDate: vine.string().trim().optional().nullable(),
    endDate: vine.string().trim().optional().nullable(),
    targetDepartments: vine.array(vine.number().positive()).optional().nullable(),
  })
)

export const listSurveysValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1).optional(),
    limit: vine.number().positive().max(500).optional(),
    status: vine.enum(['draft', 'active', 'closed', 'archived']).optional(),
    type: vine.enum(['pulse', 'enps', 'climate', 'satisfaction', 'custom']).optional(),
  })
)

// Responses
export const respondSurveyValidator = vine.compile(
  vine.object({
    answers: vine.array(
      vine.object({
        questionId: vine.number().positive(),
        value: vine.string().trim().maxLength(2000).optional().nullable(),
        numericValue: vine.number().min(0).max(10).optional().nullable(),
      })
    ),
  })
)

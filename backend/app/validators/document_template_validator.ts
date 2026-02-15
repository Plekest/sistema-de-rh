import vine from '@vinejs/vine'

export const createDocumentTemplateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    type: vine.enum(['contract', 'nda', 'declaration', 'letter', 'policy', 'other']),
    content: vine.string().trim().minLength(10),
    variables: vine.array(vine.string().trim()).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

export const updateDocumentTemplateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    type: vine.enum(['contract', 'nda', 'declaration', 'letter', 'policy', 'other']).optional(),
    content: vine.string().trim().minLength(10).optional(),
    variables: vine.array(vine.string().trim()).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

export const listDocumentTemplatesValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1).optional(),
    limit: vine.number().positive().max(500).optional(),
    type: vine.enum(['contract', 'nda', 'declaration', 'letter', 'policy', 'other']).optional(),
    isActive: vine.boolean().optional(),
  })
)

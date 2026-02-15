import vine from '@vinejs/vine'

/**
 * Validator para criacao de categoria de skill
 */
export const createCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim().optional().nullable(),
    display_order: vine.number().optional(),
  })
)

/**
 * Validator para atualizacao de categoria de skill
 */
export const updateCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    description: vine.string().trim().optional().nullable(),
    display_order: vine.number().optional(),
  })
)

/**
 * Validator para criacao de skill
 */
export const createSkillValidator = vine.compile(
  vine.object({
    category_id: vine.number(),
    name: vine.string().trim(),
    description: vine.string().trim().optional().nullable(),
    level_descriptors: vine.any().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de skill
 */
export const updateSkillValidator = vine.compile(
  vine.object({
    category_id: vine.number().optional(),
    name: vine.string().trim().optional(),
    description: vine.string().trim().optional().nullable(),
    level_descriptors: vine.any().optional().nullable(),
  })
)

/**
 * Validator para avaliacao de skill do colaborador
 */
export const assessSkillValidator = vine.compile(
  vine.object({
    employee_id: vine.number(),
    skill_id: vine.number(),
    current_level: vine.number().min(1).max(5),
    target_level: vine.number().min(1).max(5).optional().nullable(),
    notes: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para avaliacao em lote
 */
export const bulkAssessValidator = vine.compile(
  vine.object({
    employee_id: vine.number(),
    assessments: vine.array(
      vine.object({
        skill_id: vine.number(),
        current_level: vine.number().min(1).max(5),
        target_level: vine.number().min(1).max(5).optional().nullable(),
        notes: vine.string().trim().optional().nullable(),
      })
    ),
  })
)

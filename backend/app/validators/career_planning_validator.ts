import vine from '@vinejs/vine'

/**
 * Validator para criacao de career path
 */
export const createPathValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim().optional().nullable(),
    department_id: vine.number().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de career path
 */
export const updatePathValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    description: vine.string().trim().optional().nullable(),
    department_id: vine.number().optional().nullable(),
  })
)

/**
 * Validator para criacao de nivel em career path
 */
export const createLevelValidator = vine.compile(
  vine.object({
    career_path_id: vine.number(),
    position_id: vine.number().optional().nullable(),
    level_order: vine.number(),
    title: vine.string().trim(),
    description: vine.string().trim().optional().nullable(),
    min_experience_months: vine.number().optional().nullable(),
    required_skills: vine.array(vine.any()).optional().nullable(),
    salary_range_min: vine.number().optional().nullable(),
    salary_range_max: vine.number().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de nivel
 */
export const updateLevelValidator = vine.compile(
  vine.object({
    position_id: vine.number().optional().nullable(),
    level_order: vine.number().optional(),
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional().nullable(),
    min_experience_months: vine.number().optional().nullable(),
    required_skills: vine.array(vine.any()).optional().nullable(),
    salary_range_min: vine.number().optional().nullable(),
    salary_range_max: vine.number().optional().nullable(),
  })
)

/**
 * Validator para criacao de plano de sucessao
 */
export const createSuccessionPlanValidator = vine.compile(
  vine.object({
    position_id: vine.number(),
    current_holder_id: vine.number().optional().nullable(),
    successor_id: vine.number().optional().nullable(),
    readiness: vine.enum(['ready_now', 'ready_1_year', 'ready_2_years', 'development_needed']),
    priority: vine.enum(['critical', 'high', 'medium', 'low']),
    development_actions: vine.string().trim().optional().nullable(),
    notes: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de plano de sucessao
 */
export const updateSuccessionPlanValidator = vine.compile(
  vine.object({
    current_holder_id: vine.number().optional().nullable(),
    successor_id: vine.number().optional().nullable(),
    readiness: vine.enum(['ready_now', 'ready_1_year', 'ready_2_years', 'development_needed']).optional(),
    priority: vine.enum(['critical', 'high', 'medium', 'low']).optional(),
    development_actions: vine.string().trim().optional().nullable(),
    notes: vine.string().trim().optional().nullable(),
  })
)

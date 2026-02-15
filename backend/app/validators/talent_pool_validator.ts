import vine from '@vinejs/vine'

/**
 * Validator para criacao de talento no pool
 */
export const createTalentPoolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().trim().email().normalizeEmail(),
    phone: vine.string().trim().optional().nullable(),
    linkedin_url: vine.string().trim().url().optional().nullable(),
    resume_path: vine.string().trim().optional().nullable(),
    source: vine
      .enum(['referral', 'linkedin', 'website', 'agency', 'other'])
      .optional()
      .nullable(),
    notes: vine.string().trim().optional().nullable(),
    skills: vine.string().trim().optional().nullable(),
    experience_years: vine.number().min(0).optional().nullable(),
    desired_position: vine.string().trim().optional().nullable(),
    desired_salary: vine.number().min(0).optional().nullable(),
    tag_ids: vine.array(vine.number()).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de talento
 */
export const updateTalentPoolValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    email: vine.string().trim().email().normalizeEmail().optional(),
    phone: vine.string().trim().optional().nullable(),
    linkedin_url: vine.string().trim().url().optional().nullable(),
    resume_path: vine.string().trim().optional().nullable(),
    source: vine
      .enum(['referral', 'linkedin', 'website', 'agency', 'other'])
      .optional()
      .nullable(),
    notes: vine.string().trim().optional().nullable(),
    skills: vine.string().trim().optional().nullable(),
    experience_years: vine.number().min(0).optional().nullable(),
    desired_position: vine.string().trim().optional().nullable(),
    desired_salary: vine.number().min(0).optional().nullable(),
    status: vine.enum(['active', 'archived']).optional(),
  })
)

/**
 * Validator para criacao de tag
 */
export const createTagValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(50),
    color: vine.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  })
)

/**
 * Validator para associar tags
 */
export const manageTagsValidator = vine.compile(
  vine.object({
    tag_ids: vine.array(vine.number()),
  })
)

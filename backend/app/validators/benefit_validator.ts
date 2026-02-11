import vine from '@vinejs/vine'

/**
 * Validator para criacao de beneficio
 */
export const createBenefitValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    type: vine.enum([
      'vt',
      'vr',
      'va',
      'health',
      'dental',
      'life_insurance',
      'daycare',
      'gym',
      'other',
    ]),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    provider: vine.string().trim().maxLength(100).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para atualizacao de beneficio
 */
export const updateBenefitValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    type: vine.enum([
      'vt',
      'vr',
      'va',
      'health',
      'dental',
      'life_insurance',
      'daycare',
      'gym',
      'other',
    ]).optional(),
    description: vine.string().trim().maxLength(500).optional().nullable(),
    provider: vine.string().trim().maxLength(100).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para criacao de plano de beneficio
 */
export const createBenefitPlanValidator = vine.compile(
  vine.object({
    benefitId: vine.number().positive(),
    name: vine.string().trim().minLength(2).maxLength(100),
    monthlyValue: vine.number().min(0),
    employeeDiscountValue: vine.number().min(0).optional().nullable(),
    employeeDiscountPercentage: vine.number().min(0).max(100).optional().nullable(),
    eligibilityRules: vine.object({}).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para atualizacao de plano de beneficio
 */
export const updateBenefitPlanValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    monthlyValue: vine.number().min(0).optional(),
    employeeDiscountValue: vine.number().min(0).optional().nullable(),
    employeeDiscountPercentage: vine.number().min(0).max(100).optional().nullable(),
    eligibilityRules: vine.object({}).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para adesao de colaborador a beneficio
 */
export const enrollEmployeeValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
    benefitPlanId: vine.number().positive(),
    enrollmentDate: vine.string().trim(),
    notes: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

/**
 * Validator para listagem de beneficios
 */
export const listBenefitValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    type: vine.enum([
      'vt',
      'vr',
      'va',
      'health',
      'dental',
      'life_insurance',
      'daycare',
      'gym',
      'other',
    ]).optional(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para adicionar dependente
 */
export const addDependentValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(150),
    cpf: vine.string().trim().regex(/^\d{11}$/).optional().nullable(),
    birthDate: vine.string().trim().optional().nullable(),
    relationship: vine.enum(['spouse', 'child', 'parent', 'other']),
  })
)

import vine from '@vinejs/vine'

/**
 * Validator para criacao de ciclo de avaliacao
 */
export const createPerformanceCycleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(200),
    type: vine.enum(['semestral', 'anual']),
    startDate: vine.string().trim(),
    endDate: vine.string().trim(),
    selfEvalDeadline: vine.string().trim(),
    managerEvalDeadline: vine.string().trim(),
  })
)

/**
 * Validator para atualizacao de ciclo de avaliacao
 */
export const updatePerformanceCycleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(200).optional(),
    type: vine.enum(['semestral', 'anual']).optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    selfEvalDeadline: vine.string().trim().optional(),
    managerEvalDeadline: vine.string().trim().optional(),
  })
)

/**
 * Validator para criacao de competencia
 */
export const createCompetencyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(200),
    category: vine.enum(['technical', 'behavioral', 'leadership']),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de competencia
 */
export const updateCompetencyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(200).optional(),
    category: vine.enum(['technical', 'behavioral', 'leadership']).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator para adicionar competencia ao ciclo
 */
export const addCompetencyToCycleValidator = vine.compile(
  vine.object({
    competencyId: vine.number().positive(),
    weight: vine.number().min(0).max(100).optional(),
  })
)

/**
 * Validator para criacao de meta individual
 */
export const createIndividualGoalValidator = vine.compile(
  vine.object({
    cycleId: vine.number().positive(),
    employeeId: vine.number().positive(),
    title: vine.string().trim().minLength(3).maxLength(300),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    weight: vine.number().min(0).max(100).optional(),
    targetValue: vine.string().trim().maxLength(200).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de meta individual
 */
export const updateIndividualGoalValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(300).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    weight: vine.number().min(0).max(100).optional(),
    targetValue: vine.string().trim().maxLength(200).optional().nullable(),
    achievedValue: vine.string().trim().maxLength(200).optional().nullable(),
    status: vine.enum(['pending', 'in_progress', 'achieved', 'not_achieved']).optional(),
  })
)

/**
 * Validator para criacao de avaliacao
 */
export const createEvaluationValidator = vine.compile(
  vine.object({
    cycleId: vine.number().positive(),
    employeeId: vine.number().positive(),
    type: vine.enum(['self', 'manager']),
  })
)

/**
 * Validator para submissao de avaliacao
 */
export const submitEvaluationValidator = vine.compile(
  vine.object({
    overallScore: vine.number().min(1).max(5),
    comments: vine.string().trim().maxLength(2000).optional().nullable(),
    scores: vine.array(
      vine.object({
        competencyId: vine.number().positive(),
        score: vine.number().min(1).max(5),
        comments: vine.string().trim().maxLength(500).optional().nullable(),
      })
    ),
  })
)

/**
 * Validator para criacao de plano de desenvolvimento
 */
export const createDevelopmentPlanValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
    cycleId: vine.number().positive().optional().nullable(),
    action: vine.string().trim().minLength(3).maxLength(300),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    responsibleId: vine.number().positive().optional().nullable(),
    deadline: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de plano de desenvolvimento
 */
export const updateDevelopmentPlanValidator = vine.compile(
  vine.object({
    action: vine.string().trim().minLength(3).maxLength(300).optional(),
    description: vine.string().trim().maxLength(1000).optional().nullable(),
    responsibleId: vine.number().positive().optional().nullable(),
    deadline: vine.string().trim().optional().nullable(),
    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  })
)

/**
 * Validator para listagem de ciclos
 */
export const listCyclesValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    status: vine.enum(['draft', 'self_eval', 'manager_eval', 'calibration', 'closed']).optional(),
    year: vine.number().positive().optional(),
  })
)

/**
 * Validator para listagem de metas
 */
export const listGoalsValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive().optional(),
  })
)

/**
 * Validator para listagem de planos de desenvolvimento
 */
export const listDevelopmentPlansValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive().optional(),
  })
)

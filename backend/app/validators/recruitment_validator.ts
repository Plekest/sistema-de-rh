import vine from '@vinejs/vine'

/**
 * Validator para criacao de requisicao de vaga
 */
export const createJobRequisitionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(150),
    departmentId: vine.number().positive().nullable(),
    positionId: vine.number().positive().nullable(),
    salaryRangeMin: vine.number().min(0).optional().nullable(),
    salaryRangeMax: vine.number().min(0).optional().nullable(),
    employmentType: vine.enum(['clt', 'pj']),
    workModel: vine.enum(['onsite', 'hybrid', 'remote']),
    headcount: vine.number().positive(),
    description: vine.string().trim().maxLength(2000).optional().nullable(),
    requirements: vine.string().trim().maxLength(2000).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de requisicao de vaga
 */
export const updateJobRequisitionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(150).optional(),
    departmentId: vine.number().positive().nullable().optional(),
    positionId: vine.number().positive().nullable().optional(),
    salaryRangeMin: vine.number().min(0).nullable().optional(),
    salaryRangeMax: vine.number().min(0).nullable().optional(),
    employmentType: vine.enum(['clt', 'pj']).optional(),
    workModel: vine.enum(['onsite', 'hybrid', 'remote']).optional(),
    headcount: vine.number().positive().optional(),
    description: vine.string().trim().maxLength(2000).nullable().optional(),
    requirements: vine.string().trim().maxLength(2000).nullable().optional(),
  })
)

/**
 * Validator para listagem de requisicoes
 */
export const listJobRequisitionsValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    status: vine
      .enum(['pending_approval', 'approved', 'open', 'filled', 'cancelled'])
      .optional(),
    departmentId: vine.number().positive().optional(),
    employmentType: vine.enum(['clt', 'pj']).optional(),
  })
)

/**
 * Validator para criacao de candidato
 */
export const createCandidateValidator = vine.compile(
  vine.object({
    jobRequisitionId: vine.number().positive(),
    name: vine.string().trim().minLength(3).maxLength(150),
    email: vine.string().trim().email().maxLength(150),
    phone: vine.string().trim().maxLength(20).optional().nullable(),
    linkedinUrl: vine.string().trim().url().maxLength(255).optional().nullable(),
    salaryExpectation: vine.number().min(0).optional().nullable(),
    resumePath: vine.string().trim().maxLength(500).optional().nullable(),
    source: vine.enum(['referral', 'linkedin', 'website', 'agency', 'other']),
    notes: vine.string().trim().maxLength(2000).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de candidato
 */
export const updateCandidateValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(150).optional(),
    email: vine.string().trim().email().maxLength(150).optional(),
    phone: vine.string().trim().maxLength(20).nullable().optional(),
    linkedinUrl: vine.string().trim().url().maxLength(255).nullable().optional(),
    salaryExpectation: vine.number().min(0).nullable().optional(),
    resumePath: vine.string().trim().maxLength(500).nullable().optional(),
    source: vine.enum(['referral', 'linkedin', 'website', 'agency', 'other']).optional(),
    notes: vine.string().trim().maxLength(2000).nullable().optional(),
  })
)

/**
 * Validator para mover candidato entre etapas
 */
export const moveCandidateValidator = vine.compile(
  vine.object({
    stageId: vine.number().positive(),
    feedback: vine.string().trim().maxLength(2000).optional().nullable(),
    score: vine.number().min(1).max(5).optional().nullable(),
  })
)

/**
 * Validator para rejeitar candidato
 */
export const rejectCandidateValidator = vine.compile(
  vine.object({
    feedback: vine.string().trim().maxLength(2000).optional().nullable(),
  })
)

/**
 * Validator para listagem de candidatos
 */
export const listCandidatesValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    jobRequisitionId: vine.number().positive().optional(),
    status: vine.enum(['active', 'hired', 'rejected', 'withdrawn']).optional(),
    stageId: vine.number().positive().optional(),
    search: vine.string().trim().maxLength(100).optional(),
  })
)

/**
 * Validator para criacao de entrevista
 */
export const createInterviewValidator = vine.compile(
  vine.object({
    candidateId: vine.number().positive(),
    interviewerId: vine.number().positive(),
    stageId: vine.number().positive(),
    scheduledAt: vine.string().trim(),
    durationMinutes: vine.number().positive().optional().nullable(),
    location: vine.string().trim().maxLength(255).optional().nullable(),
    meetingLink: vine.string().trim().url().maxLength(500).optional().nullable(),
  })
)

/**
 * Validator para atualizacao de entrevista
 */
export const updateInterviewValidator = vine.compile(
  vine.object({
    interviewerId: vine.number().positive().optional(),
    stageId: vine.number().positive().optional(),
    scheduledAt: vine.string().trim().optional(),
    durationMinutes: vine.number().positive().nullable().optional(),
    location: vine.string().trim().maxLength(255).nullable().optional(),
    meetingLink: vine.string().trim().url().maxLength(500).nullable().optional(),
  })
)

/**
 * Validator para completar entrevista
 */
export const completeInterviewValidator = vine.compile(
  vine.object({
    feedback: vine.string().trim().maxLength(2000).optional().nullable(),
    score: vine.number().min(1).max(5).optional().nullable(),
  })
)

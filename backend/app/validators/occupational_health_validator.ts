import vine from '@vinejs/vine'

/**
 * Validator para criacao de exame ocupacional
 */
export const createExamValidator = vine.compile(
  vine.object({
    employee_id: vine.number(),
    type: vine.enum(['admission', 'periodic', 'dismissal', 'return_to_work', 'role_change']),
    exam_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }),
    expiry_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }).optional().nullable(),
    result: vine.enum(['fit', 'unfit', 'fit_with_restrictions']).optional().nullable(),
    restrictions: vine.string().trim().optional().nullable(),
    doctor_name: vine.string().trim().optional().nullable(),
    crm: vine.string().trim().optional().nullable(),
    clinic_name: vine.string().trim().optional().nullable(),
    status: vine.enum(['scheduled', 'completed', 'expired', 'cancelled']).optional(),
    notes: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para atualizacao de exame ocupacional
 */
export const updateExamValidator = vine.compile(
  vine.object({
    type: vine.enum(['admission', 'periodic', 'dismissal', 'return_to_work', 'role_change']).optional(),
    exam_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }).optional(),
    expiry_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }).optional().nullable(),
    result: vine.enum(['fit', 'unfit', 'fit_with_restrictions']).optional().nullable(),
    restrictions: vine.string().trim().optional().nullable(),
    doctor_name: vine.string().trim().optional().nullable(),
    crm: vine.string().trim().optional().nullable(),
    clinic_name: vine.string().trim().optional().nullable(),
    status: vine.enum(['scheduled', 'completed', 'expired', 'cancelled']).optional(),
    notes: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para conclusao de exame
 */
export const completeExamValidator = vine.compile(
  vine.object({
    result: vine.enum(['fit', 'unfit', 'fit_with_restrictions']),
    restrictions: vine.string().trim().optional().nullable(),
    doctor_name: vine.string().trim().optional().nullable(),
    crm: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para criacao de atestado medico
 */
export const createCertificateValidator = vine.compile(
  vine.object({
    employee_id: vine.number(),
    start_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }),
    end_date: vine.date({ formats: ['YYYY-MM-DD', 'ISO'] }),
    days_count: vine.number().min(1),
    cid_code: vine.string().trim().optional().nullable(),
    cid_description: vine.string().trim().optional().nullable(),
    doctor_name: vine.string().trim().optional().nullable(),
    crm: vine.string().trim().optional().nullable(),
    notes: vine.string().trim().optional().nullable(),
  })
)

/**
 * Validator para listagem de exames
 */
export const listExamsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    employee_id: vine.number().optional(),
    type: vine.enum(['admission', 'periodic', 'dismissal', 'return_to_work', 'role_change']).optional(),
    status: vine.enum(['scheduled', 'completed', 'expired', 'cancelled']).optional(),
  })
)

/**
 * Validator para listagem de atestados
 */
export const listCertificatesValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    employee_id: vine.number().optional(),
    status: vine.enum(['pending', 'approved', 'rejected']).optional(),
  })
)

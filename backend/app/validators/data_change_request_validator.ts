import vine from '@vinejs/vine'

const ALLOWED_FIELDS = [
  'phone',
  'email',
  'addressStreet',
  'addressNumber',
  'addressComplement',
  'addressNeighborhood',
  'addressCity',
  'addressState',
  'addressZip',
]

export const createDataChangeRequestValidator = vine.compile(
  vine.object({
    employeeId: vine.number().positive(),
    fieldName: vine.enum(ALLOWED_FIELDS as any),
    newValue: vine.string().trim().maxLength(255),
    reason: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

export const listDataChangeRequestValidator = vine.compile(
  vine.object({
    page: vine.number().positive().min(1).optional(),
    limit: vine.number().positive().max(500).optional(),
    status: vine.enum(['pending', 'approved', 'rejected']).optional(),
    employeeId: vine.number().positive().optional(),
  })
)

export const reviewDataChangeRequestValidator = vine.compile(
  vine.object({
    reviewNotes: vine.string().trim().maxLength(500).optional().nullable(),
  })
)

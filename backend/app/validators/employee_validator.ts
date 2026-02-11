import vine from '@vinejs/vine'

export const createEmployeeValidator = vine.compile(
  vine.object({
    userId: vine.number().positive().optional(),
    registrationNumber: vine.string().trim().maxLength(50).optional(),
    fullName: vine.string().trim().minLength(2).maxLength(255),
    cpf: vine
      .string()
      .trim()
      .maxLength(14)
      .optional()
      .nullable(),
    cnpj: vine
      .string()
      .trim()
      .maxLength(18)
      .optional()
      .nullable(),
    rg: vine.string().trim().maxLength(20).optional().nullable(),
    email: vine.string().trim().email().normalizeEmail(),
    phone: vine.string().trim().maxLength(20).optional().nullable(),
    type: vine.enum(['clt', 'pj']).optional(),
    departmentId: vine.number().positive().optional().nullable(),
    positionId: vine.number().positive().optional().nullable(),
    hireDate: vine.string().trim(),
    terminationDate: vine.string().trim().optional().nullable(),
    salary: vine.number().min(0).optional().nullable(),
    status: vine.enum(['active', 'inactive', 'terminated']).optional(),
    birthDate: vine.string().trim().optional().nullable(),
    addressStreet: vine.string().trim().maxLength(255).optional().nullable(),
    addressNumber: vine.string().trim().maxLength(20).optional().nullable(),
    addressComplement: vine.string().trim().maxLength(255).optional().nullable(),
    addressNeighborhood: vine.string().trim().maxLength(255).optional().nullable(),
    addressCity: vine.string().trim().maxLength(255).optional().nullable(),
    addressState: vine.string().trim().maxLength(2).optional().nullable(),
    addressZip: vine.string().trim().maxLength(10).optional().nullable(),
    notes: vine.string().trim().optional().nullable(),
  })
)

export const updateEmployeeValidator = vine.compile(
  vine.object({
    userId: vine.number().positive().optional().nullable(),
    registrationNumber: vine.string().trim().maxLength(50).optional().nullable(),
    fullName: vine.string().trim().minLength(2).maxLength(255).optional(),
    cpf: vine
      .string()
      .trim()
      .maxLength(14)
      .optional()
      .nullable(),
    cnpj: vine
      .string()
      .trim()
      .maxLength(18)
      .optional()
      .nullable(),
    rg: vine.string().trim().maxLength(20).optional().nullable(),
    email: vine.string().trim().email().normalizeEmail().optional(),
    phone: vine.string().trim().maxLength(20).optional().nullable(),
    type: vine.enum(['clt', 'pj']).optional(),
    departmentId: vine.number().positive().optional().nullable(),
    positionId: vine.number().positive().optional().nullable(),
    hireDate: vine.string().trim().optional(),
    terminationDate: vine.string().trim().optional().nullable(),
    salary: vine.number().min(0).optional().nullable(),
    status: vine.enum(['active', 'inactive', 'terminated']).optional(),
    birthDate: vine.string().trim().optional().nullable(),
    addressStreet: vine.string().trim().maxLength(255).optional().nullable(),
    addressNumber: vine.string().trim().maxLength(20).optional().nullable(),
    addressComplement: vine.string().trim().maxLength(255).optional().nullable(),
    addressNeighborhood: vine.string().trim().maxLength(255).optional().nullable(),
    addressCity: vine.string().trim().maxLength(255).optional().nullable(),
    addressState: vine.string().trim().maxLength(2).optional().nullable(),
    addressZip: vine.string().trim().maxLength(10).optional().nullable(),
    notes: vine.string().trim().optional().nullable(),
  })
)

export const listEmployeeValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(500).optional(),
    search: vine.string().trim().optional(),
    type: vine.enum(['clt', 'pj']).optional(),
    status: vine.enum(['active', 'inactive', 'terminated']).optional(),
    departmentId: vine.number().positive().optional(),
  })
)

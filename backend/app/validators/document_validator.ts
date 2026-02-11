import vine from '@vinejs/vine'

export const createDocumentValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(2).maxLength(255),
    type: vine.enum([
      'rg',
      'cpf',
      'cnpj',
      'ctps',
      'contrato',
      'atestado',
      'comprovante',
      'outro',
    ]),
    notes: vine.string().trim().optional().nullable(),
  })
)

export const listDocumentValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    limit: vine.number().positive().max(100).optional(),
    type: vine
      .enum(['rg', 'cpf', 'cnpj', 'ctps', 'contrato', 'atestado', 'comprovante', 'outro'])
      .optional(),
  })
)

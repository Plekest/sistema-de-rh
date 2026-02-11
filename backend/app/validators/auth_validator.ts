import vine from '@vinejs/vine'

/**
 * Valida os dados de login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string().minLength(6),
  })
)

/**
 * Valida os dados de registro de novo usuário
 */
export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8),
    role: vine.enum(['admin', 'manager', 'employee']).optional(),
  })
)

/**
 * Valida os dados de solicitação de recuperação de senha
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
  })
)

/**
 * Valida os dados de redefinição de senha
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().trim(),
    password: vine.string().minLength(8),
    password_confirmation: vine.string().sameAs('password'),
  })
)

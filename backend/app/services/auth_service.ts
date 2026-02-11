import User from '#models/user'
import Employee from '#models/employee'
import RolePermission from '#models/role_permission'
import PasswordResetToken from '#models/password_reset_token'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { DateTime } from 'luxon'
import { randomBytes, createHash } from 'node:crypto'
import nodemailer from 'nodemailer'

interface PermissionsMap {
  employees: boolean
  attendance: boolean
  hours_bank: boolean
  documents: boolean
  history: boolean
  leave: boolean
  benefits: boolean
  payroll: boolean
  performance: boolean
}

interface UserWithExtras {
  id: number
  fullName: string | null
  email: string
  role: 'admin' | 'manager' | 'employee'
  isActive: boolean
  employeeId: number | null
  permissions: PermissionsMap
}

const DEFAULT_PERMISSIONS: Record<string, PermissionsMap> = {
  admin: {
    employees: true,
    attendance: true,
    hours_bank: true,
    documents: true,
    history: true,
    leave: true,
    benefits: true,
    payroll: true,
    performance: true,
  },
  manager: {
    employees: true,
    attendance: true,
    hours_bank: true,
    documents: true,
    history: true,
    leave: true,
    benefits: true,
    payroll: true,
    performance: true,
  },
  employee: {
    employees: false,
    attendance: true,
    hours_bank: true,
    documents: true,
    history: false,
    leave: true,
    benefits: true,
    payroll: true,
    performance: true,
  },
}

export default class AuthService {
  /**
   * Autentica o usuario com email e senha
   */
  async login(email: string, password: string): Promise<{ token: AccessToken; user: UserWithExtras }> {
    const user = await User.verifyCredentials(email, password)

    if (!user.isActive) {
      throw new Error('Usuario inativo. Entre em contato com o administrador.')
    }

    const token = await User.accessTokens.create(user)
    const userWithExtras = await this.buildUserWithExtras(user)

    return { token, user: userWithExtras }
  }

  /**
   * Revoga o token atual do usuario
   */
  async logout(user: User, tokenId?: string | number): Promise<void> {
    if (tokenId) {
      await User.accessTokens.delete(user, tokenId)
    } else {
      await User.accessTokens.all(user).then((tokens) => {
        return Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))
      })
    }
  }

  /**
   * Retorna os dados do usuario autenticado com employeeId e permissions
   */
  async me(user: User): Promise<UserWithExtras> {
    return this.buildUserWithExtras(user)
  }

  /**
   * Registra um novo usuario
   * Apenas admins podem criar usuarios com role diferente de 'employee'
   */
  async register(
    data: {
      fullName: string
      email: string
      password: string
      role?: 'admin' | 'manager' | 'employee'
    },
    currentUser?: User
  ): Promise<User> {
    if (data.role && data.role !== 'employee') {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Apenas administradores podem criar usuarios com role admin ou manager.')
      }
    }

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role || 'employee',
      isActive: true,
    })

    return user
  }

  /**
   * Monta o objeto de usuario com employeeId e permissions
   */
  private async buildUserWithExtras(user: User): Promise<UserWithExtras> {
    const employee = await Employee.query().where('userId', user.id).first()
    const permissions = await this.buildPermissions(user.role)

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      employeeId: employee ? employee.id : null,
      permissions,
    }
  }

  /**
   * Constroi o mapa de permissoes para uma role a partir do banco de dados
   */
  private async buildPermissions(role: 'admin' | 'manager' | 'employee'): Promise<PermissionsMap> {
    const rolePermissions = await RolePermission.query().where('role', role)

    if (rolePermissions.length === 0) {
      return { ...DEFAULT_PERMISSIONS[role] }
    }

    const result: PermissionsMap = { ...DEFAULT_PERMISSIONS[role] }

    for (const perm of rolePermissions) {
      result[perm.module] = perm.canAccess
    }

    return result
  }

  /**
   * Solicita recuperação de senha
   * Sempre retorna sucesso para não revelar se o email existe
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await User.findBy('email', email)

    // Sempre retorna sucesso para não revelar se email existe
    if (!user) return

    // Invalida tokens anteriores
    await PasswordResetToken.query()
      .where('userId', user.id)
      .whereNull('usedAt')
      .update({ usedAt: DateTime.now().toSQL() })

    // Gera token
    const rawToken = randomBytes(32).toString('hex')
    const hashedToken = createHash('sha256').update(rawToken).digest('hex')

    await PasswordResetToken.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: DateTime.now().plus({ hours: 1 }),
    })

    // Envia email
    await this.sendResetEmail(user.email, user.fullName || 'Usuário', rawToken)
  }

  /**
   * Redefine a senha usando o token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = createHash('sha256').update(token).digest('hex')

    const resetToken = await PasswordResetToken.query()
      .where('token', hashedToken)
      .whereNull('usedAt')
      .where('expiresAt', '>', DateTime.now().toSQL()!)
      .first()

    if (!resetToken) {
      throw new Error('Token inválido ou expirado')
    }

    const user = await User.findOrFail(resetToken.userId)
    user.password = newPassword
    await user.save()

    // Marca token como usado
    resetToken.usedAt = DateTime.now()
    await resetToken.save()

    // Revoga todos os access tokens do usuário
    await this.logout(user)
  }

  /**
   * Envia email de recuperação de senha
   */
  private async sendResetEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    })

    await transporter.sendMail({
      from: process.env.MAIL_FROM || '"Sistema de RH" <noreply@sistema-rh.com>',
      to: email,
      subject: 'Recuperação de Senha - Sistema de RH',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Sistema de RH</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a202c; margin-top: 0;">Olá, ${name}!</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            <p style="color: #718096; font-size: 14px;">
              Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição, ignore este email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #a0aec0; font-size: 12px; text-align: center;">
              &copy; ${new Date().getFullYear()} Sistema de RH - Todos os direitos reservados
            </p>
          </div>
        </div>
      `,
    })
  }
}

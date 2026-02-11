import User from '#models/user'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export default class AuthService {
  /**
   * Autentica o usuário com email e senha
   */
  async login(email: string, password: string): Promise<{ token: AccessToken; user: User }> {
    // Busca usuário pelo email
    const user = await User.verifyCredentials(email, password)

    // Verifica se o usuário está ativo
    if (!user.isActive) {
      throw new Error('Usuário inativo. Entre em contato com o administrador.')
    }

    // Gera o access token
    const token = await User.accessTokens.create(user)

    return { token, user }
  }

  /**
   * Revoga o token atual do usuário
   */
  async logout(user: User, tokenId?: string | number): Promise<void> {
    // Se um tokenId específico foi fornecido, revoga apenas esse token
    if (tokenId) {
      await User.accessTokens.delete(user, tokenId)
    } else {
      // Caso contrário, revoga todos os tokens do usuário
      await User.accessTokens.all(user).then((tokens) => {
        return Promise.all(tokens.map((token) => User.accessTokens.delete(user, token.identifier)))
      })
    }
  }

  /**
   * Retorna os dados do usuário autenticado
   */
  async me(user: User): Promise<User> {
    return user
  }

  /**
   * Registra um novo usuário
   * Apenas admins podem criar usuários com role diferente de 'employee'
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
    // Se uma role foi especificada e não é 'employee', verifica se o usuário atual é admin
    if (data.role && data.role !== 'employee') {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Apenas administradores podem criar usuários com role admin ou manager.')
      }
    }

    // Cria o novo usuário
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role || 'employee',
      isActive: true,
    })

    return user
  }
}

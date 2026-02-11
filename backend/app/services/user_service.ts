import User from '#models/user'

interface ListFilters {
  page?: number
  limit?: number
  search?: string
  role?: 'admin' | 'manager' | 'employee'
  isActive?: boolean
}

interface CreateUserData {
  fullName: string
  email: string
  password: string
  role: 'admin' | 'manager' | 'employee'
}

interface UpdateUserData {
  fullName?: string
  email?: string
  password?: string
  role?: 'admin' | 'manager' | 'employee'
  isActive?: boolean
}

export default class UserService {
  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = User.query().orderBy('createdAt', 'desc')

    if (filters.search) {
      query.where((builder) => {
        builder
          .whereLike('fullName', `%${filters.search}%`)
          .orWhereLike('email', `%${filters.search}%`)
      })
    }

    if (filters.role) {
      query.where('role', filters.role)
    }

    if (filters.isActive !== undefined) {
      query.where('isActive', filters.isActive)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async findById(id: number) {
    const user = await User.query().where('id', id).preload('employee').firstOrFail()
    return user
  }

  async create(data: CreateUserData) {
    const existingUser = await User.query().where('email', data.email).first()

    if (existingUser) {
      throw new Error('E-mail ja cadastrado')
    }

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      isActive: true,
    })

    return user
  }

  async update(id: number, data: UpdateUserData) {
    const user = await User.findOrFail(id)

    if (data.email && data.email !== user.email) {
      const existingUser = await User.query()
        .where('email', data.email)
        .whereNot('id', id)
        .first()

      if (existingUser) {
        throw new Error('E-mail ja cadastrado')
      }
    }

    if (data.fullName !== undefined) {
      user.fullName = data.fullName
    }

    if (data.email !== undefined) {
      user.email = data.email
    }

    if (data.password !== undefined) {
      user.password = data.password
    }

    if (data.role !== undefined) {
      user.role = data.role
    }

    if (data.isActive !== undefined) {
      user.isActive = data.isActive
    }

    await user.save()
    return user
  }

  async delete(id: number) {
    const user = await User.findOrFail(id)

    user.isActive = false
    await user.save()

    return user
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await User.findOrFail(id)

    user.password = newPassword
    await user.save()

    return user
  }
}

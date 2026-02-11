import type { HttpContext } from '@adonisjs/core/http'
import RolePermissionService from '#services/role_permission_service'
import { updateRolePermissionsValidator } from '#validators/role_permission_validator'

export default class RolePermissionsController {
  private service: RolePermissionService

  constructor() {
    this.service = new RolePermissionService()
  }

  async index({ response }: HttpContext) {
    try {
      const permissions = await this.service.getAll()
      return response.ok({ data: permissions })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar permissoes' })
    }
  }

  async update({ request, response }: HttpContext) {
    try {
      const { permissions } = await request.validateUsing(updateRolePermissionsValidator)
      const result = await this.service.update(permissions)
      return response.ok({ data: result })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar permissoes' })
    }
  }
}

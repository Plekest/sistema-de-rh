import api from '@/services/api'
import type { RolePermission } from '../types'

interface GroupedPermissions {
  [role: string]: { [module: string]: boolean }
}

/**
 * Converte o formato agrupado do backend para array flat
 */
function groupedToArray(grouped: GroupedPermissions): RolePermission[] {
  const result: RolePermission[] = []
  for (const [role, modules] of Object.entries(grouped)) {
    for (const [module, canAccess] of Object.entries(modules)) {
      result.push({ role, module, canAccess })
    }
  }
  return result
}

/**
 * Servico de permissoes - gerencia chamadas a API de permissoes de roles
 */
class PermissionsService {
  /**
   * Busca todas as permissoes por role
   */
  async getAll(): Promise<RolePermission[]> {
    const response = await api.get<{ data: GroupedPermissions }>('/admin/permissions')
    return groupedToArray(response.data.data)
  }

  /**
   * Atualiza permissoes
   */
  async update(permissions: RolePermission[]): Promise<RolePermission[]> {
    const response = await api.put<{ data: GroupedPermissions }>('/admin/permissions', { permissions })
    return groupedToArray(response.data.data)
  }
}

export default new PermissionsService()

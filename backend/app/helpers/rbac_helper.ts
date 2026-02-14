import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'

/**
 * Helper para resolver o employeeId baseado na role do usuario.
 *
 * - Admin/Manager: pode acessar qualquer employeeId (do param/query)
 * - Employee: so pode acessar seus proprios dados (busca o Employee pelo userId)
 *
 * @throws Error se employee role tentar acessar dados de outro colaborador
 * @throws Error se usuario nao tiver colaborador vinculado
 */
export async function resolveEmployeeId(
  ctx: HttpContext,
  requestedEmployeeId?: number | string
): Promise<number> {
  const { auth } = ctx
  const user = auth.getUserOrFail()

  // Admin e Manager podem acessar qualquer colaborador
  if (user.role === 'admin' || user.role === 'manager') {
    if (!requestedEmployeeId) {
      throw new Error('employeeId é obrigatório para admin/manager')
    }
    return Number(requestedEmployeeId)
  }

  // Employee: busca o proprio colaborador
  const employee = await Employee.query()
    .where('userId', user.id)
    .where('status', 'active')
    .first()

  if (!employee) {
    throw new Error('Nenhum colaborador ativo vinculado a este usuario')
  }

  // Se requestedEmployeeId foi fornecido, verifica ownership
  if (requestedEmployeeId && Number(requestedEmployeeId) !== employee.id) {
    throw new Error('Voce nao tem permissao para acessar dados de outros colaboradores')
  }

  return employee.id
}

/**
 * Verifica se o usuario pode acessar um colaborador especifico.
 * Retorna true se admin/manager, ou se employee e o colaborador e o proprio.
 */
export async function canAccessEmployee(
  ctx: HttpContext,
  targetEmployeeId: number
): Promise<boolean> {
  const { auth } = ctx
  const user = auth.getUserOrFail()

  if (user.role === 'admin' || user.role === 'manager') {
    return true
  }

  const employee = await Employee.query()
    .where('userId', user.id)
    .where('status', 'active')
    .first()

  if (!employee) {
    return false
  }

  return employee.id === targetEmployeeId
}

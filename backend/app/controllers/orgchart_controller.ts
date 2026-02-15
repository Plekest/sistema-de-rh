import type { HttpContext } from '@adonisjs/core/http'
import Department from '#models/department'
import Employee from '#models/employee'

export default class OrgchartController {
  async index({ response }: HttpContext) {
    try {
      const departments = await Department.query().orderBy('name', 'asc')

      const orgchartData = []

      for (const department of departments) {
        const employees = await Employee.query()
          .where('departmentId', department.id)
          .where('status', 'active')
          .preload('position')
          .orderBy('fullName', 'asc')

        // Tentar encontrar um gerente (simplificado: primeiro employee ou aquele com position "Gerente")
        const manager = employees.find((e) => e.position?.title.toLowerCase().includes('gerente'))

        const employeesList = employees.map((e) => ({
          id: e.id,
          fullName: e.fullName,
          position: e.position?.title || 'Sem cargo',
          email: e.email,
        }))

        orgchartData.push({
          id: department.id,
          name: department.name,
          manager: manager
            ? {
                id: manager.id,
                fullName: manager.fullName,
                position: manager.position?.title || '',
                email: manager.email,
              }
            : null,
          employees: employeesList,
          employeeCount: employees.length,
        })
      }

      return response.ok({ data: { departments: orgchartData } })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar organograma' })
    }
  }
}

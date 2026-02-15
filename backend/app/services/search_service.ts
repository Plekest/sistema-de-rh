import Employee from '#models/employee'
import Department from '#models/department'
import Position from '#models/position'

interface SearchResult {
  employees: Array<{
    id: number
    fullName: string
    email: string
    department: string | null
    position: string | null
    registrationNumber: string | null
  }>
  departments: Array<{
    id: number
    name: string
    employeeCount: number
  }>
  positions: Array<{
    id: number
    title: string
    department: string | null
  }>
}

export default class SearchService {
  async search(query: string, type?: 'employees' | 'departments' | 'positions' | 'all') {
    const searchType = type || 'all'
    const result: SearchResult = {
      employees: [],
      departments: [],
      positions: [],
    }

    const searchPattern = `%${query}%`

    // Busca em employees
    if (searchType === 'all' || searchType === 'employees') {
      const employeesData = await Employee.query()
        .where((q) => {
          q.whereILike('full_name', searchPattern)
            .orWhereILike('email', searchPattern)
            .orWhereILike('cpf', searchPattern)
            .orWhereILike('registration_number', searchPattern)
        })
        .where('status', 'active')
        .preload('department')
        .preload('position')
        .orderBy('full_name', 'asc')
        .limit(10)

      result.employees = employeesData.map((emp) => ({
        id: emp.id,
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department?.name || null,
        position: emp.position?.title || null,
        registrationNumber: emp.registrationNumber,
      }))
    }

    // Busca em departments
    if (searchType === 'all' || searchType === 'departments') {
      const departmentsData = await Department.query()
        .whereILike('name', searchPattern)
        .withCount('employees', (query) => {
          query.where('status', 'active')
        })
        .orderBy('name', 'asc')
        .limit(10)

      result.departments = departmentsData.map((dept) => ({
        id: dept.id,
        name: dept.name,
        employeeCount: Number(dept.$extras.employees_count || 0),
      }))
    }

    // Busca em positions
    if (searchType === 'all' || searchType === 'positions') {
      const positionsData = await Position.query()
        .whereILike('title', searchPattern)
        .preload('department')
        .orderBy('title', 'asc')
        .limit(10)

      result.positions = positionsData.map((pos) => ({
        id: pos.id,
        title: pos.title,
        department: pos.department?.name || null,
      }))
    }

    return result
  }
}

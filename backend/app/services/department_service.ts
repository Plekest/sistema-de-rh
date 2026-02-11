import Department from '#models/department'

export default class DepartmentService {
  async list() {
    const departments = await Department.query().orderBy('name', 'asc')
    return departments
  }

  async findById(id: number) {
    const department = await Department.query()
      .where('id', id)
      .preload('positions')
      .firstOrFail()
    return department
  }

  async create(data: { name: string }) {
    const existing = await Department.findBy('name', data.name)
    if (existing) {
      throw new Error('Ja existe um departamento com este nome')
    }

    const department = await Department.create(data)
    return department
  }

  async update(id: number, data: { name: string }) {
    const department = await Department.findOrFail(id)

    const existing = await Department.query()
      .where('name', data.name)
      .whereNot('id', id)
      .first()
    if (existing) {
      throw new Error('Ja existe um departamento com este nome')
    }

    department.merge(data)
    await department.save()
    return department
  }

  async delete(id: number) {
    const department = await Department.findOrFail(id)
    await department.delete()
  }
}

import Position from '#models/position'

export default class PositionService {
  async list() {
    const positions = await Position.query()
      .preload('department')
      .orderBy('title', 'asc')
    return positions
  }

  async findById(id: number) {
    const position = await Position.query()
      .where('id', id)
      .preload('department')
      .firstOrFail()
    return position
  }

  async create(data: { title: string; departmentId?: number }) {
    const position = await Position.create(data)
    await position.load('department')
    return position
  }

  async update(id: number, data: { title?: string; departmentId?: number | null }) {
    const position = await Position.findOrFail(id)
    position.merge(data)
    await position.save()
    await position.load('department')
    return position
  }

  async delete(id: number) {
    const position = await Position.findOrFail(id)
    await position.delete()
  }
}

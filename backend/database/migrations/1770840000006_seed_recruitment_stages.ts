import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.table('recruitment_stages').multiInsert([
        {
          name: 'Triagem',
          display_order: 1,
          is_default: true,
          is_active: true,
          created_at: new Date(),
        },
        {
          name: 'Entrevista RH',
          display_order: 2,
          is_default: false,
          is_active: true,
          created_at: new Date(),
        },
        {
          name: 'Teste Técnico',
          display_order: 3,
          is_default: false,
          is_active: true,
          created_at: new Date(),
        },
        {
          name: 'Entrevista Gestor',
          display_order: 4,
          is_default: false,
          is_active: true,
          created_at: new Date(),
        },
        {
          name: 'Proposta',
          display_order: 5,
          is_default: false,
          is_active: true,
          created_at: new Date(),
        },
      ])
    })
  }

  async down() {
    this.defer(async (db) => {
      await db
        .from('recruitment_stages')
        .whereIn('name', [
          'Triagem',
          'Entrevista RH',
          'Teste Técnico',
          'Entrevista Gestor',
          'Proposta',
        ])
        .delete()
    })
  }
}

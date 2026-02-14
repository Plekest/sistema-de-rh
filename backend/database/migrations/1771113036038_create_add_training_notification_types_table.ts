import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    // Remove o constraint antigo do enum
    await this.db.rawQuery(`
      ALTER TABLE notifications
      DROP CONSTRAINT IF EXISTS notifications_type_check;
    `)

    // Adiciona o novo constraint com os tipos de training
    await this.db.rawQuery(`
      ALTER TABLE notifications
      ADD CONSTRAINT notifications_type_check
      CHECK (type IN (
        'leave_approved',
        'leave_rejected',
        'document_uploaded',
        'salary_changed',
        'training_enrollment',
        'training_completed',
        'general'
      ));
    `)
  }

  async down() {
    // Remove o constraint atual
    await this.db.rawQuery(`
      ALTER TABLE notifications
      DROP CONSTRAINT IF EXISTS notifications_type_check;
    `)

    // Restaura o constraint original sem os tipos de training
    await this.db.rawQuery(`
      ALTER TABLE notifications
      ADD CONSTRAINT notifications_type_check
      CHECK (type IN (
        'leave_approved',
        'leave_rejected',
        'document_uploaded',
        'salary_changed',
        'general'
      ));
    `)
  }
}

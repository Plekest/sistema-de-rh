import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import TalentPool from '#models/talent_pool'

export default class TalentPoolTag extends BaseModel {
  static table = 'talent_pool_tags'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare color: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @manyToMany(() => TalentPool, {
    pivotTable: 'talent_pool_tag_pivot',
    localKey: 'id',
    pivotForeignKey: 'tag_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'talent_pool_id',
  })
  declare talentPools: ManyToMany<typeof TalentPool>
}

import TalentPool from '#models/talent_pool'
import TalentPoolTag from '#models/talent_pool_tag'
import Candidate from '#models/candidate'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'contacted' | 'interviewing' | 'hired' | 'archived'
  source?: string
  tag_ids?: number[]
}

interface CreateTalentData {
  name: string
  email: string
  phone?: string | null
  linkedin_url?: string | null
  resume_path?: string | null
  source?: string | null
  notes?: string | null
  skills?: string | null
  experience_years?: number | null
  desired_position?: string | null
  desired_salary?: number | null
  tag_ids?: number[] | null
}

export default class TalentPoolService {
  /**
   * Lista talentos com filtros e paginacao
   */
  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = TalentPool.query().preload('tags').orderBy('createdAt', 'desc')

    if (filters.search) {
      const search = `%${filters.search}%`
      query.where((q) => {
        q.whereILike('fullName', search)
          .orWhereILike('email', search)
          .orWhereILike('phone', search)
      })
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.source) {
      query.where('source', filters.source)
    }

    // Filtro por tags usando whereHas
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      query.whereHas('tags', (tagQuery) => {
        tagQuery.whereIn('talent_pool_tags.id', filters.tag_ids!)
      })
    }

    const result = await query.paginate(page, limit)
    return result
  }

  /**
   * Cria novo talento no pool
   */
  async create(data: CreateTalentData, userId?: number) {
    const talent = await TalentPool.create({
      fullName: data.name,
      email: data.email,
      phone: data.phone || null,
      linkedinUrl: data.linkedin_url || null,
      resumeUrl: data.resume_path || null,
      source: (data.source as any) || 'other',
      status: 'active',
      notes: data.notes || null,
      experienceYears: data.experience_years || null,
      salaryExpectation: data.desired_salary || null,
      addedBy: userId || null,
    })

    // Associa tags se fornecidas
    if (data.tag_ids && data.tag_ids.length > 0) {
      await talent.related('tags').attach(data.tag_ids)
    }

    await talent.load('tags')

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'create',
      resourceType: 'talent_pool',
      resourceId: talent.id,
      description: `Talento ${talent.fullName} adicionado ao pool`,
      newValues: {
        fullName: talent.fullName,
        email: talent.email,
        source: talent.source,
      },
    })

    return talent
  }

  /**
   * Exibe detalhes de um talento
   */
  async show(id: number) {
    const talent = await TalentPool.query()
      .where('id', id)
      .preload('tags')
      .preload('addedByUser')
      .firstOrFail()

    return talent
  }

  /**
   * Atualiza talento
   */
  async update(id: number, data: Partial<CreateTalentData>, userId?: number) {
    const talent = await TalentPool.findOrFail(id)

    const updateData: Record<string, any> = {}
    if (data.name !== undefined) updateData.fullName = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.linkedin_url !== undefined) updateData.linkedinUrl = data.linkedin_url
    if (data.resume_path !== undefined) updateData.resumeUrl = data.resume_path
    if (data.source !== undefined) updateData.source = data.source
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.experience_years !== undefined) updateData.experienceYears = data.experience_years
    if (data.desired_salary !== undefined) updateData.salaryExpectation = data.desired_salary

    talent.merge(updateData)
    await talent.save()

    await talent.load('tags')

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'talent_pool',
      resourceId: talent.id,
      description: `Talento ${talent.fullName} atualizado`,
      newValues: updateData,
    })

    return talent
  }

  /**
   * Arquiva um talento (soft archive)
   */
  async archive(id: number, userId?: number) {
    const talent = await TalentPool.findOrFail(id)
    talent.status = 'archived'
    await talent.save()

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'talent_pool',
      resourceId: talent.id,
      description: `Talento ${talent.fullName} arquivado`,
      oldValues: { status: 'active' },
      newValues: { status: 'archived' },
    })

    return talent
  }

  /**
   * Importa candidato rejeitado para o talent pool
   */
  async importFromCandidate(candidateId: number, userId?: number) {
    const candidate = await Candidate.query()
      .where('id', candidateId)
      .preload('jobRequisition')
      .firstOrFail()

    // Verifica se candidato esta rejeitado
    if (candidate.status !== 'rejected') {
      throw new Error('Apenas candidatos rejeitados podem ser importados para o talent pool')
    }

    // Verifica se ja existe no pool
    const existing = await TalentPool.query()
      .where('email', candidate.email)
      .orWhere('candidateId', candidate.id)
      .first()

    if (existing) {
      throw new Error('Este candidato ja esta no talent pool')
    }

    const talent = await TalentPool.create({
      candidateId: candidate.id,
      fullName: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      linkedinUrl: candidate.linkedinUrl,
      resumeUrl: candidate.resumePath,
      source: 'recruitment',
      status: 'active',
      salaryExpectation: candidate.salaryExpectation,
      notes: `Importado da vaga: ${candidate.jobRequisition.title}. ${candidate.notes || ''}`,
      addedBy: userId || null,
    })

    await talent.load('tags')

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'create',
      resourceType: 'talent_pool',
      resourceId: talent.id,
      description: `Candidato ${candidate.name} importado para o talent pool`,
      newValues: {
        candidateId: candidate.id,
        fullName: talent.fullName,
      },
    })

    return talent
  }

  /**
   * Lista todas as tags
   */
  async listTags() {
    const tags = await TalentPoolTag.query().orderBy('name', 'asc')
    return tags
  }

  /**
   * Cria nova tag
   */
  async createTag(data: { name: string; color?: string | null }, userId?: number) {
    const tag = await TalentPoolTag.create({
      name: data.name,
      color: data.color || '#3B82F6',
    })

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'create',
      resourceType: 'talent_pool_tag',
      resourceId: tag.id,
      description: `Tag ${tag.name} criada`,
    })

    return tag
  }

  /**
   * Deleta tag
   */
  async deleteTag(id: number, userId?: number) {
    const tag = await TalentPoolTag.findOrFail(id)
    const tagName = tag.name

    await tag.delete()

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'delete',
      resourceType: 'talent_pool_tag',
      resourceId: id,
      description: `Tag ${tagName} deletada`,
    })
  }

  /**
   * Associa tags a um talento
   */
  async addTags(talentPoolId: number, tagIds: number[], userId?: number) {
    const talent = await TalentPool.findOrFail(talentPoolId)

    // Sincroniza tags (adiciona apenas as novas)
    await talent.related('tags').attach(tagIds)

    await talent.load('tags')

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'talent_pool',
      resourceId: talent.id,
      description: `Tags adicionadas ao talento ${talent.fullName}`,
      newValues: { tagIds },
    })

    return talent
  }

  /**
   * Remove tags de um talento
   */
  async removeTags(talentPoolId: number, tagIds: number[], userId?: number) {
    const talent = await TalentPool.findOrFail(talentPoolId)

    await talent.related('tags').detach(tagIds)

    await talent.load('tags')

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'talent_pool',
      resourceId: talent.id,
      description: `Tags removidas do talento ${talent.fullName}`,
      oldValues: { tagIds },
    })

    return talent
  }
}

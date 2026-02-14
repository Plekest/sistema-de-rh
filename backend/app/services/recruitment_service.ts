import JobRequisition from '#models/job_requisition'
import RecruitmentStage from '#models/recruitment_stage'
import Candidate from '#models/candidate'
import CandidateStageHistory from '#models/candidate_stage_history'
import Interview from '#models/interview'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { toNumber } from '#utils/number_helper'

interface ListRequisitionsFilters {
  page?: number
  limit?: number
  status?: 'pending_approval' | 'approved' | 'open' | 'filled' | 'cancelled'
  departmentId?: number
  employmentType?: 'clt' | 'pj'
}

interface CreateRequisitionData {
  title: string
  departmentId?: number | null
  positionId?: number | null
  salaryRangeMin?: number | null
  salaryRangeMax?: number | null
  employmentType: 'clt' | 'pj'
  workModel: 'onsite' | 'hybrid' | 'remote'
  headcount: number
  description?: string | null
  requirements?: string | null
}

interface UpdateRequisitionData {
  title?: string
  departmentId?: number | null
  positionId?: number | null
  salaryRangeMin?: number | null
  salaryRangeMax?: number | null
  employmentType?: 'clt' | 'pj'
  workModel?: 'onsite' | 'hybrid' | 'remote'
  headcount?: number
  description?: string | null
  requirements?: string | null
}

interface ListCandidatesFilters {
  page?: number
  limit?: number
  jobRequisitionId?: number
  status?: 'active' | 'hired' | 'rejected' | 'withdrawn'
  stageId?: number
  search?: string
}

interface CreateCandidateData {
  jobRequisitionId: number
  name: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  salaryExpectation?: number | null
  resumePath?: string | null
  source: 'referral' | 'linkedin' | 'website' | 'agency' | 'other'
  notes?: string | null
}

interface UpdateCandidateData {
  name?: string
  email?: string
  phone?: string | null
  linkedinUrl?: string | null
  salaryExpectation?: number | null
  resumePath?: string | null
  source?: 'referral' | 'linkedin' | 'website' | 'agency' | 'other'
  notes?: string | null
}

interface CreateInterviewData {
  candidateId: number
  interviewerId: number
  stageId: number
  scheduledAt: string
  durationMinutes?: number | null
  location?: string | null
  meetingLink?: string | null
}

interface UpdateInterviewData {
  interviewerId?: number
  stageId?: number
  scheduledAt?: string
  durationMinutes?: number | null
  location?: string | null
  meetingLink?: string | null
}

export default class RecruitmentService {
  // ==========================================
  // Vagas (Job Requisitions)
  // ==========================================

  /**
   * Lista requisicoes com filtros e paginacao
   */
  async listRequisitions(filters: ListRequisitionsFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = JobRequisition.query()
      .preload('department')
      .preload('position')
      .preload('requester')
      .orderBy('createdAt', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.departmentId) {
      query.where('departmentId', filters.departmentId)
    }
    if (filters.employmentType) {
      query.where('employmentType', filters.employmentType)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Busca requisicao por ID
   */
  async getRequisition(id: number) {
    return await JobRequisition.query()
      .where('id', id)
      .preload('department')
      .preload('position')
      .preload('requester')
      .preload('approver')
      .preload('candidates', (candidateQuery) => {
        candidateQuery.preload('currentStage')
      })
      .firstOrFail()
  }

  /**
   * Cria nova requisicao de vaga
   */
  async createRequisition(data: CreateRequisitionData, userId: number) {
    if (data.salaryRangeMin && data.salaryRangeMax &&
        toNumber(data.salaryRangeMin) > toNumber(data.salaryRangeMax)) {
      throw new Error('Salario minimo nao pode ser maior que o maximo')
    }

    const requisition = await JobRequisition.create({
      title: data.title,
      departmentId: data.departmentId || null,
      positionId: data.positionId || null,
      requestedBy: userId,
      salaryRangeMin: data.salaryRangeMin || null,
      salaryRangeMax: data.salaryRangeMax || null,
      employmentType: data.employmentType,
      workModel: data.workModel,
      headcount: data.headcount,
      description: data.description || null,
      requirements: data.requirements || null,
      status: 'pending_approval',
    })

    await requisition.load('department')
    await requisition.load('position')
    await requisition.load('requester')

    return requisition
  }

  /**
   * Atualiza requisicao
   */
  async updateRequisition(id: number, data: UpdateRequisitionData) {
    const requisition = await JobRequisition.findOrFail(id)

    if (requisition.status === 'filled' || requisition.status === 'cancelled') {
      throw new Error('Nao e possivel atualizar requisicao preenchida ou cancelada')
    }

    if (data.salaryRangeMin && data.salaryRangeMax &&
        toNumber(data.salaryRangeMin) > toNumber(data.salaryRangeMax)) {
      throw new Error('Salario minimo nao pode ser maior que o maximo')
    }

    requisition.merge(data)
    await requisition.save()

    await requisition.load('department')
    await requisition.load('position')
    await requisition.load('requester')

    return requisition
  }

  /**
   * Aprova requisicao e muda status para open
   */
  async approveRequisition(id: number, userId: number) {
    const requisition = await JobRequisition.findOrFail(id)

    if (requisition.status !== 'pending_approval') {
      throw new Error('Apenas requisicoes pendentes podem ser aprovadas')
    }

    requisition.status = 'open'
    requisition.approvedBy = userId
    requisition.approvedAt = DateTime.now()
    await requisition.save()

    await requisition.load('department')
    await requisition.load('position')
    await requisition.load('requester')
    await requisition.load('approver')

    return requisition
  }

  /**
   * Cancela requisicao
   */
  async cancelRequisition(id: number) {
    const requisition = await JobRequisition.findOrFail(id)

    if (requisition.status === 'filled' || requisition.status === 'cancelled') {
      throw new Error('Requisicao ja foi preenchida ou cancelada')
    }

    requisition.status = 'cancelled'
    requisition.closedAt = DateTime.now()
    await requisition.save()

    await requisition.load('department')
    await requisition.load('position')

    return requisition
  }

  /**
   * Retorna estatisticas de uma requisicao
   */
  async getRequisitionStats(id: number) {
    await JobRequisition.findOrFail(id)

    const stages = await RecruitmentStage.query()
      .where('isActive', true)
      .orderBy('displayOrder', 'asc')

    const stats = await Promise.all(
      stages.map(async (stage) => {
        const count = await Candidate.query()
          .where('jobRequisitionId', id)
          .where('currentStageId', stage.id)
          .where('status', 'active')
          .count('* as total')

        return {
          stageId: stage.id,
          stageName: stage.name,
          count: toNumber(count[0].$extras.total),
        }
      })
    )

    const totalCandidates = await Candidate.query()
      .where('jobRequisitionId', id)
      .count('* as total')

    const activeCandidates = await Candidate.query()
      .where('jobRequisitionId', id)
      .where('status', 'active')
      .count('* as total')

    const hiredCandidates = await Candidate.query()
      .where('jobRequisitionId', id)
      .where('status', 'hired')
      .count('* as total')

    return {
      stages: stats,
      totalCandidates: toNumber(totalCandidates[0].$extras.total),
      activeCandidates: toNumber(activeCandidates[0].$extras.total),
      hiredCandidates: toNumber(hiredCandidates[0].$extras.total),
    }
  }

  // ==========================================
  // Etapas (Recruitment Stages)
  // ==========================================

  /**
   * Lista etapas de recrutamento
   */
  async listStages() {
    return await RecruitmentStage.query()
      .where('isActive', true)
      .orderBy('displayOrder', 'asc')
  }

  /**
   * Busca etapa por ID
   */
  async getStage(id: number) {
    return await RecruitmentStage.findOrFail(id)
  }

  // ==========================================
  // Candidatos (Candidates)
  // ==========================================

  /**
   * Lista candidatos com filtros e paginacao
   */
  async listCandidates(filters: ListCandidatesFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Candidate.query()
      .preload('jobRequisition')
      .preload('currentStage')
      .orderBy('createdAt', 'desc')

    if (filters.jobRequisitionId) {
      query.where('jobRequisitionId', filters.jobRequisitionId)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.stageId) {
      query.where('currentStageId', filters.stageId)
    }
    if (filters.search) {
      query.where((searchQuery) => {
        searchQuery
          .whereLike('name', `%${filters.search}%`)
          .orWhereLike('email', `%${filters.search}%`)
      })
    }

    return await query.paginate(page, limit)
  }

  /**
   * Busca candidato por ID
   */
  async getCandidate(id: number) {
    return await Candidate.query()
      .where('id', id)
      .preload('jobRequisition', (jobQuery) => {
        jobQuery.preload('department').preload('position')
      })
      .preload('currentStage')
      .preload('stageHistory', (historyQuery) => {
        historyQuery.preload('stage').preload('mover').orderBy('enteredAt', 'desc')
      })
      .preload('interviews', (interviewQuery) => {
        interviewQuery.preload('interviewer').preload('stage').orderBy('scheduledAt', 'desc')
      })
      .firstOrFail()
  }

  /**
   * Cria novo candidato
   */
  async createCandidate(data: CreateCandidateData, userId: number) {
    const requisition = await JobRequisition.findOrFail(data.jobRequisitionId)

    if (requisition.status !== 'open') {
      throw new Error('Vaga nao esta aberta para candidatos')
    }

    // Busca a etapa default (Triagem)
    const defaultStage = await RecruitmentStage.query()
      .where('isDefault', true)
      .where('isActive', true)
      .firstOrFail()

    const candidate = await Candidate.create({
      jobRequisitionId: data.jobRequisitionId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      linkedinUrl: data.linkedinUrl || null,
      salaryExpectation: data.salaryExpectation || null,
      resumePath: data.resumePath || null,
      source: data.source,
      currentStageId: defaultStage.id,
      status: 'active',
      notes: data.notes || null,
    })

    // Cria entrada no historico
    await CandidateStageHistory.create({
      candidateId: candidate.id,
      stageId: defaultStage.id,
      movedBy: userId,
      enteredAt: DateTime.now(),
    })

    await candidate.load('jobRequisition')
    await candidate.load('currentStage')

    return candidate
  }

  /**
   * Atualiza candidato
   */
  async updateCandidate(id: number, data: UpdateCandidateData) {
    const candidate = await Candidate.findOrFail(id)

    if (candidate.status !== 'active') {
      throw new Error('Nao e possivel atualizar candidato inativo')
    }

    candidate.merge(data)
    await candidate.save()

    await candidate.load('jobRequisition')
    await candidate.load('currentStage')

    return candidate
  }

  /**
   * Move candidato para outra etapa
   */
  async moveToStage(
    candidateId: number,
    stageId: number,
    userId: number,
    feedback?: string | null,
    score?: number | null
  ) {
    const trx = await db.transaction()

    try {
      // Buscar candidato
      const candidate = await Candidate.query().useTransaction(trx).where('id', candidateId).firstOrFail()

      if (candidate.status !== 'active') {
        throw new Error('Nao e possivel mover candidato inativo')
      }

      const newStage = await RecruitmentStage.findOrFail(stageId)

      if (!newStage.isActive) {
        throw new Error('Etapa de destino nao esta ativa')
      }

      if (candidate.currentStageId === stageId) {
        throw new Error('Candidato ja esta nesta etapa')
      }

      // Fechar etapa atual
      await CandidateStageHistory.query()
        .useTransaction(trx)
        .where('candidateId', candidateId)
        .whereNull('leftAt')
        .update({
          leftAt: DateTime.now().toSQL(),
          feedback: feedback || null,
          score: score || null,
        })

      // Criar nova etapa
      await CandidateStageHistory.create(
        {
          candidateId,
          stageId,
          movedBy: userId,
          enteredAt: DateTime.now(),
        },
        { client: trx }
      )

      // Atualizar candidato
      candidate.useTransaction(trx)
      candidate.currentStageId = stageId
      await candidate.save()

      await trx.commit()

      await candidate.load('currentStage')
      await candidate.load('jobRequisition')

      return candidate
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Contrata candidato
   */
  async hireCandidate(candidateId: number, userId: number) {
    const candidate = await Candidate.findOrFail(candidateId)

    if (candidate.status !== 'active') {
      throw new Error('Apenas candidatos ativos podem ser contratados')
    }

    // Fecha a etapa atual
    await CandidateStageHistory.query()
      .where('candidateId', candidateId)
      .whereNull('leftAt')
      .update({
        leftAt: DateTime.now(),
        feedback: 'Candidato contratado',
        movedBy: userId,
      })

    candidate.status = 'hired'
    await candidate.save()

    await candidate.load('jobRequisition')
    await candidate.load('currentStage')

    return candidate
  }

  /**
   * Rejeita candidato
   */
  async rejectCandidate(candidateId: number, userId: number, feedback?: string | null) {
    const candidate = await Candidate.findOrFail(candidateId)

    if (candidate.status !== 'active') {
      throw new Error('Apenas candidatos ativos podem ser rejeitados')
    }

    // Fecha a etapa atual
    await CandidateStageHistory.query()
      .where('candidateId', candidateId)
      .whereNull('leftAt')
      .update({
        leftAt: DateTime.now(),
        feedback: feedback || 'Candidato rejeitado',
        movedBy: userId,
      })

    candidate.status = 'rejected'
    await candidate.save()

    await candidate.load('jobRequisition')
    await candidate.load('currentStage')

    return candidate
  }

  // ==========================================
  // Entrevistas (Interviews)
  // ==========================================

  /**
   * Lista entrevistas de um candidato
   */
  async listInterviews(candidateId: number) {
    await Candidate.findOrFail(candidateId)

    return await Interview.query()
      .where('candidateId', candidateId)
      .preload('interviewer')
      .preload('stage')
      .orderBy('scheduledAt', 'desc')
  }

  /**
   * Lista todas as entrevistas com filtros
   */
  async listAllInterviews(filters: { limit?: number; status?: string } = {}) {
    const query = Interview.query()
      .preload('candidate')
      .preload('interviewer')
      .preload('stage')
      .orderBy('scheduledAt', 'desc')
      .limit(filters.limit || 100)

    if (filters.status) {
      query.where('status', filters.status)
    }

    return query
  }

  /**
   * Cria nova entrevista
   */
  async createInterview(data: CreateInterviewData) {
    const candidate = await Candidate.findOrFail(data.candidateId)

    if (candidate.status !== 'active') {
      throw new Error('Candidato nao esta ativo')
    }

    const interview = await Interview.create({
      candidateId: data.candidateId,
      interviewerId: data.interviewerId,
      stageId: data.stageId,
      scheduledAt: DateTime.fromISO(data.scheduledAt),
      durationMinutes: data.durationMinutes || null,
      location: data.location || null,
      meetingLink: data.meetingLink || null,
      status: 'scheduled',
    })

    await interview.load('candidate')
    await interview.load('interviewer')
    await interview.load('stage')

    return interview
  }

  /**
   * Atualiza entrevista
   */
  async updateInterview(id: number, data: UpdateInterviewData) {
    const interview = await Interview.findOrFail(id)

    if (interview.status !== 'scheduled') {
      throw new Error('Apenas entrevistas agendadas podem ser atualizadas')
    }

    if (data.scheduledAt) {
      interview.scheduledAt = DateTime.fromISO(data.scheduledAt)
    }

    interview.merge({
      interviewerId: data.interviewerId,
      stageId: data.stageId,
      durationMinutes: data.durationMinutes,
      location: data.location,
      meetingLink: data.meetingLink,
    })

    await interview.save()

    await interview.load('candidate')
    await interview.load('interviewer')
    await interview.load('stage')

    return interview
  }

  /**
   * Completa entrevista com feedback
   */
  async completeInterview(id: number, feedback?: string | null, score?: number | null) {
    const interview = await Interview.findOrFail(id)

    if (interview.status === 'completed') {
      throw new Error('Entrevista ja foi finalizada')
    }

    if (interview.status === 'cancelled') {
      throw new Error('Entrevista foi cancelada')
    }

    interview.status = 'completed'
    interview.feedback = feedback || null
    interview.score = score || null
    await interview.save()

    await interview.load('candidate')
    await interview.load('interviewer')
    await interview.load('stage')

    return interview
  }

  /**
   * Cancela entrevista
   */
  async cancelInterview(id: number) {
    const interview = await Interview.findOrFail(id)

    if (interview.status === 'completed') {
      throw new Error('Nao e possivel cancelar entrevista finalizada')
    }

    if (interview.status === 'cancelled') {
      throw new Error('Entrevista ja foi cancelada')
    }

    interview.status = 'cancelled'
    await interview.save()

    await interview.load('candidate')
    await interview.load('interviewer')
    await interview.load('stage')

    return interview
  }

  // ==========================================
  // Dashboard/Stats
  // ==========================================

  /**
   * Retorna estatisticas gerais de recrutamento
   */
  async getRecruitmentDashboard() {
    const openRequisitions = await JobRequisition.query()
      .where('status', 'open')
      .count('* as total')

    const activeCandidates = await Candidate.query().where('status', 'active').count('* as total')

    const scheduledInterviews = await Interview.query()
      .where('status', 'scheduled')
      .where('scheduledAt', '>=', DateTime.now().toSQL())
      .count('* as total')

    const hiredThisMonth = await Candidate.query()
      .where('status', 'hired')
      .where('updatedAt', '>=', DateTime.now().startOf('month').toSQL())
      .count('* as total')

    return {
      openRequisitions: toNumber(openRequisitions[0].$extras.total),
      activeCandidates: toNumber(activeCandidates[0].$extras.total),
      scheduledInterviews: toNumber(scheduledInterviews[0].$extras.total),
      hiredThisMonth: toNumber(hiredThisMonth[0].$extras.total),
    }
  }
}

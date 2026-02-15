import Candidate from '#models/candidate'
import RecruitmentStage from '#models/recruitment_stage'
import CandidateStageHistory from '#models/candidate_stage_history'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class KanbanService {
  /**
   * Retorna board kanban de uma vaga agrupado por stage
   */
  async getBoard(requisitionId: number) {
    const stages = await RecruitmentStage.query().orderBy('display_order', 'asc')

    const board = []

    for (const stage of stages) {
      const candidates = await Candidate.query()
        .where('jobRequisitionId', requisitionId)
        .where('currentStageId', stage.id)
        .where('status', 'active')
        .orderBy('created_at', 'asc')

      board.push({
        stage: {
          id: stage.id,
          name: stage.name,
          displayOrder: stage.displayOrder,
        },
        candidates: candidates.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          source: c.source,
          salaryExpectation: c.salaryExpectation,
          resumePath: c.resumePath,
        })),
      })
    }

    return board
  }

  /**
   * Move candidato entre stages
   */
  async moveCandidate(
    candidateId: number,
    toStageId: number,
    _position?: number,
    userId?: number
  ) {
    const candidate = await Candidate.query()
      .where('id', candidateId)
      .preload('currentStage')
      .firstOrFail()

    const oldStageId = candidate.currentStageId
    const oldStage = candidate.currentStage

    const newStage = await RecruitmentStage.findOrFail(toStageId)

    // Atualiza stage atual
    candidate.currentStageId = toStageId
    await candidate.save()

    // Registra no historico
    await CandidateStageHistory.create({
      candidateId,
      stageId: toStageId,
      movedBy: userId ?? undefined,
      enteredAt: DateTime.now(),
    })

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'update',
      resourceType: 'candidate',
      resourceId: candidate.id,
      description: `Candidato ${candidate.name} movido: ${oldStage.name} → ${newStage.name}`,
      oldValues: { stageId: oldStageId, stageName: oldStage.name },
      newValues: { stageId: toStageId, stageName: newStage.name },
    })

    await candidate.load('currentStage')
    return candidate
  }

  /**
   * Retorna estatisticas do board
   */
  async getBoardStats(requisitionId: number) {
    // Total por stage
    const totalByStage = await db
      .from('candidates')
      .select('current_stage_id')
      .join('recruitment_stages', 'recruitment_stages.id', 'candidates.current_stage_id')
      .select('recruitment_stages.name as stage_name')
      .where('candidates.job_requisition_id', requisitionId)
      .where('candidates.status', 'active')
      .groupBy('current_stage_id', 'recruitment_stages.name')
      .count('* as total')

    // Tempo medio em cada stage
    const avgTimeByStage = await db.rawQuery(
      `
      SELECT
        csh.stage_id,
        rs.name as stage_name,
        AVG(EXTRACT(EPOCH FROM (COALESCE(csh.left_at, NOW()) - csh.entered_at)) / 86400) as avg_days
      FROM candidate_stage_history csh
      JOIN recruitment_stages rs ON rs.id = csh.stage_id
      JOIN candidates c ON c.id = csh.candidate_id
      WHERE c.job_requisition_id = ?
        AND c.status = 'active'
      GROUP BY csh.stage_id, rs.name
      ORDER BY csh.stage_id
    `,
      [requisitionId]
    )

    // Conversion rate entre stages
    const stages = await RecruitmentStage.query().orderBy('display_order', 'asc')
    const conversionRates = []

    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i]
      const nextStage = stages[i + 1]

      const currentCount = await Candidate.query()
        .where('jobRequisitionId', requisitionId)
        .where('currentStageId', currentStage.id)
        .count('* as total')

      const nextCount = await Candidate.query()
        .where('jobRequisitionId', requisitionId)
        .where('currentStageId', nextStage.id)
        .count('* as total')

      const current = Number(currentCount[0].$extras.total)
      const next = Number(nextCount[0].$extras.total)

      conversionRates.push({
        fromStage: currentStage.name,
        toStage: nextStage.name,
        rate: current > 0 ? Math.round((next / current) * 100) : 0,
      })
    }

    return {
      totalByStage: totalByStage.map((t) => ({
        stageId: t.current_stage_id,
        stageName: t.stage_name,
        total: Number(t.total),
      })),
      avgTimeByStage: avgTimeByStage.rows.map((t: any) => ({
        stageId: t.stage_id,
        stageName: t.stage_name,
        avgDays: t.avg_days ? Math.round(Number(t.avg_days)) : null,
      })),
      conversionRates,
    }
  }
}

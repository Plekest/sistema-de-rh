import Employee from '#models/employee'
import TurnoverRecord from '#models/turnover_record'
import Evaluation from '#models/evaluation'
import TrainingEnrollment from '#models/training_enrollment'
import EngagementScore from '#models/engagement_score'
import AnalyticsSnapshot from '#models/analytics_snapshot'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class PeopleAnalyticsService {
  /**
   * Visao geral da forca de trabalho
   */
  async getWorkforceOverview() {
    // Total de colaboradores
    const totalHeadcount = await Employee.query().where('status', 'active').count('* as total')
    const total = Number(totalHeadcount[0].$extras.total)

    // Por departamento
    const byDepartment = await db
      .from('employees')
      .select('department_id')
      .join('departments', 'departments.id', 'employees.department_id')
      .select('departments.name as department_name')
      .where('employees.status', 'active')
      .groupBy('department_id', 'departments.name')
      .count('* as total')

    // Por tipo (CLT/PJ)
    const byType = await db
      .from('employees')
      .select('type')
      .where('status', 'active')
      .groupBy('type')
      .count('* as total')

    // Por status
    const byStatus = await db.from('employees').select('status').groupBy('status').count('* as total')

    // Idade media
    const avgAgeResult = await db.rawQuery(
      `
      SELECT AVG(EXTRACT(YEAR FROM AGE(birth_date))) as avg_age
      FROM employees
      WHERE status = 'active' AND birth_date IS NOT NULL
    `
    )
    const avgAge = avgAgeResult.rows[0]?.avg_age ? Math.round(Number(avgAgeResult.rows[0].avg_age)) : null

    // Tenure medio (em meses)
    const avgTenureResult = await db.rawQuery(
      `
      SELECT AVG(EXTRACT(YEAR FROM AGE(NOW(), hire_date)) * 12 + EXTRACT(MONTH FROM AGE(NOW(), hire_date))) as avg_tenure_months
      FROM employees
      WHERE status = 'active'
    `
    )
    const avgTenureMonths = avgTenureResult.rows[0]?.avg_tenure_months
      ? Math.round(Number(avgTenureResult.rows[0].avg_tenure_months))
      : null

    return {
      totalHeadcount: total,
      byDepartment: byDepartment.map((d) => ({
        departmentId: d.department_id,
        departmentName: d.department_name,
        count: Number(d.total),
      })),
      byType: byType.map((t) => ({ type: t.type, count: Number(t.total) })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.total) })),
      avgAge,
      avgTenureMonths,
      avgTenureYears: avgTenureMonths ? Math.round((avgTenureMonths / 12) * 10) / 10 : null,
    }
  }

  /**
   * Analise de retencao (turnover)
   */
  async getRetentionAnalysis(months: number = 12) {
    const endDate = DateTime.now()
    const startDate = endDate.minus({ months })

    // Total de desligamentos no periodo
    const turnovers = await TurnoverRecord.query().whereBetween('exit_date', [
      startDate.toSQLDate()!,
      endDate.toSQLDate()!,
    ])

    const totalTurnovers = turnovers.length

    // Media de colaboradores ativos no periodo
    const activeEmployees = await Employee.query().where('status', 'active').count('* as total')
    const avgActive = Number(activeEmployees[0].$extras.total)

    // Taxa de turnover
    const turnoverRate = avgActive > 0 ? Math.round((totalTurnovers / avgActive) * 100 * 100) / 100 : 0

    // Voluntario vs Involuntario
    const voluntary = turnovers.filter((t) => t.type === 'voluntary').length
    const involuntary = turnovers.filter((t) => t.type === 'involuntary').length

    // Por departamento
    const byDepartment = await db
      .from('turnover_records')
      .select('department_id')
      .join('departments', 'departments.id', 'turnover_records.department_id')
      .select('departments.name as department_name')
      .whereBetween('exit_date', [startDate.toSQLDate()!, endDate.toSQLDate()!])
      .groupBy('department_id', 'departments.name')
      .count('* as total')

    // Por faixa de tenure
    const byTenureRange = await db.rawQuery(
      `
      SELECT
        CASE
          WHEN tenure_months < 6 THEN '0-6 months'
          WHEN tenure_months < 12 THEN '6-12 months'
          WHEN tenure_months < 24 THEN '1-2 years'
          WHEN tenure_months < 60 THEN '2-5 years'
          ELSE '5+ years'
        END as tenure_range,
        COUNT(*) as total
      FROM turnover_records
      WHERE exit_date BETWEEN ? AND ?
      GROUP BY tenure_range
      ORDER BY MIN(tenure_months)
    `,
      [startDate.toSQLDate(), endDate.toSQLDate()]
    )

    return {
      turnoverRate,
      totalTurnovers,
      voluntary,
      involuntary,
      byDepartment: byDepartment.map((d) => ({
        departmentId: d.department_id,
        departmentName: d.department_name,
        count: Number(d.total),
      })),
      byTenureRange: byTenureRange.rows.map((r: any) => ({
        range: r.tenure_range,
        count: Number(r.total),
      })),
    }
  }

  /**
   * Distribuicao de desempenho
   */
  async getPerformanceDistribution(cycleId?: number) {
    const query = Evaluation.query().where('status', 'submitted')

    if (cycleId) {
      query.where('cycle_id', cycleId)
    }

    const evaluations = await query

    if (evaluations.length === 0) {
      return {
        totalEvaluations: 0,
        avgScore: null,
        distribution: [],
        topPerformers: [],
        bottomPerformers: [],
      }
    }

    // Score medio
    const totalScore = evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0)
    const avgScore = Math.round((totalScore / evaluations.length) * 100) / 100

    // Distribuicao por faixa
    const distribution = [
      { range: '0-20', count: evaluations.filter((e) => (e.overallScore || 0) <= 20).length },
      {
        range: '21-40',
        count: evaluations.filter((e) => (e.overallScore || 0) > 20 && (e.overallScore || 0) <= 40).length,
      },
      {
        range: '41-60',
        count: evaluations.filter((e) => (e.overallScore || 0) > 40 && (e.overallScore || 0) <= 60).length,
      },
      {
        range: '61-80',
        count: evaluations.filter((e) => (e.overallScore || 0) > 60 && (e.overallScore || 0) <= 80).length,
      },
      {
        range: '81-100',
        count: evaluations.filter((e) => (e.overallScore || 0) > 80 && (e.overallScore || 0) <= 100).length,
      },
    ]

    // Top 10 performers
    const topEvals = [...evaluations].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0)).slice(0, 10)
    const topPerformers = await Promise.all(
      topEvals.map(async (e) => {
        const employee = await Employee.find(e.employeeId)
        return {
          employeeId: e.employeeId,
          employeeName: employee?.fullName || 'Unknown',
          score: e.overallScore,
        }
      })
    )

    // Bottom 10 performers
    const bottomEvals = [...evaluations].sort((a, b) => (a.overallScore || 0) - (b.overallScore || 0)).slice(0, 10)
    const bottomPerformers = await Promise.all(
      bottomEvals.map(async (e) => {
        const employee = await Employee.find(e.employeeId)
        return {
          employeeId: e.employeeId,
          employeeName: employee?.fullName || 'Unknown',
          score: e.overallScore,
        }
      })
    )

    return {
      totalEvaluations: evaluations.length,
      avgScore,
      distribution,
      topPerformers,
      bottomPerformers,
    }
  }

  /**
   * Efetividade de treinamentos
   */
  async getTrainingEffectiveness() {
    // Taxa de conclusao
    const enrollments = await TrainingEnrollment.query()
    const completed = enrollments.filter((e) => e.status === 'completed').length
    const completionRate =
      enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100 * 100) / 100 : 0

    // Score medio apos treinamento
    const completedWithScore = enrollments.filter((e) => e.status === 'completed' && e.score)
    const avgScore =
      completedWithScore.length > 0
        ? Math.round(
            (completedWithScore.reduce((sum, e) => sum + (e.score || 0), 0) / completedWithScore.length) *
              100
          ) / 100
        : null

    // Budget utilization (simulado - precisaria de tabela de budget)
    const budgetUtilization = null

    return {
      totalEnrollments: enrollments.length,
      completedEnrollments: completed,
      completionRate,
      avgScore,
      budgetUtilization,
    }
  }

  /**
   * Visao geral de engajamento
   */
  async getEngagementOverview() {
    const now = DateTime.now()

    // Score medio atual (mes atual)
    const currentScores = await EngagementScore.query()
      .where('reference_month', now.month)
      .where('reference_year', now.year)

    const currentAvg =
      currentScores.length > 0
        ? Math.round(
            (currentScores.reduce((sum, s) => sum + s.score, 0) / currentScores.length) * 100
          ) / 100
        : null

    // Tendencia dos ultimos 6 meses
    const sixMonthsAgo = now.minus({ months: 6 })
    const trend = await db.rawQuery(
      `
      SELECT reference_year, reference_month, AVG(score) as avg_score
      FROM engagement_scores
      WHERE (reference_year > ? OR (reference_year = ? AND reference_month >= ?))
      GROUP BY reference_year, reference_month
      ORDER BY reference_year, reference_month
    `,
      [sixMonthsAgo.year, sixMonthsAgo.year, sixMonthsAgo.month]
    )

    // Departamentos abaixo do threshold (< 60)
    const belowThreshold = await db.rawQuery(
      `
      SELECT e.department_id, d.name as department_name, AVG(es.score) as avg_score
      FROM engagement_scores es
      JOIN employees e ON e.id = es.employee_id
      JOIN departments d ON d.id = e.department_id
      WHERE es.reference_month = ? AND es.reference_year = ?
      GROUP BY e.department_id, d.name
      HAVING AVG(es.score) < 60
    `,
      [now.month, now.year]
    )

    // Colaboradores em risco (score < 50)
    const riskEmployees = await db.rawQuery(
      `
      SELECT es.employee_id, e.full_name, es.score
      FROM engagement_scores es
      JOIN employees e ON e.id = es.employee_id
      WHERE es.reference_month = ? AND es.reference_year = ? AND es.score < 50
      ORDER BY es.score ASC
    `,
      [now.month, now.year]
    )

    return {
      currentAvgScore: currentAvg,
      trend: trend.rows.map((r: any) => ({
        year: Number(r.reference_year),
        month: Number(r.reference_month),
        avgScore: Math.round(Number(r.avg_score) * 100) / 100,
      })),
      departmentsBelowThreshold: belowThreshold.rows.map((r: any) => ({
        departmentId: r.department_id,
        departmentName: r.department_name,
        avgScore: Math.round(Number(r.avg_score) * 100) / 100,
      })),
      riskEmployees: riskEmployees.rows.map((r: any) => ({
        employeeId: r.employee_id,
        employeeName: r.full_name,
        score: Number(r.score),
      })),
    }
  }

  /**
   * Analise de compensacao
   */
  async getCompensationAnalysis() {
    // Salario medio por departamento
    const byDepartment = await db
      .from('employees')
      .select('department_id')
      .join('departments', 'departments.id', 'employees.department_id')
      .select('departments.name as department_name')
      .where('employees.status', 'active')
      .whereNotNull('employees.salary')
      .groupBy('department_id', 'departments.name')
      .avg('employees.salary as avg_salary')

    // Salario medio por cargo
    const byPosition = await db
      .from('employees')
      .select('position_id')
      .join('positions', 'positions.id', 'employees.position_id')
      .select('positions.title as position_title')
      .where('employees.status', 'active')
      .whereNotNull('employees.salary')
      .groupBy('position_id', 'positions.title')
      .avg('employees.salary as avg_salary')

    // Pay equity ratio (simulado - precisaria de mais dados demograficos)
    const payEquityRatio = null

    // Salary range utilization (simulado - precisaria de ranges definidos)
    const salaryRangeUtilization = null

    return {
      byDepartment: byDepartment.map((d) => ({
        departmentId: d.department_id,
        departmentName: d.department_name,
        avgSalary: Math.round(Number(d.avg_salary)),
      })),
      byPosition: byPosition.map((p) => ({
        positionId: p.position_id,
        positionTitle: p.position_title,
        avgSalary: Math.round(Number(p.avg_salary)),
      })),
      payEquityRatio,
      salaryRangeUtilization,
    }
  }

  /**
   * Insights preditivos
   */
  async getPredictiveInsights() {
    const now = DateTime.now()

    // Risco de attrition: baixo engajamento + sem promocao em 2+ anos
    const attritionRisk = await db.rawQuery(
      `
      SELECT DISTINCT e.id, e.full_name, es.score as engagement_score, e.hire_date
      FROM employees e
      LEFT JOIN engagement_scores es ON es.employee_id = e.id
        AND es.reference_month = ? AND es.reference_year = ?
      WHERE e.status = 'active'
        AND (es.score < 60 OR es.score IS NULL)
        AND NOT EXISTS (
          SELECT 1 FROM employee_histories eh
          WHERE eh.employee_id = e.id
            AND eh.type = 'promotion'
            AND eh.event_date > NOW() - INTERVAL '2 years'
        )
      ORDER BY es.score ASC NULLS LAST
      LIMIT 20
    `,
      [now.month, now.year]
    )

    // Exames ocupacionais vencendo (proximos 30 dias)
    const upcomingExamsResult = await db.rawQuery(
      `
      SELECT COUNT(*) as total
      FROM occupational_exams
      WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
        AND status != 'cancelled'
    `
    )
    const upcomingExamsCount = Number(upcomingExamsResult.rows[0]?.total || 0)

    // Avisos de saldo de ferias (saldo > 30 dias)
    const leaveBalanceWarnings = await db.rawQuery(
      `
      SELECT e.id, e.full_name, lb.remaining_days
      FROM employees e
      JOIN leave_balances lb ON lb.employee_id = e.id
      WHERE e.status = 'active' AND lb.remaining_days > 30
      ORDER BY lb.remaining_days DESC
      LIMIT 20
    `
    )

    return {
      attritionRisk: attritionRisk.rows.map((r: any) => ({
        employeeId: r.id,
        employeeName: r.full_name,
        engagementScore: r.engagement_score ? Number(r.engagement_score) : null,
        hireDate: r.hire_date,
      })),
      upcomingExamExpirations: upcomingExamsCount,
      leaveBalanceWarnings: leaveBalanceWarnings.rows.map((r: any) => ({
        employeeId: r.id,
        employeeName: r.full_name,
        balanceDays: Number(r.remaining_days),
      })),
    }
  }

  /**
   * Gera snapshot mensal de analytics
   */
  async generateMonthlySnapshot(userId?: number) {
    const now = DateTime.now()

    const workforce = await this.getWorkforceOverview()
    const retention = await this.getRetentionAnalysis(12)
    const performance = await this.getPerformanceDistribution()
    const training = await this.getTrainingEffectiveness()
    const engagement = await this.getEngagementOverview()
    const compensation = await this.getCompensationAnalysis()
    const predictive = await this.getPredictiveInsights()

    const snapshot = await AnalyticsSnapshot.create({
      type: 'monthly_summary',
      referenceMonth: now.month,
      referenceYear: now.year,
      data: {
        workforce,
        retention,
        performance,
        training,
        engagement,
        compensation,
        predictive,
      },
      generatedAt: DateTime.now(),
    })

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'analytics_snapshot',
      resourceId: snapshot.id,
      description: `Snapshot mensal de analytics gerado: ${now.year}-${now.month}`,
    })

    return snapshot
  }

  /**
   * Retorna historico de snapshots
   */
  async getSnapshotHistory(type: string, months: number = 12) {
    const startDate = DateTime.now().minus({ months })

    return await AnalyticsSnapshot.query()
      .where('type', type)
      .where('reference_year', '>=', startDate.year)
      .orderBy('reference_year', 'desc')
      .orderBy('reference_month', 'desc')
  }
}

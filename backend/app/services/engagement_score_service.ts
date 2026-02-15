import EngagementScore from '#models/engagement_score'
import Employee from '#models/employee'
import TimeEntry from '#models/time_entry'
import Leave from '#models/leave'
import Evaluation from '#models/evaluation'
import TrainingEnrollment from '#models/training_enrollment'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class EngagementScoreService {
  /**
   * Calcula engagement score para um colaborador especifico
   */
  async calculateForEmployee(employeeId: number, month: number, year: number, userId?: number) {
    const employee = await Employee.findOrFail(employeeId)

    // Verifica se colaborador esta ativo
    if (employee.status !== 'active') {
      throw new Error('Apenas colaboradores ativos podem ter engagement score calculado')
    }

    const startDate = DateTime.fromObject({ year, month, day: 1 })
    const endDate = startDate.endOf('month')

    // 1. Attendance Score (25% do total)
    const attendanceScore = await this.calculateAttendanceScore(employeeId, startDate, endDate)

    // 2. Performance Score (30% do total)
    const performanceScore = await this.calculatePerformanceScore(employeeId)

    // 3. Training Score (20% do total)
    const trainingScore = await this.calculateTrainingScore(employeeId, startDate, endDate)

    // 4. Tenure Score (15% do total)
    const tenureScore = await this.calculateTenureScore(employee.hireDate)

    // 5. Leave Score (10% do total)
    const leaveScore = await this.calculateLeaveScore(employeeId, startDate, endDate)

    // Calcula score final com ponderacao
    const finalScore = Math.round(
      attendanceScore * 0.25 +
        performanceScore * 0.3 +
        trainingScore * 0.2 +
        tenureScore * 0.15 +
        leaveScore * 0.1
    )

    // Verifica se ja existe score para este mes/ano
    const existing = await EngagementScore.query()
      .where('employeeId', employeeId)
      .where('referenceMonth', month)
      .where('referenceYear', year)
      .first()

    let score: EngagementScore
    if (existing) {
      existing.score = finalScore
      existing.attendanceScore = attendanceScore
      existing.performanceScore = performanceScore
      existing.trainingScore = trainingScore
      existing.tenureScore = tenureScore
      existing.leaveScore = leaveScore
      existing.calculatedAt = DateTime.now()
      await existing.save()
      score = existing
    } else {
      score = await EngagementScore.create({
        employeeId,
        score: finalScore,
        attendanceScore,
        performanceScore,
        trainingScore,
        tenureScore,
        leaveScore,
        referenceMonth: month,
        referenceYear: year,
        calculatedAt: DateTime.now(),
      })
    }

    // Audit log
    await AuditLogService.log({
      userId: userId,
      action: 'create',
      resourceType: 'engagement_score',
      resourceId: score.id,
      description: `Engagement score calculado para ${employee.fullName} - ${month}/${year}: ${finalScore}`,
      newValues: { score: finalScore, month, year },
    })

    return score
  }

  /**
   * Calcula score de presenca (dias presentes / dias uteis * 100)
   */
  private async calculateAttendanceScore(
    employeeId: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<number> {
    const entries = await TimeEntry.query()
      .where('employeeId', employeeId)
      .whereBetween('date', [startDate.toSQLDate()!, endDate.toSQLDate()!])
      .where('type', 'regular')

    const workingDays = this.getWorkingDays(startDate, endDate)
    if (workingDays === 0) return 100

    const presentDays = entries.length
    return Math.min(100, Math.round((presentDays / workingDays) * 100))
  }

  /**
   * Calcula score de performance (media das avaliacoes do ultimo ciclo)
   */
  private async calculatePerformanceScore(employeeId: number): Promise<number> {
    const lastEvaluation = await Evaluation.query()
      .where('employeeId', employeeId)
      .where('status', 'completed')
      .orderBy('completed_at', 'desc')
      .first()

    if (!lastEvaluation) return 50 // Valor neutro se nao houver avaliacao

    // Nota da avaliacao ja esta em escala 0-100
    return Math.round(lastEvaluation.overallScore || 50)
  }

  /**
   * Calcula score de treinamento (completados / total inscritos * 100)
   */
  private async calculateTrainingScore(
    employeeId: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<number> {
    const enrollments = await TrainingEnrollment.query()
      .where('employeeId', employeeId)
      .whereBetween('enrolledAt', [startDate.toSQL()!, endDate.toSQL()!])

    if (enrollments.length === 0) return 100 // Se nao tem treinamentos, score maximo

    const completed = enrollments.filter((e) => e.status === 'completed').length
    return Math.round((completed / enrollments.length) * 100)
  }

  /**
   * Calcula score de tempo de casa (min(100, meses/24 * 100))
   */
  private calculateTenureScore(hireDate: DateTime): number {
    const now = DateTime.now()
    const months = now.diff(hireDate, 'months').months

    return Math.min(100, Math.round((months / 24) * 100))
  }

  /**
   * Calcula score de licencas (100 - dias de licenca / dias uteis * 100)
   */
  private async calculateLeaveScore(
    employeeId: number,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<number> {
    const leaves = await Leave.query()
      .where('employeeId', employeeId)
      .where('status', 'approved')
      .where((query) => {
        query
          .whereBetween('startDate', [startDate.toSQLDate()!, endDate.toSQLDate()!])
          .orWhereBetween('endDate', [startDate.toSQLDate()!, endDate.toSQLDate()!])
      })

    const workingDays = this.getWorkingDays(startDate, endDate)
    if (workingDays === 0) return 100

    let leaveDays = 0
    for (const leave of leaves) {
      const leaveStart = leave.startDate > startDate ? leave.startDate : startDate
      const leaveEnd = leave.endDate < endDate ? leave.endDate : endDate
      leaveDays += this.getWorkingDays(leaveStart, leaveEnd)
    }

    const score = 100 - Math.round((leaveDays / workingDays) * 100)
    return Math.max(0, score)
  }

  /**
   * Calcula dias uteis entre duas datas (exclui sabados e domingos)
   */
  private getWorkingDays(startDate: DateTime, endDate: DateTime): number {
    let count = 0
    let current = startDate

    while (current <= endDate) {
      const dayOfWeek = current.weekday
      if (dayOfWeek !== 6 && dayOfWeek !== 7) {
        // 6=sabado, 7=domingo
        count++
      }
      current = current.plus({ days: 1 })
    }

    return count
  }

  /**
   * Calcula score para todos os colaboradores ativos
   */
  async calculateForAll(month: number, year: number, userId?: number) {
    const employees = await Employee.query().where('status', 'active')

    const results = []
    for (const employee of employees) {
      try {
        const score = await this.calculateForEmployee(employee.id, month, year, userId)
        results.push({ employeeId: employee.id, score: score.score, success: true })
      } catch (error) {
        results.push({ employeeId: employee.id, error: error.message, success: false })
      }
    }

    return results
  }

  /**
   * Retorna historico de scores de um colaborador
   */
  async getEmployeeHistory(employeeId: number, months: number = 12) {
    const scores = await EngagementScore.query()
      .where('employeeId', employeeId)
      .orderBy('referenceYear', 'desc')
      .orderBy('referenceMonth', 'desc')
      .limit(months)

    return scores
  }

  /**
   * Retorna media de engagement por departamento
   */
  async getDepartmentAverage(departmentId: number, month: number, year: number) {
    const result = await db
      .from('engagement_scores')
      .join('employees', 'employees.id', 'engagement_scores.employee_id')
      .where('employees.department_id', departmentId)
      .where('engagement_scores.reference_month', month)
      .where('engagement_scores.reference_year', year)
      .avg('engagement_scores.score as avg_score')
      .first()

    return {
      departmentId,
      month,
      year,
      averageScore: result?.avg_score ? Math.round(Number(result.avg_score)) : null,
    }
  }

  /**
   * Retorna media da empresa
   */
  async getCompanyAverage(month: number, year: number) {
    const result = await EngagementScore.query()
      .where('referenceMonth', month)
      .where('referenceYear', year)
      .avg('score as avg_score')
      .first()

    return {
      month,
      year,
      averageScore: result?.$extras.avg_score
        ? Math.round(Number(result.$extras.avg_score))
        : null,
    }
  }

  /**
   * Retorna ranking dos top N colaboradores por score
   */
  async getRanking(month: number, year: number, limit: number = 10) {
    const scores = await EngagementScore.query()
      .where('referenceMonth', month)
      .where('referenceYear', year)
      .preload('employee', (query) => {
        query.preload('department').preload('position')
      })
      .orderBy('score', 'desc')
      .limit(limit)

    return scores
  }
}

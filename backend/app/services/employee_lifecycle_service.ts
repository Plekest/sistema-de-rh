import Employee from '#models/employee'
import EmployeeHistory from '#models/employee_history'
import Leave from '#models/leave'
import TrainingEnrollment from '#models/training_enrollment'
import Evaluation from '#models/evaluation'
import EmployeeChecklist from '#models/employee_checklist'
import TurnoverRecord from '#models/turnover_record'
import EngagementScore from '#models/engagement_score'
import { DateTime } from 'luxon'

interface TimelineEvent {
  date: string
  type: string
  title: string
  description: string
  source: string
  metadata?: Record<string, any>
}

interface TimelineFilters {
  from?: DateTime
  to?: DateTime
  types?: string[]
}

export default class EmployeeLifecycleService {
  /**
   * Retorna timeline unificada do colaborador
   */
  async getTimeline(employeeId: number, filters: TimelineFilters = {}) {
    const employee = await Employee.findOrFail(employeeId)

    const events: TimelineEvent[] = []

    // 1. Employee Histories (admissao, promocao, transferencia, etc)
    const histories = await EmployeeHistory.query()
      .where('employeeId', employeeId)
      .if(filters.from, (query) => query.where('eventDate', '>=', filters.from!.toSQLDate()!))
      .if(filters.to, (query) => query.where('eventDate', '<=', filters.to!.toSQLDate()!))
      .orderBy('eventDate', 'desc')

    for (const h of histories) {
      if (!filters.types || filters.types.includes('history')) {
        events.push({
          date: h.eventDate,
          type: h.type,
          title: h.title,
          description: h.description || '',
          source: 'history',
          metadata: {
            oldValue: h.oldValue,
            newValue: h.newValue,
          },
        })
      }
    }

    // 2. Leaves (ferias e licencas)
    const leaves = await Leave.query()
      .where('employeeId', employeeId)
      .if(filters.from, (query) => query.where('startDate', '>=', filters.from!.toSQLDate()!))
      .if(filters.to, (query) => query.where('startDate', '<=', filters.to!.toSQLDate()!))
      .orderBy('startDate', 'desc')

    for (const leave of leaves) {
      if (!filters.types || filters.types.includes('leave')) {
        events.push({
          date: leave.startDate.toISODate()!,
          type: 'leave',
          title: `Férias/Licença: ${leave.type}`,
          description: `De ${leave.startDate.toFormat('dd/MM/yyyy')} a ${leave.endDate.toFormat('dd/MM/yyyy')} - Status: ${leave.status}`,
          source: 'leave',
          metadata: {
            leaveType: leave.type,
            status: leave.status,
            days: leave.days,
          },
        })
      }
    }

    // 3. Training Enrollments
    const trainings = await TrainingEnrollment.query()
      .where('employeeId', employeeId)
      .preload('training')
      .if(filters.from, (query) => query.where('enrolledAt', '>=', filters.from!.toSQL()!))
      .if(filters.to, (query) => query.where('enrolledAt', '<=', filters.to!.toSQL()!))
      .orderBy('enrolled_at', 'desc')

    for (const t of trainings) {
      if (!filters.types || filters.types.includes('training')) {
        events.push({
          date: t.enrolledAt.toISODate()!,
          type: 'training',
          title: `Treinamento: ${t.training.title}`,
          description: `Status: ${t.status} - Progresso: ${t.progress}%`,
          source: 'training',
          metadata: {
            trainingId: t.trainingId,
            status: t.status,
            progress: t.progress,
          },
        })
      }
    }

    // 4. Evaluations
    const evaluations = await Evaluation.query()
      .where('employeeId', employeeId)
      .preload('cycle')
      .if(filters.from, (query) =>
        query.where('completedAt', '>=', filters.from!.toSQL()!)
      )
      .if(filters.to, (query) =>
        query.where('completedAt', '<=', filters.to!.toSQL()!)
      )
      .orderBy('completed_at', 'desc')

    for (const evaluation of evaluations) {
      if (!filters.types || filters.types.includes('evaluation')) {
        events.push({
          date: evaluation.completedAt ? evaluation.completedAt.toISODate()! : evaluation.createdAt.toISODate()!,
          type: 'evaluation',
          title: `Avaliação de Desempenho: ${evaluation.cycle.name}`,
          description: `Nota: ${evaluation.overallScore} - Status: ${evaluation.status}`,
          source: 'evaluation',
          metadata: {
            cycleId: evaluation.cycleId,
            score: evaluation.overallScore,
            status: evaluation.status,
          },
        })
      }
    }

    // 5. Employee Checklists (Onboarding)
    const checklists = await EmployeeChecklist.query()
      .where('employeeId', employeeId)
      .preload('template')
      .if(filters.from, (query) => query.where('createdAt', '>=', filters.from!.toSQL()!))
      .if(filters.to, (query) => query.where('createdAt', '<=', filters.to!.toSQL()!))
      .orderBy('created_at', 'desc')

    for (const checklist of checklists) {
      if (!filters.types || filters.types.includes('onboarding')) {
        events.push({
          date: checklist.createdAt.toISODate()!,
          type: 'onboarding',
          title: `Onboarding: ${checklist.template.name}`,
          description: `Status: ${checklist.status}`,
          source: 'onboarding',
          metadata: {
            checklistId: checklist.id,
            status: checklist.status,
          },
        })
      }
    }

    // 6. Turnover Record (desligamento)
    const turnover = await TurnoverRecord.query()
      .where('employeeId', employeeId)
      .if(filters.from, (query) => query.where('exitDate', '>=', filters.from!.toSQLDate()!))
      .if(filters.to, (query) => query.where('exitDate', '<=', filters.to!.toSQLDate()!))
      .first()

    if (turnover && (!filters.types || filters.types.includes('turnover'))) {
      events.push({
        date: turnover.exitDate.toISODate()!,
        type: 'turnover',
        title: `Desligamento: ${turnover.type}`,
        description: turnover.reason || 'Sem motivo informado',
        source: 'turnover',
        metadata: {
          type: turnover.type,
          tenureMonths: turnover.tenureMonths,
          exitInterviewDone: turnover.exitInterviewDone,
        },
      })
    }

    // Ordena todos os eventos por data decrescente
    events.sort((a, b) => {
      const dateA = DateTime.fromISO(a.date)
      const dateB = DateTime.fromISO(b.date)
      return dateB.toMillis() - dateA.toMillis()
    })

    return events
  }

  /**
   * Retorna resumo da jornada do colaborador
   */
  async getSummary(employeeId: number) {
    const employee = await Employee.query()
      .where('id', employeeId)
      .preload('department')
      .preload('position')
      .firstOrFail()

    const now = DateTime.now()
    const tenureMonths = Math.floor(now.diff(employee.hireDate, 'months').months)
    const tenureYears = Math.floor(tenureMonths / 12)

    // Total de promocoes
    const promotions = await EmployeeHistory.query()
      .where('employeeId', employeeId)
      .where('type', 'promotion')
      .count('* as total')

    // Total de treinamentos completados
    const trainingsCompleted = await TrainingEnrollment.query()
      .where('employeeId', employeeId)
      .where('status', 'completed')
      .count('* as total')

    // Engagement score atual
    const latestEngagement = await EngagementScore.query()
      .where('employeeId', employeeId)
      .orderBy('referenceYear', 'desc')
      .orderBy('referenceMonth', 'desc')
      .first()

    // Status de onboarding
    const onboardingChecklist = await EmployeeChecklist.query()
      .where('employeeId', employeeId)
      .orderBy('created_at', 'desc')
      .first()

    return {
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        email: employee.email,
        status: employee.status,
        department: employee.department?.name || null,
        position: employee.position?.title || null,
      },
      tenure: {
        hireDate: employee.hireDate.toISODate(),
        tenureMonths,
        tenureYears,
        tenureDisplay: `${tenureYears} anos e ${tenureMonths % 12} meses`,
      },
      stats: {
        totalPromotions: Number(promotions[0].$extras.total),
        totalTrainingsCompleted: Number(trainingsCompleted[0].$extras.total),
        currentEngagementScore: latestEngagement?.score || null,
        onboardingStatus: onboardingChecklist?.status || null,
      },
    }
  }
}

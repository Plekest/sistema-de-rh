import Training from '#models/training'
import TrainingEnrollment from '#models/training_enrollment'
import Employee from '#models/employee'
import NotificationService from '#services/notification_service'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  status?: string
  type?: string
  category?: string
}

interface CreateTrainingData {
  title: string
  description?: string | null
  type: 'online' | 'presential' | 'hybrid'
  category?: string | null
  instructor?: string | null
  provider?: string | null
  startDate: string
  endDate: string
  durationHours: number
  maxParticipants?: number | null
  location?: string | null
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  isMandatory?: boolean
  notes?: string | null
}

interface UpdateTrainingData {
  title?: string
  description?: string | null
  type?: 'online' | 'presential' | 'hybrid'
  category?: string | null
  instructor?: string | null
  provider?: string | null
  startDate?: string
  endDate?: string
  durationHours?: number
  maxParticipants?: number | null
  location?: string | null
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  isMandatory?: boolean
  notes?: string | null
}

interface UpdateEnrollmentData {
  status?: 'enrolled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  score?: number | null
  certificateUrl?: string | null
  feedback?: string | null
  feedbackRating?: number | null
  notes?: string | null
}

export default class TrainingService {
  private notificationService = new NotificationService()

  /**
   * Lista treinamentos com filtros e paginacao
   */
  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Training.query()
      .preload('creator')
      .preload('enrollments', (enrollmentQuery) => {
        enrollmentQuery.preload('employee')
      })
      .orderBy('start_date', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }
    if (filters.type) {
      query.where('type', filters.type)
    }
    if (filters.category) {
      query.where('category', filters.category)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Busca um treinamento por ID com detalhes completos
   */
  async show(id: number) {
    return await Training.query()
      .where('id', id)
      .preload('creator')
      .preload('enrollments', (enrollmentQuery) => {
        enrollmentQuery.preload('employee', (employeeQuery) => {
          employeeQuery.preload('department').preload('position')
        })
      })
      .firstOrFail()
  }

  /**
   * Cria um novo treinamento
   */
  async create(data: CreateTrainingData, currentUserId?: number) {
    // Valida datas
    const startDate = DateTime.fromISO(data.startDate)
    const endDate = DateTime.fromISO(data.endDate)

    if (endDate < startDate) {
      throw new Error('A data de termino deve ser posterior a data de inicio')
    }

    const training = await Training.create({
      title: data.title,
      description: data.description || null,
      type: data.type,
      category: data.category || null,
      instructor: data.instructor || null,
      provider: data.provider || null,
      startDate,
      endDate,
      durationHours: data.durationHours,
      maxParticipants: data.maxParticipants || null,
      location: data.location || null,
      status: data.status || 'planned',
      isMandatory: data.isMandatory !== undefined ? data.isMandatory : false,
      createdBy: currentUserId || null,
      notes: data.notes || null,
    })

    await training.load('creator')
    return training
  }

  /**
   * Atualiza um treinamento
   */
  async update(id: number, data: UpdateTrainingData) {
    const training = await Training.findOrFail(id)

    // Valida datas se fornecidas
    if (data.startDate || data.endDate) {
      const startDate = data.startDate
        ? DateTime.fromISO(data.startDate)
        : training.startDate
      const endDate = data.endDate
        ? DateTime.fromISO(data.endDate)
        : training.endDate

      if (endDate < startDate) {
        throw new Error('A data de termino deve ser posterior a data de inicio')
      }

      if (data.startDate) training.startDate = startDate
      if (data.endDate) training.endDate = endDate
    }

    // Atualiza campos fornecidos
    if (data.title !== undefined) training.title = data.title
    if (data.description !== undefined) training.description = data.description || null
    if (data.type !== undefined) training.type = data.type
    if (data.category !== undefined) training.category = data.category || null
    if (data.instructor !== undefined) training.instructor = data.instructor || null
    if (data.provider !== undefined) training.provider = data.provider || null
    if (data.durationHours !== undefined) training.durationHours = data.durationHours
    if (data.maxParticipants !== undefined) training.maxParticipants = data.maxParticipants || null
    if (data.location !== undefined) training.location = data.location || null
    if (data.status !== undefined) training.status = data.status
    if (data.isMandatory !== undefined) training.isMandatory = data.isMandatory
    if (data.notes !== undefined) training.notes = data.notes || null

    await training.save()
    await training.load('creator')
    await training.load('enrollments')

    return training
  }

  /**
   * Exclui um treinamento (soft delete - marca como cancelled)
   */
  async delete(id: number) {
    const training = await Training.findOrFail(id)

    if (training.status === 'completed') {
      throw new Error('Treinamentos concluidos nao podem ser cancelados')
    }

    training.status = 'cancelled'
    await training.save()

    // Cancela todas as inscricoes ativas
    await TrainingEnrollment.query()
      .where('trainingId', id)
      .whereIn('status', ['enrolled', 'in_progress'])
      .update({ status: 'cancelled' })

    return training
  }

  /**
   * Inscreve um colaborador em um treinamento
   */
  async enroll(trainingId: number, employeeId: number) {
    const training = await Training.findOrFail(trainingId)
    const employee = await Employee.findOrFail(employeeId)

    if (employee.status !== 'active') {
      throw new Error('Apenas colaboradores ativos podem ser inscritos em treinamentos')
    }

    if (training.status === 'cancelled') {
      throw new Error('Nao e possivel se inscrever em treinamentos cancelados')
    }

    if (training.status === 'completed') {
      throw new Error('Nao e possivel se inscrever em treinamentos concluidos')
    }

    // Verifica se ja existe inscricao
    const existing = await TrainingEnrollment.query()
      .where('trainingId', trainingId)
      .where('employeeId', employeeId)
      .first()

    if (existing) {
      throw new Error('Colaborador ja inscrito neste treinamento')
    }

    // Verifica limite de participantes
    if (training.maxParticipants) {
      const enrolledCount = await TrainingEnrollment.query()
        .where('trainingId', trainingId)
        .whereIn('status', ['enrolled', 'in_progress', 'completed'])
        .count('* as total')

      if (enrolledCount[0].$extras.total >= training.maxParticipants) {
        throw new Error('Treinamento ja atingiu o limite maximo de participantes')
      }
    }

    const enrollment = await TrainingEnrollment.create({
      trainingId,
      employeeId,
      status: 'enrolled',
      enrolledAt: DateTime.now(),
    })

    await enrollment.load('training')
    await enrollment.load('employee')

    // Envia notificacao para o colaborador (se tiver usuario vinculado)
    if (employee.userId) {
      await this.notificationService
        .create(employee.userId, {
          type: 'training_enrollment',
          title: 'Inscricao em Treinamento',
          message: `Voce foi inscrito no treinamento "${training.title}" que inicia em ${training.startDate.toFormat('dd/MM/yyyy')}.`,
          metadata: {
            trainingId: training.id,
            enrollmentId: enrollment.id,
          },
        })
        .catch(() => {})
    }

    return enrollment
  }

  /**
   * Inscreve varios colaboradores em um treinamento
   */
  async bulkEnroll(trainingId: number, employeeIds: number[]) {
    const training = await Training.findOrFail(trainingId)

    if (training.status === 'cancelled') {
      throw new Error('Nao e possivel se inscrever em treinamentos cancelados')
    }

    if (training.status === 'completed') {
      throw new Error('Nao e possivel se inscrever em treinamentos concluidos')
    }

    // Verifica limite de participantes
    if (training.maxParticipants) {
      const enrolledCount = await TrainingEnrollment.query()
        .where('trainingId', trainingId)
        .whereIn('status', ['enrolled', 'in_progress', 'completed'])
        .count('* as total')

      const currentCount = enrolledCount[0].$extras.total
      if (currentCount + employeeIds.length > training.maxParticipants) {
        throw new Error(
          `Limite de participantes excedido. Vagas disponiveis: ${training.maxParticipants - currentCount}`
        )
      }
    }

    const enrollments = []
    const errors = []

    for (const employeeId of employeeIds) {
      try {
        const employee = await Employee.findOrFail(employeeId)

        if (employee.status !== 'active') {
          errors.push({ employeeId, error: 'Colaborador nao esta ativo' })
          continue
        }

        // Verifica se ja existe inscricao
        const existing = await TrainingEnrollment.query()
          .where('trainingId', trainingId)
          .where('employeeId', employeeId)
          .first()

        if (existing) {
          errors.push({ employeeId, error: 'Ja inscrito' })
          continue
        }

        const enrollment = await TrainingEnrollment.create({
          trainingId,
          employeeId,
          status: 'enrolled',
          enrolledAt: DateTime.now(),
        })

        await enrollment.load('employee')
        enrollments.push(enrollment)

        // Envia notificacao
        if (employee.userId) {
          await this.notificationService
            .create(employee.userId, {
              type: 'training_enrollment',
              title: 'Inscricao em Treinamento',
              message: `Voce foi inscrito no treinamento "${training.title}" que inicia em ${training.startDate.toFormat('dd/MM/yyyy')}.`,
              metadata: {
                trainingId: training.id,
                enrollmentId: enrollment.id,
              },
            })
            .catch(() => {})
        }
      } catch (error) {
        errors.push({ employeeId, error: error.message })
      }
    }

    return { enrollments, errors }
  }

  /**
   * Atualiza status/dados de uma inscricao
   */
  async updateEnrollment(enrollmentId: number, data: UpdateEnrollmentData) {
    const enrollment = await TrainingEnrollment.query()
      .where('id', enrollmentId)
      .preload('training')
      .preload('employee')
      .firstOrFail()

    // Atualiza campos fornecidos
    if (data.status !== undefined) {
      enrollment.status = data.status

      // Se mudou para completed, marca data de conclusao
      if (data.status === 'completed' && !enrollment.completedAt) {
        enrollment.completedAt = DateTime.now()

        // Envia notificacao de conclusao
        if (enrollment.employee.userId) {
          await this.notificationService
            .create(enrollment.employee.userId, {
              type: 'training_completed',
              title: 'Treinamento Concluido',
              message: `Parabens! Voce concluiu o treinamento "${enrollment.training.title}".`,
              metadata: {
                trainingId: enrollment.trainingId,
                enrollmentId: enrollment.id,
                score: data.score,
              },
            })
            .catch(() => {})
        }
      }
    }

    if (data.score !== undefined) enrollment.score = data.score
    if (data.certificateUrl !== undefined) enrollment.certificateUrl = data.certificateUrl || null
    if (data.feedback !== undefined) enrollment.feedback = data.feedback || null
    if (data.feedbackRating !== undefined) enrollment.feedbackRating = data.feedbackRating || null
    if (data.notes !== undefined) enrollment.notes = data.notes || null

    await enrollment.save()
    await enrollment.load('training')
    await enrollment.load('employee')

    return enrollment
  }

  /**
   * Lista treinamentos de um colaborador
   */
  async getEmployeeTrainings(employeeId: number) {
    await Employee.findOrFail(employeeId)

    return await TrainingEnrollment.query()
      .where('employeeId', employeeId)
      .preload('training', (trainingQuery) => {
        trainingQuery.preload('creator')
      })
      .orderBy('enrolled_at', 'desc')
  }

  /**
   * Retorna estatisticas gerais de treinamentos
   */
  async getStats() {
    const total = await Training.query().count('* as total')
    const inProgress = await Training.query()
      .where('status', 'in_progress')
      .count('* as total')
    const completed = await Training.query()
      .where('status', 'completed')
      .count('* as total')
    const planned = await Training.query()
      .where('status', 'planned')
      .count('* as total')

    const totalEnrollments = await TrainingEnrollment.query().count('* as total')
    const completedEnrollments = await TrainingEnrollment.query()
      .where('status', 'completed')
      .count('* as total')

    const completionRate =
      totalEnrollments[0].$extras.total > 0
        ? (completedEnrollments[0].$extras.total / totalEnrollments[0].$extras.total) * 100
        : 0

    return {
      total: total[0].$extras.total,
      inProgress: inProgress[0].$extras.total,
      completed: completed[0].$extras.total,
      planned: planned[0].$extras.total,
      totalEnrollments: totalEnrollments[0].$extras.total,
      completedEnrollments: completedEnrollments[0].$extras.total,
      completionRate: Math.round(completionRate * 100) / 100,
    }
  }
}

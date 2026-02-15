import Survey from '#models/survey'
import SurveyQuestion from '#models/survey_question'
import SurveyResponse from '#models/survey_response'
import SurveyAnswer from '#models/survey_answer'
import Employee from '#models/employee'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'

interface ListSurveysFilters {
  page?: number
  limit?: number
  status?: 'draft' | 'active' | 'closed' | 'archived'
  type?: 'pulse' | 'enps' | 'climate' | 'satisfaction' | 'custom'
}

interface QuestionData {
  text: string
  type: 'scale' | 'multiple_choice' | 'text' | 'yes_no' | 'enps'
  options?: string[] | null
  order?: number
  isRequired?: boolean
}

interface CreateSurveyData {
  title: string
  description?: string | null
  type: 'pulse' | 'enps' | 'climate' | 'satisfaction' | 'custom'
  isAnonymous?: boolean
  startDate?: string | null
  endDate?: string | null
  targetDepartments?: number[] | null
  questions?: QuestionData[]
}

interface UpdateSurveyData {
  title?: string
  description?: string | null
  type?: 'pulse' | 'enps' | 'climate' | 'satisfaction' | 'custom'
  isAnonymous?: boolean
  startDate?: string | null
  endDate?: string | null
  targetDepartments?: number[] | null
}

interface AnswerData {
  questionId: number
  value?: string | null
  numericValue?: number | null
}

interface RespondSurveyData {
  answers: AnswerData[]
}

export default class SurveyService {
  // ==================== SURVEYS ====================

  async list(filters: ListSurveysFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Survey.query().preload('creator').orderBy('created_at', 'desc')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async create(data: CreateSurveyData, currentUserId?: number) {
    const survey = await Survey.create({
      title: data.title,
      description: data.description || null,
      type: data.type,
      status: 'draft',
      isAnonymous: data.isAnonymous ?? false,
      startDate: data.startDate ? DateTime.fromISO(data.startDate) : null,
      endDate: data.endDate ? DateTime.fromISO(data.endDate) : null,
      targetDepartments: data.targetDepartments || null,
      createdBy: currentUserId || null,
    })

    // Criar perguntas se fornecidas
    if (data.questions && data.questions.length > 0) {
      for (const [index, questionData] of data.questions.entries()) {
        await SurveyQuestion.create({
          surveyId: survey.id,
          text: questionData.text,
          type: questionData.type,
          options: questionData.options || null,
          order: questionData.order ?? index + 1,
          isRequired: questionData.isRequired ?? true,
        })
      }
    }

    await survey.load('creator')
    await survey.load('questions')

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'survey',
      resourceId: survey.id,
      description: `Pesquisa criada: ${survey.title}`,
      newValues: { title: survey.title, type: survey.type },
    })

    return survey
  }

  async show(id: number) {
    const survey = await Survey.query()
      .where('id', id)
      .preload('creator')
      .preload('questions', (query) => query.orderBy('order', 'asc'))
      .firstOrFail()

    return survey
  }

  async update(id: number, data: UpdateSurveyData, currentUserId?: number) {
    const survey = await Survey.findOrFail(id)

    if (survey.status !== 'draft') {
      throw new Error('Apenas pesquisas em rascunho podem ser editadas')
    }

    const updateData: any = { ...data }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? DateTime.fromISO(data.startDate) : null
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? DateTime.fromISO(data.endDate) : null
    }

    survey.merge(updateData)
    await survey.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'survey',
      resourceId: survey.id,
      description: `Pesquisa atualizada: ${survey.title}`,
      newValues: data,
    })

    return survey
  }

  async activate(id: number, currentUserId?: number) {
    const survey = await Survey.findOrFail(id)

    if (survey.status !== 'draft') {
      throw new Error('Apenas pesquisas em rascunho podem ser ativadas')
    }

    const questionsCount = await SurveyQuestion.query().where('surveyId', id).count('* as total')
    if (Number(questionsCount[0].$extras.total) === 0) {
      throw new Error('Pesquisa deve ter pelo menos uma pergunta antes de ser ativada')
    }

    survey.status = 'active'
    await survey.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'survey',
      resourceId: survey.id,
      description: `Pesquisa ativada: ${survey.title}`,
      newValues: { status: 'active' },
    })

    return survey
  }

  async close(id: number, currentUserId?: number) {
    const survey = await Survey.findOrFail(id)

    if (survey.status !== 'active') {
      throw new Error('Apenas pesquisas ativas podem ser fechadas')
    }

    survey.status = 'closed'
    await survey.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'survey',
      resourceId: survey.id,
      description: `Pesquisa fechada: ${survey.title}`,
      newValues: { status: 'closed' },
    })

    return survey
  }

  async results(id: number) {
    const survey = await Survey.query()
      .where('id', id)
      .preload('questions', (query) => query.orderBy('order', 'asc'))
      .preload('responses', (query) => query.preload('answers'))
      .firstOrFail()

    const totalResponses = survey.responses.length
    const questionResults = []

    for (const question of survey.questions) {
      const answers = survey.responses.flatMap((r) =>
        r.answers.filter((a) => a.questionId === question.id)
      )

      let result: any = {
        questionId: question.id,
        text: question.text,
        type: question.type,
        totalAnswers: answers.length,
      }

      // Calcular estatisticas por tipo
      if (question.type === 'scale' || question.type === 'enps') {
        const numericValues = answers
          .filter((a) => a.numericValue !== null)
          .map((a) => a.numericValue!)

        if (numericValues.length > 0) {
          const sum = numericValues.reduce((acc, val) => acc + val, 0)
          const avg = sum / numericValues.length
          const sorted = [...numericValues].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          const median =
            sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]

          result.average = Math.round(avg * 100) / 100
          result.median = median
          result.min = Math.min(...numericValues)
          result.max = Math.max(...numericValues)

          // Distribution
          const distribution: Record<number, number> = {}
          numericValues.forEach((val) => {
            distribution[val] = (distribution[val] || 0) + 1
          })
          result.distribution = distribution
        }

        // eNPS calculation
        if (question.type === 'enps' && numericValues.length > 0) {
          const promoters = numericValues.filter((v) => v >= 9).length
          const detractors = numericValues.filter((v) => v <= 6).length
          const enps = ((promoters - detractors) / numericValues.length) * 100
          result.enps = Math.round(enps)
        }
      } else if (question.type === 'multiple_choice' || question.type === 'yes_no') {
        const distribution: Record<string, number> = {}
        answers.forEach((a) => {
          if (a.value) {
            distribution[a.value] = (distribution[a.value] || 0) + 1
          }
        })
        result.distribution = distribution
      }

      questionResults.push(result)
    }

    return {
      survey: {
        id: survey.id,
        title: survey.title,
        type: survey.type,
        status: survey.status,
      },
      totalResponses,
      questionResults,
    }
  }

  // ==================== RESPONSES ====================

  async respond(surveyId: number, employeeId: number, data: RespondSurveyData, currentUserId?: number) {
    const survey = await Survey.query()
      .where('id', surveyId)
      .preload('questions')
      .firstOrFail()

    // Validacoes
    if (survey.status !== 'active') {
      throw new Error('Pesquisa nao esta ativa')
    }

    const now = DateTime.now()
    if (survey.startDate && now < survey.startDate) {
      throw new Error('Pesquisa ainda nao iniciou')
    }
    if (survey.endDate && now > survey.endDate) {
      throw new Error('Pesquisa ja encerrou')
    }

    // Verificar se employee ja respondeu
    const existingResponse = await SurveyResponse.query()
      .where('surveyId', surveyId)
      .where('employeeId', employeeId)
      .first()

    if (existingResponse) {
      throw new Error('Voce ja respondeu esta pesquisa')
    }

    // Verificar target departments
    if (survey.targetDepartments && survey.targetDepartments.length > 0) {
      const employee = await Employee.findOrFail(employeeId)
      if (
        !employee.departmentId ||
        !survey.targetDepartments.includes(employee.departmentId)
      ) {
        throw new Error('Voce nao faz parte do publico-alvo desta pesquisa')
      }
    }

    // Criar response
    const response = await SurveyResponse.create({
      surveyId,
      employeeId: survey.isAnonymous ? null : employeeId,
      submittedAt: DateTime.now(),
    })

    // Salvar respostas
    for (const answer of data.answers) {
      await SurveyAnswer.create({
        responseId: response.id,
        questionId: answer.questionId,
        value: answer.value || null,
        numericValue: answer.numericValue ?? null,
      })
    }

    await response.load('answers')

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'survey_response',
      resourceId: response.id,
      description: `Resposta enviada para pesquisa: ${survey.title}`,
      newValues: { surveyId, employeeId: survey.isAnonymous ? null : employeeId },
    })

    return response
  }

  async pendingSurveys(employeeId: number) {
    const employee = await Employee.findOrFail(employeeId)

    const query = Survey.query()
      .where('status', 'active')
      .preload('questions')

    // Filtrar por periodo
    const now = DateTime.now()
    query.where((q) => {
      q.whereNull('startDate').orWhere('startDate', '<=', now.toSQLDate()!)
    })
    query.where((q) => {
      q.whereNull('endDate').orWhere('endDate', '>=', now.toSQLDate()!)
    })

    const allActiveSurveys = await query.exec()

    // Filtrar manualmente por target e ja respondidas
    const pendingSurveys = []
    for (const survey of allActiveSurveys) {
      // Verificar target departments
      if (survey.targetDepartments && survey.targetDepartments.length > 0) {
        if (!employee.departmentId || !survey.targetDepartments.includes(employee.departmentId)) {
          continue
        }
      }

      // Verificar se ja respondeu
      const hasResponded = await SurveyResponse.query()
        .where('surveyId', survey.id)
        .where('employeeId', employeeId)
        .first()

      if (!hasResponded) {
        pendingSurveys.push(survey)
      }
    }

    return pendingSurveys
  }
}

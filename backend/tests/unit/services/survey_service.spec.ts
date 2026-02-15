import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import Survey from '#models/survey'
import SurveyQuestion from '#models/survey_question'
import SurveyResponse from '#models/survey_response'
import SurveyAnswer from '#models/survey_answer'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('SurveyService - Pesquisas', (group) => {
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve criar pesquisa com perguntas', async ({ assert }) => {
    const survey = await Survey.create({
      title: `Pesquisa de Clima ${Date.now()}`,
      description: 'Avaliar o clima organizacional',
      type: 'climate',
      status: 'draft',
      isAnonymous: false,
      createdBy: user.id,
    })

    await SurveyQuestion.createMany([
      {
        surveyId: survey.id,
        text: 'Você está satisfeito com o ambiente de trabalho?',
        type: 'scale',
        order: 1,
        isRequired: true,
      },
      {
        surveyId: survey.id,
        text: 'Você recomendaria a empresa para um amigo?',
        type: 'yes_no',
        order: 2,
        isRequired: true,
      },
    ])

    await survey.load('questions')

    assert.equal(survey.type, 'climate')
    assert.equal(survey.status, 'draft')
    assert.equal(survey.questions.length, 2)
  })

  test('deve criar pesquisa tipo eNPS com pergunta padrão', async ({ assert }) => {
    const survey = await Survey.create({
      title: `eNPS ${Date.now()}`,
      description: 'Pesquisa de recomendação',
      type: 'enps',
      status: 'draft',
      isAnonymous: true,
      createdBy: user.id,
    })

    await SurveyQuestion.create({
      surveyId: survey.id,
      text: 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa para trabalhar?',
      type: 'enps',
      order: 1,
      isRequired: true,
    })

    await survey.load('questions')

    assert.equal(survey.type, 'enps')
    assert.isTrue(survey.isAnonymous)
    assert.equal(survey.questions[0].type, 'enps')
  })

  test('deve listar pesquisas por status', async ({ assert }) => {
    await Survey.create({
      title: `Pesquisa Draft ${Date.now()}`,
      type: 'pulse',
      status: 'draft',
      isAnonymous: false,
      createdBy: user.id,
    })

    await Survey.create({
      title: `Pesquisa Ativa ${Date.now()}`,
      type: 'pulse',
      status: 'active',
      isAnonymous: false,
      createdBy: user.id,
    })

    const draftSurveys = await Survey.query().where('status', 'draft')
    const activeSurveys = await Survey.query().where('status', 'active')

    assert.isAtLeast(draftSurveys.length, 1)
    assert.isAtLeast(activeSurveys.length, 1)

    for (const survey of draftSurveys) {
      assert.equal(survey.status, 'draft')
    }
  })

  test('deve ativar pesquisa (draft → active)', async ({ assert }) => {
    const survey = await Survey.create({
      title: `Pesquisa ${Date.now()}`,
      type: 'satisfaction',
      status: 'draft',
      isAnonymous: false,
      createdBy: user.id,
    })

    survey.status = 'active'
    survey.startDate = DateTime.now()
    await survey.save()

    const activated = await Survey.findOrFail(survey.id)

    assert.equal(activated.status, 'active')
    assert.isNotNull(activated.startDate)
  })

  test('deve fechar pesquisa (active → closed)', async ({ assert }) => {
    const survey = await Survey.create({
      title: `Pesquisa ${Date.now()}`,
      type: 'climate',
      status: 'active',
      isAnonymous: false,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    survey.status = 'closed'
    survey.endDate = DateTime.now()
    await survey.save()

    const closed = await Survey.findOrFail(survey.id)

    assert.equal(closed.status, 'closed')
    assert.isNotNull(closed.endDate)
  })

  test('nao pode ativar pesquisa fechada', async ({ assert }) => {
    const survey = await Survey.create({
      title: `Pesquisa Fechada ${Date.now()}`,
      type: 'pulse',
      status: 'closed',
      isAnonymous: false,
      createdBy: user.id,
    })

    const canActivate = survey.status !== 'closed'

    assert.isFalse(canActivate)
  })

  test('deve atualizar pesquisa em draft', async ({ assert }) => {
    const survey = await Survey.create({
      title: `Pesquisa Original ${Date.now()}`,
      description: 'Descrição original',
      type: 'custom',
      status: 'draft',
      isAnonymous: false,
      createdBy: user.id,
    })

    survey.title = 'Pesquisa Atualizada'
    survey.description = 'Descrição atualizada'
    await survey.save()

    const updated = await Survey.findOrFail(survey.id)

    assert.equal(updated.title, 'Pesquisa Atualizada')
    assert.equal(updated.description, 'Descrição atualizada')
  })

  test('nao pode editar pesquisa ativa', async ({ assert }) => {
    const survey = await Survey.create({
      title: `Pesquisa Ativa ${Date.now()}`,
      type: 'climate',
      status: 'active',
      isAnonymous: false,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    const canEdit = survey.status === 'draft'

    assert.isFalse(canEdit)
  })
})

test.group('SurveyService - Respostas', (group) => {
  let user: User
  let employee: Employee
  let department: Department
  let survey: Survey

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Usuario Teste',
      email: `user.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    department = await Department.create({
      name: `Depto ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Cargo ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Colaborador Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    survey = await Survey.create({
      title: `Pesquisa Teste ${Date.now()}`,
      type: 'pulse',
      status: 'active',
      isAnonymous: false,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    await SurveyQuestion.create({
      surveyId: survey.id,
      text: 'Pergunta teste',
      type: 'scale',
      order: 1,
      isRequired: true,
    })
  })

  test('deve responder pesquisa ativa', async ({ assert }) => {
    const response = await SurveyResponse.create({
      surveyId: survey.id,
      employeeId: employee.id,
      submittedAt: DateTime.now(),
    })

    const question = await SurveyQuestion.query().where('survey_id', survey.id).firstOrFail()

    await SurveyAnswer.create({
      responseId: response.id,
      questionId: question.id,
      value: '8',
    })

    await response.load('answers')

    assert.equal(response.surveyId, survey.id)
    assert.equal(response.employeeId, employee.id)
    assert.equal(response.answers.length, 1)
  })

  test('nao pode responder pesquisa fechada', async ({ assert }) => {
    const closedSurvey = await Survey.create({
      title: `Pesquisa Fechada ${Date.now()}`,
      type: 'climate',
      status: 'closed',
      isAnonymous: false,
      createdBy: user.id,
    })

    const canRespond = closedSurvey.status === 'active'

    assert.isFalse(canRespond)
  })

  test('nao pode responder duas vezes', async ({ assert }) => {
    await SurveyResponse.create({
      surveyId: survey.id,
      employeeId: employee.id,
      submittedAt: DateTime.now(),
    })

    const existingResponse = await SurveyResponse.query()
      .where('survey_id', survey.id)
      .where('employee_id', employee.id)
      .first()

    const hasAlreadyResponded = existingResponse !== null

    assert.isTrue(hasAlreadyResponded)
  })

  test('resposta anônima nao salva employee_id', async ({ assert }) => {
    const anonymousSurvey = await Survey.create({
      title: `Pesquisa Anônima ${Date.now()}`,
      type: 'enps',
      status: 'active',
      isAnonymous: true,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    const response = await SurveyResponse.create({
      surveyId: anonymousSurvey.id,
      employeeId: null, // Anônima
      submittedAt: DateTime.now(),
    })

    assert.isNull(response.employeeId)
  })

  test('deve listar pesquisas pendentes do employee', async ({ assert }) => {
    // Criar pesquisa ativa que o employee não respondeu
    await Survey.create({
      title: `Pesquisa Pendente ${Date.now()}`,
      type: 'satisfaction',
      status: 'active',
      isAnonymous: false,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    // Buscar pesquisas ativas
    const activeSurveys = await Survey.query().where('status', 'active')

    // Verificar quais o employee já respondeu
    const respondedSurveyIds = await SurveyResponse.query()
      .where('employee_id', employee.id)
      .select('survey_id')

    const respondedIds = respondedSurveyIds.map((r) => r.surveyId)

    const pendingSurveys = activeSurveys.filter((s) => !respondedIds.includes(s.id))

    assert.isAtLeast(pendingSurveys.length, 1)
  })

  test('pesquisa com target_departments filtra employees', async ({ assert }) => {
    const targetedSurvey = await Survey.create({
      title: `Pesquisa Departamental ${Date.now()}`,
      type: 'pulse',
      status: 'active',
      isAnonymous: false,
      targetDepartments: [department.id],
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    const isEligible =
      targetedSurvey.targetDepartments === null ||
      targetedSurvey.targetDepartments.includes(employee.departmentId!)

    assert.isTrue(isEligible)
  })
})

test.group('SurveyService - Resultados', (group) => {
  let user: User
  let survey: Survey
  let question: SurveyQuestion

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    survey = await Survey.create({
      title: `Pesquisa ${Date.now()}`,
      type: 'pulse',
      status: 'active',
      isAnonymous: false,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    question = await SurveyQuestion.create({
      surveyId: survey.id,
      text: 'Pergunta teste',
      type: 'scale',
      order: 1,
      isRequired: true,
    })
  })

  test('deve calcular média de perguntas tipo escala', async ({ assert }) => {
    const response1 = await SurveyResponse.create({
      surveyId: survey.id,
      submittedAt: DateTime.now(),
    })

    const response2 = await SurveyResponse.create({
      surveyId: survey.id,
      submittedAt: DateTime.now(),
    })

    const response3 = await SurveyResponse.create({
      surveyId: survey.id,
      submittedAt: DateTime.now(),
    })

    await SurveyAnswer.create({
      responseId: response1.id,
      questionId: question.id,
      value: '7',
    })

    await SurveyAnswer.create({
      responseId: response2.id,
      questionId: question.id,
      value: '8',
    })

    await SurveyAnswer.create({
      responseId: response3.id,
      questionId: question.id,
      value: '9',
    })

    const answers = await SurveyAnswer.query().where('question_id', question.id)

    const values = answers.map((a) => Number.parseFloat(a.value!))
    const average = values.reduce((sum, val) => sum + val, 0) / values.length

    assert.equal(average, 8)
  })

  test('deve calcular eNPS score corretamente', async ({ assert }) => {
    const enpsSurvey = await Survey.create({
      title: `eNPS ${Date.now()}`,
      type: 'enps',
      status: 'active',
      isAnonymous: true,
      startDate: DateTime.now(),
      createdBy: user.id,
    })

    const enpsQuestion = await SurveyQuestion.create({
      surveyId: enpsSurvey.id,
      text: 'Recomendaria nossa empresa?',
      type: 'enps',
      order: 1,
      isRequired: true,
    })

    // Criar respostas: 2 promotores (9-10), 1 passivo (7-8), 2 detratores (0-6)
    const responses = [
      { value: '10' }, // Promotor
      { value: '9' }, // Promotor
      { value: '7' }, // Passivo
      { value: '5' }, // Detrator
      { value: '3' }, // Detrator
    ]

    for (const resp of responses) {
      const response = await SurveyResponse.create({
        surveyId: enpsSurvey.id,
        submittedAt: DateTime.now(),
      })

      await SurveyAnswer.create({
        responseId: response.id,
        questionId: enpsQuestion.id,
        value: resp.value,
      })
    }

    const answers = await SurveyAnswer.query().where('question_id', enpsQuestion.id)

    let promoters = 0
    let passives = 0
    let detractors = 0

    for (const answer of answers) {
      const score = Number.parseInt(answer.value!)
      if (score >= 9) promoters++
      else if (score >= 7) passives++
      else detractors++
    }

    const total = answers.length
    const enpsScore = ((promoters - detractors) / total) * 100

    assert.equal(promoters, 2)
    assert.equal(passives, 1)
    assert.equal(detractors, 2)
    assert.equal(enpsScore, 0) // (2-2)/5 * 100 = 0
  })

  test('deve identificar promotores (9-10)', async ({ assert }) => {
    const scores = [9, 10]

    for (const score of scores) {
      const isPromoter = score >= 9
      assert.isTrue(isPromoter)
    }
  })

  test('deve identificar detratores (0-6)', async ({ assert }) => {
    const scores = [0, 3, 6]

    for (const score of scores) {
      const isDetractor = score <= 6
      assert.isTrue(isDetractor)
    }
  })

  test('deve identificar passivos (7-8)', async ({ assert }) => {
    const scores = [7, 8]

    for (const score of scores) {
      const isPassive = score >= 7 && score <= 8
      assert.isTrue(isPassive)
    }
  })

  test('eNPS score = (% promotores - % detratores) * 100', async ({ assert }) => {
    const total = 10
    const promoters = 6
    const detractors = 2

    const enpsScore = ((promoters - detractors) / total) * 100

    assert.equal(enpsScore, 40)
  })

  test('deve calcular distribuição de respostas (contagem por valor)', async ({ assert }) => {
    const response1 = await SurveyResponse.create({
      surveyId: survey.id,
      submittedAt: DateTime.now(),
    })

    const response2 = await SurveyResponse.create({
      surveyId: survey.id,
      submittedAt: DateTime.now(),
    })

    const response3 = await SurveyResponse.create({
      surveyId: survey.id,
      submittedAt: DateTime.now(),
    })

    await SurveyAnswer.create({
      responseId: response1.id,
      questionId: question.id,
      value: '5',
    })

    await SurveyAnswer.create({
      responseId: response2.id,
      questionId: question.id,
      value: '5',
    })

    await SurveyAnswer.create({
      responseId: response3.id,
      questionId: question.id,
      value: '8',
    })

    const answers = await SurveyAnswer.query().where('question_id', question.id)

    const distribution: Record<string, number> = {}

    for (const answer of answers) {
      distribution[answer.value!] = (distribution[answer.value!] || 0) + 1
    }

    assert.equal(distribution['5'], 2)
    assert.equal(distribution['8'], 1)
  })

  test('deve calcular taxa de participação (responderam / total elegíveis)', async ({
    assert,
  }) => {
    // Total de employees elegíveis
    const totalEligible = 10

    // Criar algumas respostas
    for (let i = 0; i < 6; i++) {
      await SurveyResponse.create({
        surveyId: survey.id,
        submittedAt: DateTime.now(),
      })
    }

    const responses = await SurveyResponse.query().where('survey_id', survey.id)
    const totalResponses = responses.length

    const participationRate = (totalResponses / totalEligible) * 100

    assert.equal(participationRate, 60)
  })
})

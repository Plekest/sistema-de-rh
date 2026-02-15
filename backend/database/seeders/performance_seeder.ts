import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import PerformanceCycle from '#models/performance_cycle'
import Competency from '#models/competency'
import CycleCompetency from '#models/cycle_competency'
import IndividualGoal from '#models/individual_goal'
import Evaluation from '#models/evaluation'
import EvaluationScore from '#models/evaluation_score'
import DevelopmentPlan from '#models/development_plan'
import Employee from '#models/employee'
import User from '#models/user'

export default class extends BaseSeeder {
  // Seeded random generator for reproducibility
  private seed = 12345
  private seededRandom() {
    const x = Math.sin(this.seed++) * 10000
    return x - Math.floor(x)
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.seededRandom() * (max - min + 1)) + min
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.seededRandom() * array.length)]
  }

  private randomScore(): number {
    const rand = this.seededRandom()
    if (rand < 0.05) return 5 // 5% excellence
    if (rand < 0.25) return 4 // 20% above expectations
    if (rand < 0.85) return 3 // 60% meets expectations
    if (rand < 0.95) return 2 // 10% below expectations
    return 1 // 5% needs improvement
  }

  async run() {
    console.log('Iniciando seed de Performance...')

    // ============================================================
    // 1. LOOKUP ADMIN AND EMPLOYEES
    // ============================================================
    console.log('Buscando usuarios e funcionarios...')

    const admin = await User.query().where('email', 'admin@sistema-rh.com').firstOrFail()
    const activeEmployees = await Employee.query()
      .where('status', 'active')
      .preload('user')
      .preload('position')
      .preload('department')

    console.log(`Encontrados ${activeEmployees.length} funcionarios ativos`)

    // ============================================================
    // 2. PERFORMANCE CYCLES
    // ============================================================
    console.log('Criando ciclos de avaliacao...')

    const cycle2025 = await PerformanceCycle.updateOrCreate(
      { name: 'Ciclo Anual 2025' },
      {
        name: 'Ciclo Anual 2025',
        type: 'anual',
        startDate: DateTime.fromISO('2025-01-01'),
        endDate: DateTime.fromISO('2025-12-31'),
        selfEvalDeadline: DateTime.fromISO('2025-12-15'),
        managerEvalDeadline: DateTime.fromISO('2025-12-31'),
        status: 'closed',
        createdBy: admin.id,
      }
    )

    const cycle2026S1 = await PerformanceCycle.updateOrCreate(
      { name: 'Ciclo Semestral 2026 S1' },
      {
        name: 'Ciclo Semestral 2026 S1',
        type: 'semestral',
        startDate: DateTime.fromISO('2026-01-01'),
        endDate: DateTime.fromISO('2026-06-30'),
        selfEvalDeadline: DateTime.fromISO('2026-06-15'),
        managerEvalDeadline: DateTime.fromISO('2026-06-30'),
        status: 'self_eval',
        createdBy: admin.id,
      }
    )

    console.log('Ciclos criados com sucesso')

    // ============================================================
    // 3. COMPETENCIES
    // ============================================================
    console.log('Criando competencias...')

    // Technical Competencies
    const compTechnical1 = await Competency.updateOrCreate(
      { name: 'Conhecimento Tecnico' },
      {
        name: 'Conhecimento Tecnico',
        description: 'Dominio das ferramentas e tecnologias da area',
        category: 'technical',
        isActive: true,
      }
    )

    const compTechnical2 = await Competency.updateOrCreate(
      { name: 'Resolucao de Problemas' },
      {
        name: 'Resolucao de Problemas',
        description: 'Capacidade de identificar e resolver problemas complexos',
        category: 'technical',
        isActive: true,
      }
    )

    const compTechnical3 = await Competency.updateOrCreate(
      { name: 'Qualidade do Trabalho' },
      {
        name: 'Qualidade do Trabalho',
        description: 'Entrega de trabalho com alto padrao de qualidade',
        category: 'technical',
        isActive: true,
      }
    )

    // Behavioral Competencies
    const compBehavioral1 = await Competency.updateOrCreate(
      { name: 'Comunicacao' },
      {
        name: 'Comunicacao',
        description: 'Clareza e eficacia na comunicacao verbal e escrita',
        category: 'behavioral',
        isActive: true,
      }
    )

    const compBehavioral2 = await Competency.updateOrCreate(
      { name: 'Trabalho em Equipe' },
      {
        name: 'Trabalho em Equipe',
        description: 'Colaboracao e cooperacao com colegas',
        category: 'behavioral',
        isActive: true,
      }
    )

    const compBehavioral3 = await Competency.updateOrCreate(
      { name: 'Proatividade' },
      {
        name: 'Proatividade',
        description: 'Iniciativa e antecipacao de necessidades',
        category: 'behavioral',
        isActive: true,
      }
    )

    const compBehavioral4 = await Competency.updateOrCreate(
      { name: 'Adaptabilidade' },
      {
        name: 'Adaptabilidade',
        description: 'Flexibilidade para lidar com mudancas',
        category: 'behavioral',
        isActive: true,
      }
    )

    // Leadership Competencies
    const compLeadership1 = await Competency.updateOrCreate(
      { name: 'Lideranca' },
      {
        name: 'Lideranca',
        description: 'Capacidade de inspirar e guiar equipes',
        category: 'leadership',
        isActive: true,
      }
    )

    const compLeadership2 = await Competency.updateOrCreate(
      { name: 'Gestao de Tempo' },
      {
        name: 'Gestao de Tempo',
        description: 'Priorizacao e cumprimento de prazos',
        category: 'leadership',
        isActive: true,
      }
    )

    const allCompetencies = [
      { comp: compTechnical1, category: 'technical' },
      { comp: compTechnical2, category: 'technical' },
      { comp: compTechnical3, category: 'technical' },
      { comp: compBehavioral1, category: 'behavioral' },
      { comp: compBehavioral2, category: 'behavioral' },
      { comp: compBehavioral3, category: 'behavioral' },
      { comp: compBehavioral4, category: 'behavioral' },
      { comp: compLeadership1, category: 'leadership' },
      { comp: compLeadership2, category: 'leadership' },
    ]

    console.log('Competencias criadas com sucesso')

    // ============================================================
    // 4. CYCLE COMPETENCIES (Link to cycles with weights)
    // ============================================================
    console.log('Vinculando competencias aos ciclos...')

    const weights = {
      technical: [10, 10, 10], // Total: 30%
      behavioral: [15, 13, 12, 10], // Total: 50%
      leadership: [10, 10], // Total: 20%
    }

    let techIndex = 0
    let behavIndex = 0
    let leadIndex = 0

    for (const cycle of [cycle2025, cycle2026S1]) {
      techIndex = 0
      behavIndex = 0
      leadIndex = 0

      for (const { comp, category } of allCompetencies) {
        let weight = 10
        if (category === 'technical') {
          weight = weights.technical[techIndex++]
        } else if (category === 'behavioral') {
          weight = weights.behavioral[behavIndex++]
        } else if (category === 'leadership') {
          weight = weights.leadership[leadIndex++]
        }

        await CycleCompetency.updateOrCreate(
          { cycleId: cycle.id, competencyId: comp.id },
          {
            cycleId: cycle.id,
            competencyId: comp.id,
            weight,
          }
        )
      }
    }

    console.log('Competencias vinculadas com sucesso')

    // ============================================================
    // 5. INDIVIDUAL GOALS
    // ============================================================
    console.log('Criando metas individuais...')

    const goalTemplates = {
      dev: [
        {
          title: 'Concluir migracao do modulo de Pagamentos',
          description: 'Migrar sistema legado para nova arquitetura',
        },
        {
          title: 'Reduzir tempo de resposta da API em 30%',
          description: 'Otimizar queries e implementar cache',
        },
        { title: 'Obter certificacao AWS Solutions Architect', description: null },
        {
          title: 'Implementar testes unitarios no modulo core',
          description: 'Aumentar cobertura de testes',
        },
      ],
      rh: [
        {
          title: 'Implementar programa de onboarding estruturado',
          description: 'Reduzir tempo de integracao de novos funcionarios',
        },
        { title: 'Reduzir turnover em 10%', description: 'Melhorar clima organizacional' },
        {
          title: 'Automatizar processo de admissao',
          description: 'Implementar fluxo digital completo',
        },
      ],
      financeiro: [
        {
          title: 'Automatizar relatorios financeiros',
          description: 'Implementar dashboards em Power BI',
        },
        {
          title: 'Reduzir inadimplencia em 5%',
          description: 'Implementar politica de cobranca proativa',
        },
        {
          title: 'Concluir auditoria fiscal Q2',
          description: 'Preparar documentacao e processos',
        },
      ],
      comercial: [
        { title: 'Atingir meta de vendas Q3', description: 'Aumentar vendas em 20%' },
        {
          title: 'Expandir carteira de clientes',
          description: 'Adicionar 15 novos clientes corporativos',
        },
        { title: 'Melhorar taxa de conversao de leads', description: 'Atingir 25% de conversao' },
      ],
      marketing: [
        {
          title: 'Aumentar engajamento nas redes sociais em 20%',
          description: 'Melhorar estrategia de conteudo',
        },
        {
          title: 'Lancar campanha institucional',
          description: 'Campanha de branding Q3 2025',
        },
        { title: 'Implementar automacao de marketing', description: 'Setup de Hubspot ou RD' },
      ],
      qualidade: [
        {
          title: 'Aumentar cobertura de testes para 80%',
          description: 'Implementar testes automatizados',
        },
        {
          title: 'Reduzir bugs criticos em producao',
          description: 'Meta: maximo 2 bugs criticos por mes',
        },
        {
          title: 'Implementar processo de code review',
          description: 'Estabelecer guidelines e checklists',
        },
      ],
      operacoes: [
        {
          title: 'Implementar monitoramento de SLA',
          description: 'Setup de ferramentas e alertas',
        },
        {
          title: 'Reduzir tempo de deploy em 50%',
          description: 'Otimizar pipeline de CI/CD',
        },
        {
          title: 'Documentar procedimentos operacionais',
          description: 'Criar runbooks para incidentes',
        },
      ],
      default: [
        { title: 'Concluir treinamento obrigatorio de compliance', description: null },
        {
          title: 'Melhorar habilidades de comunicacao',
          description: 'Participar de workshop de comunicacao assertiva',
        },
        { title: 'Contribuir para projetos interdepartamentais', description: null },
      ],
    }

    for (const employee of activeEmployees) {
      await employee.load('position')
      await employee.load('department')

      const departmentName = employee.department?.name?.toLowerCase() || ''
      const positionName = employee.position?.title?.toLowerCase() || ''

      let templates = goalTemplates.default
      if (positionName.includes('desenvolvedor') || positionName.includes('dev')) {
        templates = goalTemplates.dev
      } else if (departmentName.includes('recursos humanos') || departmentName.includes('rh')) {
        templates = goalTemplates.rh
      } else if (
        departmentName.includes('financeiro') ||
        departmentName.includes('contabil')
      ) {
        templates = goalTemplates.financeiro
      } else if (departmentName.includes('comercial') || departmentName.includes('vendas')) {
        templates = goalTemplates.comercial
      } else if (departmentName.includes('marketing')) {
        templates = goalTemplates.marketing
      } else if (departmentName.includes('qualidade') || positionName.includes('qa')) {
        templates = goalTemplates.qualidade
      } else if (departmentName.includes('operacoes') || departmentName.includes('ti')) {
        templates = goalTemplates.operacoes
      }

      // Cycle 2025 (closed) - 2-3 goals, mostly achieved or not_achieved
      const numGoals2025 = this.randomInt(2, 3)
      const shuffled2025 = [...templates].sort(() => this.seededRandom() - 0.5)
      let totalWeight2025 = 0

      for (let i = 0; i < numGoals2025 && i < shuffled2025.length; i++) {
        const goal = shuffled2025[i]
        const weight = i === numGoals2025 - 1 ? 100 - totalWeight2025 : this.randomInt(30, 40)
        totalWeight2025 += weight

        const rand = this.seededRandom()
        const status = rand < 0.7 ? 'achieved' : rand < 0.9 ? 'not_achieved' : 'in_progress'

        await IndividualGoal.updateOrCreate(
          {
            cycleId: cycle2025.id,
            employeeId: employee.id,
            title: goal.title,
          },
          {
            cycleId: cycle2025.id,
            employeeId: employee.id,
            title: goal.title,
            description: goal.description,
            weight,
            targetValue: status === 'achieved' ? '100%' : null,
            achievedValue: status === 'achieved' ? '100%' : status === 'not_achieved' ? '60%' : '80%',
            status,
          }
        )
      }

      // Cycle 2026 S1 (self_eval) - 2-3 goals, mostly in_progress or pending
      const numGoals2026 = this.randomInt(2, 3)
      const shuffled2026 = [...templates].sort(() => this.seededRandom() - 0.5)
      let totalWeight2026 = 0

      for (let i = 0; i < numGoals2026 && i < shuffled2026.length; i++) {
        const goal = shuffled2026[i]
        const weight = i === numGoals2026 - 1 ? 100 - totalWeight2026 : this.randomInt(30, 40)
        totalWeight2026 += weight

        const rand = this.seededRandom()
        const status = rand < 0.6 ? 'in_progress' : 'pending'

        await IndividualGoal.updateOrCreate(
          {
            cycleId: cycle2026S1.id,
            employeeId: employee.id,
            title: goal.title,
          },
          {
            cycleId: cycle2026S1.id,
            employeeId: employee.id,
            title: goal.title,
            description: goal.description,
            weight,
            targetValue: null,
            achievedValue: status === 'in_progress' ? '40%' : null,
            status,
          }
        )
      }
    }

    console.log('Metas individuais criadas com sucesso')

    // ============================================================
    // 6. EVALUATIONS
    // ============================================================
    console.log('Criando avaliacoes...')

    const selfComments = [
      'Considero que tive um bom desempenho neste periodo, cumprindo a maioria dos objetivos estabelecidos.',
      'Busquei sempre entregar trabalho de qualidade e colaborar com a equipe.',
      'Identifiquei areas de melhoria e estou comprometido em desenvolver essas competencias.',
      'Consegui superar desafios importantes e entregar resultados consistentes.',
      'Aprendi muito neste ciclo e estou pronto para novos desafios.',
    ]

    const managerComments = [
      'Funcionario demonstrou bom desempenho e comprometimento com os objetivos da equipe.',
      'Apresentou resultados solidos e boa capacidade de trabalho em equipe.',
      'Recomendo desenvolvimento em algumas areas especificas, mas o desempenho geral foi satisfatorio.',
      'Superou expectativas em varios aspectos e e um elemento valioso para a equipe.',
      'Demonstrou evolucao significativa durante o periodo avaliado.',
    ]

    for (const employee of activeEmployees) {
      // CYCLE 2025 (closed) - Completed evaluations
      // Self evaluation
      const selfEval2025 = await Evaluation.updateOrCreate(
        {
          cycleId: cycle2025.id,
          employeeId: employee.id,
          type: 'self',
        },
        {
          cycleId: cycle2025.id,
          employeeId: employee.id,
          evaluatorId: null,
          type: 'self',
          status: 'completed',
          overallScore: Number((3.0 + this.seededRandom() * 2.0).toFixed(1)),
          comments: this.randomChoice(selfComments),
          completedAt: DateTime.fromISO('2025-12-10'),
        }
      )

      // Manager evaluation
      const managerUser = await User.query().where('role', 'manager').first()
      const managerEmployee = managerUser
        ? await Employee.query().where('userId', managerUser.id).first()
        : null

      const managerEval2025 = await Evaluation.updateOrCreate(
        {
          cycleId: cycle2025.id,
          employeeId: employee.id,
          type: 'manager',
        },
        {
          cycleId: cycle2025.id,
          employeeId: employee.id,
          evaluatorId: managerEmployee?.id || null,
          type: 'manager',
          status: 'completed',
          overallScore: Number((3.0 + this.seededRandom() * 2.0).toFixed(1)),
          comments: this.randomChoice(managerComments),
          completedAt: DateTime.fromISO('2025-12-25'),
        }
      )

      // CYCLE 2026 S1 (self_eval) - Some pending, some in progress
      const rand = this.seededRandom()
      const selfStatus2026 = rand < 0.3 ? 'pending' : rand < 0.6 ? 'in_progress' : 'completed'

      await Evaluation.updateOrCreate(
        {
          cycleId: cycle2026S1.id,
          employeeId: employee.id,
          type: 'self',
        },
        {
          cycleId: cycle2026S1.id,
          employeeId: employee.id,
          evaluatorId: null,
          type: 'self',
          status: selfStatus2026,
          overallScore: selfStatus2026 === 'completed' ? Number((3.0 + this.seededRandom() * 2.0).toFixed(1)) : null,
          comments: selfStatus2026 === 'completed' ? this.randomChoice(selfComments) : null,
          completedAt: selfStatus2026 === 'completed' ? DateTime.now() : null,
        }
      )

      // Manager evaluation - all pending for 2026 S1
      await Evaluation.updateOrCreate(
        {
          cycleId: cycle2026S1.id,
          employeeId: employee.id,
          type: 'manager',
        },
        {
          cycleId: cycle2026S1.id,
          employeeId: employee.id,
          evaluatorId: managerEmployee?.id || null,
          type: 'manager',
          status: 'pending',
          overallScore: null,
          comments: null,
          completedAt: null,
        }
      )

      // ============================================================
      // 7. EVALUATION SCORES
      // ============================================================
      // Create scores for completed evaluations in cycle 2025
      const cycleCompetencies = await CycleCompetency.query().where('cycleId', cycle2025.id)

      const scoreComments = [
        'Demonstrou dominio adequado desta competencia.',
        'Area com potencial de desenvolvimento.',
        'Desempenho excelente nesta competencia.',
        'Apresentou evolucao durante o periodo.',
        null, // Some scores without comments
      ]

      for (const cycleComp of cycleCompetencies) {
        // Self evaluation scores
        const selfScore = this.randomScore()
        await EvaluationScore.updateOrCreate(
          {
            evaluationId: selfEval2025.id,
            competencyId: cycleComp.competencyId,
          },
          {
            evaluationId: selfEval2025.id,
            competencyId: cycleComp.competencyId,
            score: selfScore,
            comments: this.seededRandom() > 0.5 ? this.randomChoice(scoreComments) : null,
          }
        )

        // Manager evaluation scores
        const managerScore = this.randomScore()
        await EvaluationScore.updateOrCreate(
          {
            evaluationId: managerEval2025.id,
            competencyId: cycleComp.competencyId,
          },
          {
            evaluationId: managerEval2025.id,
            competencyId: cycleComp.competencyId,
            score: managerScore,
            comments: this.seededRandom() > 0.6 ? this.randomChoice(scoreComments) : null,
          }
        )
      }
    }

    console.log('Avaliacoes e scores criados com sucesso')

    // ============================================================
    // 8. DEVELOPMENT PLANS (PDI)
    // ============================================================
    console.log('Criando planos de desenvolvimento...')

    const pdiActions = [
      {
        action: 'Participar de treinamento de lideranca',
        description: 'Curso de formacao de lideres com carga horaria de 40h',
      },
      {
        action: 'Fazer curso de comunicacao assertiva',
        description: 'Workshop de comunicacao corporativa',
      },
      {
        action: 'Obter certificacao profissional',
        description: 'Certificacao relevante para a area de atuacao',
      },
      {
        action: 'Mentoria com profissional senior',
        description: 'Programa de mentoria estruturado de 6 meses',
      },
      {
        action: 'Participar de projeto interdepartamental',
        description: 'Ampliar visao sistemica da organizacao',
      },
      {
        action: 'Curso de gestao de tempo e produtividade',
        description: 'Otimizacao de rotinas e priorizacao',
      },
      {
        action: 'Treinamento tecnico especifico',
        description: 'Aprofundamento em tecnologia ou ferramenta da area',
      },
      {
        action: 'Participar de congresso ou evento da area',
        description: 'Networking e atualizacao de conhecimentos',
      },
    ]

    const managerUser = await User.query().where('role', 'manager').first()
    const managerEmployee = managerUser
      ? await Employee.query().where('userId', managerUser.id).first()
      : null

    for (const employee of activeEmployees) {
      const numPdis = this.randomInt(1, 2)

      for (let i = 0; i < numPdis; i++) {
        const pdi = this.randomChoice(pdiActions)
        const rand = this.seededRandom()
        const status = rand < 0.3 ? 'completed' : rand < 0.6 ? 'in_progress' : 'pending'

        const deadlineMonth = this.randomInt(3, 12)
        const deadline = DateTime.fromISO('2026-01-01').plus({ months: deadlineMonth })

        await DevelopmentPlan.updateOrCreate(
          {
            employeeId: employee.id,
            cycleId: cycle2025.id,
            action: pdi.action,
          },
          {
            employeeId: employee.id,
            cycleId: cycle2025.id,
            action: pdi.action,
            description: pdi.description,
            responsibleId: managerEmployee?.id || admin.id,
            deadline,
            status,
          }
        )
      }
    }

    console.log('Planos de desenvolvimento criados com sucesso')
    console.log('Seed de Performance concluido!')
  }
}

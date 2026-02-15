import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import JobRequisition from '#models/job_requisition'
import RecruitmentStage from '#models/recruitment_stage'
import Candidate from '#models/candidate'
import CandidateStageHistory from '#models/candidate_stage_history'
import Interview from '#models/interview'
import Employee from '#models/employee'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    console.log('Iniciando seed de recrutamento...')

    // ============================================================
    // 1. BUSCAR DADOS NECESSARIOS
    // ============================================================
    console.log('Buscando usuarios, departamentos e cargos...')

    const admin = await User.findByOrFail('email', 'admin@sistema-rh.com')
    const manager = await User.findByOrFail('email', 'gerente@sistema-rh.com')

    const depTI = await Department.findByOrFail('name', 'Tecnologia da Informacao')
    const depMarketing = await Department.findByOrFail('name', 'Marketing')
    const depFinanceiro = await Department.findByOrFail('name', 'Financeiro')
    const depComercial = await Department.findByOrFail('name', 'Comercial')

    const cargoDevPleno = await Position.findByOrFail('title', 'Desenvolvedor Pleno')
    const cargoGerenteComercial = await Position.findByOrFail('title', 'Gerente Comercial')

    // Buscar estágios de recrutamento
    const stages = await RecruitmentStage.query().orderBy('displayOrder')
    const stageTriagem = stages.find((s) => s.name === 'Triagem')!
    const stageEntrevistaRH = stages.find((s) => s.name === 'Entrevista RH')!
    const stageTesteTecnico = stages.find((s) => s.name === 'Teste Técnico')!
    const stageEntrevistaGestor = stages.find((s) => s.name === 'Entrevista Gestor')!
    const stageProposta = stages.find((s) => s.name === 'Proposta')!

    // Adicionar stage "Contratado" se não existir (para candidatos hired)
    const stageContratado = await RecruitmentStage.updateOrCreate(
      { name: 'Contratado' },
      {
        name: 'Contratado',
        displayOrder: 6,
        isDefault: false,
        isActive: true,
      }
    )

    console.log('Estagios encontrados:', stages.length)

    // ============================================================
    // 2. JOB REQUISITIONS
    // ============================================================
    console.log('Criando requisicoes de vaga...')

    const req1 = await JobRequisition.updateOrCreate(
      { title: 'Desenvolvedor Backend Pleno' },
      {
        title: 'Desenvolvedor Backend Pleno',
        departmentId: depTI.id,
        positionId: cargoDevPleno.id,
        requestedBy: manager.id,
        approvedBy: admin.id,
        salaryRangeMin: 8000,
        salaryRangeMax: 12000,
        employmentType: 'clt',
        workModel: 'hybrid',
        headcount: 2,
        status: 'open',
        description:
          'Procuramos um desenvolvedor backend pleno para atuar em projetos de alta complexidade utilizando Node.js, TypeScript e AdonisJS.',
        requirements:
          '- 3+ anos de experiencia com Node.js\n- Conhecimento solido em TypeScript\n- Experiencia com bancos relacionais (PostgreSQL)\n- Conhecimento em REST APIs e GraphQL\n- Familiaridade com metodologias ageis',
        approvedAt: DateTime.fromISO('2025-12-01'),
      }
    )

    const req2 = await JobRequisition.updateOrCreate(
      { title: 'Analista de Marketing Digital' },
      {
        title: 'Analista de Marketing Digital',
        departmentId: depMarketing.id,
        positionId: null,
        requestedBy: admin.id,
        approvedBy: admin.id,
        salaryRangeMin: 5500,
        salaryRangeMax: 8000,
        employmentType: 'clt',
        workModel: 'onsite',
        headcount: 1,
        status: 'open',
        description:
          'Analista para gerenciar campanhas de marketing digital, SEO/SEM, redes sociais e performance.',
        requirements:
          '- Experiencia com Google Ads e Facebook Ads\n- Conhecimento em SEO e Google Analytics\n- Habilidades em criacao de conteudo\n- Experiencia com automacao de marketing',
        approvedAt: DateTime.fromISO('2026-01-10'),
      }
    )

    await JobRequisition.updateOrCreate(
      { title: 'DevOps Engineer' },
      {
        title: 'DevOps Engineer',
        departmentId: depTI.id,
        positionId: null,
        requestedBy: manager.id,
        approvedBy: admin.id,
        salaryRangeMin: 15000,
        salaryRangeMax: 22000,
        employmentType: 'pj',
        workModel: 'remote',
        headcount: 1,
        status: 'approved',
        description:
          'DevOps Engineer para implementar e manter infraestrutura cloud, CI/CD e monitoramento.',
        requirements:
          '- Experiencia com AWS ou GCP\n- Conhecimento em Docker e Kubernetes\n- Experiencia com CI/CD (Jenkins, GitLab CI, GitHub Actions)\n- Conhecimento em IaC (Terraform, Ansible)\n- Experiencia com monitoramento (Prometheus, Grafana)',
        approvedAt: DateTime.fromISO('2026-01-20'),
      }
    )

    const req4 = await JobRequisition.updateOrCreate(
      { title: 'Estagiario Financeiro' },
      {
        title: 'Estagiario Financeiro',
        departmentId: depFinanceiro.id,
        positionId: null,
        requestedBy: admin.id,
        approvedBy: null,
        salaryRangeMin: 1800,
        salaryRangeMax: 2200,
        employmentType: 'clt',
        workModel: 'onsite',
        headcount: 1,
        status: 'filled',
        description: 'Estagiario para auxiliar na area financeira com contas a pagar/receber e conciliacao.',
        requirements:
          '- Cursando Administracao, Contabilidade ou areas afins\n- Conhecimento basico de Excel\n- Organizacao e atencao aos detalhes',
        closedAt: DateTime.fromISO('2025-11-30'),
      }
    )

    await JobRequisition.updateOrCreate(
      { title: 'Gerente Comercial' },
      {
        title: 'Gerente Comercial',
        departmentId: depComercial.id,
        positionId: cargoGerenteComercial.id,
        requestedBy: admin.id,
        approvedBy: null,
        salaryRangeMin: 12000,
        salaryRangeMax: 18000,
        employmentType: 'clt',
        workModel: 'hybrid',
        headcount: 1,
        status: 'cancelled',
        description: 'Gerente para liderar a equipe comercial e estrategia de vendas.',
        requirements:
          '- 5+ anos de experiencia em vendas\n- Experiencia em gestao de equipes\n- Habilidades de negociacao e relacionamento',
      }
    )

    console.log('Requisicoes criadas: 5')

    // ============================================================
    // 3. CANDIDATES
    // ============================================================
    console.log('Criando candidatos...')

    // Candidatos para "Desenvolvedor Backend Pleno" (req1)
    const cand1 = await Candidate.updateOrCreate(
      { email: 'lucas.ferreira.dev@email.com' },
      {
        jobRequisitionId: req1.id,
        name: 'Lucas Ferreira',
        email: 'lucas.ferreira.dev@email.com',
        phone: '(11) 98765-4321',
        linkedinUrl: 'https://linkedin.com/in/lucas-ferreira-dev',
        salaryExpectation: 10000,
        resumePath: null,
        source: 'linkedin',
        currentStageId: stageEntrevistaGestor.id,
        status: 'active',
        notes: 'Candidato forte com boa experiencia em Node.js e TypeScript. Passou bem no teste tecnico.',
      }
    )

    const cand2 = await Candidate.updateOrCreate(
      { email: 'mariana.costa.dev@email.com' },
      {
        jobRequisitionId: req1.id,
        name: 'Mariana Costa',
        email: 'mariana.costa.dev@email.com',
        phone: '(21) 97654-3210',
        linkedinUrl: 'https://linkedin.com/in/mariana-costa',
        salaryExpectation: 11000,
        resumePath: null,
        source: 'referral',
        currentStageId: stageTesteTecnico.id,
        status: 'active',
        notes: 'Indicacao interna do time de desenvolvimento. Perfil muito bom.',
      }
    )

    const cand3 = await Candidate.updateOrCreate(
      { email: 'felipe.santos.tech@email.com' },
      {
        jobRequisitionId: req1.id,
        name: 'Felipe Santos',
        email: 'felipe.santos.tech@email.com',
        phone: '(11) 96543-2109',
        linkedinUrl: null,
        salaryExpectation: 15000,
        resumePath: null,
        source: 'linkedin',
        currentStageId: stageTriagem.id,
        status: 'rejected',
        notes: 'Pretensao salarial acima do orcamento da vaga.',
      }
    )

    const cand4 = await Candidate.updateOrCreate(
      { email: 'carolina.silva.backend@email.com' },
      {
        jobRequisitionId: req1.id,
        name: 'Carolina Silva',
        email: 'carolina.silva.backend@email.com',
        phone: '(31) 95432-1098',
        linkedinUrl: 'https://linkedin.com/in/carolina-silva-backend',
        salaryExpectation: 9500,
        resumePath: null,
        source: 'website',
        currentStageId: stageEntrevistaRH.id,
        status: 'active',
        notes: 'Candidata junior-pleno, mas com bastante potencial.',
      }
    )

    const cand5 = await Candidate.updateOrCreate(
      { email: 'roberto.almeida.dev@email.com' },
      {
        jobRequisitionId: req1.id,
        name: 'Roberto Almeida',
        email: 'roberto.almeida.dev@email.com',
        phone: '(41) 94321-0987',
        linkedinUrl: null,
        salaryExpectation: 10500,
        resumePath: null,
        source: 'agency',
        currentStageId: stageProposta.id,
        status: 'active',
        notes: 'Excelente candidato. Passou por todas as etapas com sucesso. Proposta enviada.',
      }
    )

    const cand6 = await Candidate.updateOrCreate(
      { email: 'tatiana.mendes.dev@email.com' },
      {
        jobRequisitionId: req1.id,
        name: 'Tatiana Mendes',
        email: 'tatiana.mendes.dev@email.com',
        phone: '(51) 93210-9876',
        linkedinUrl: 'https://linkedin.com/in/tatiana-mendes',
        salaryExpectation: 9000,
        resumePath: null,
        source: 'linkedin',
        currentStageId: stageTriagem.id,
        status: 'active',
        notes: 'Curriculo recebido. Aguardando analise mais detalhada.',
      }
    )

    // Candidatos para "Analista de Marketing Digital" (req2)
    const cand7 = await Candidate.updateOrCreate(
      { email: 'amanda.oliveira.mkt@email.com' },
      {
        jobRequisitionId: req2.id,
        name: 'Amanda Oliveira',
        email: 'amanda.oliveira.mkt@email.com',
        phone: '(11) 92109-8765',
        linkedinUrl: 'https://linkedin.com/in/amanda-oliveira-marketing',
        salaryExpectation: 6500,
        resumePath: null,
        source: 'linkedin',
        currentStageId: stageEntrevistaRH.id,
        status: 'active',
        notes: 'Experiencia solida em Google Ads e Facebook Ads. Entrevista agendada.',
      }
    )

    const cand8 = await Candidate.updateOrCreate(
      { email: 'gabriel.rodrigues.marketing@email.com' },
      {
        jobRequisitionId: req2.id,
        name: 'Gabriel Rodrigues',
        email: 'gabriel.rodrigues.marketing@email.com',
        phone: '(21) 91098-7654',
        linkedinUrl: null,
        salaryExpectation: 7000,
        resumePath: null,
        source: 'website',
        currentStageId: stageTriagem.id,
        status: 'active',
        notes: 'Candidatura via site. Perfil interessante.',
      }
    )

    const cand9 = await Candidate.updateOrCreate(
      { email: 'isabela.nascimento.mkt@email.com' },
      {
        jobRequisitionId: req2.id,
        name: 'Isabela Nascimento',
        email: 'isabela.nascimento.mkt@email.com',
        phone: '(31) 90987-6543',
        linkedinUrl: 'https://linkedin.com/in/isabela-nascimento',
        salaryExpectation: 6000,
        resumePath: null,
        source: 'referral',
        currentStageId: stageTesteTecnico.id,
        status: 'active',
        notes: 'Indicacao da equipe de marketing. Fazendo teste pratico de campanha.',
      }
    )

    const cand10 = await Candidate.updateOrCreate(
      { email: 'daniel.barbosa.digital@email.com' },
      {
        jobRequisitionId: req2.id,
        name: 'Daniel Barbosa',
        email: 'daniel.barbosa.digital@email.com',
        phone: '(41) 99876-5432',
        linkedinUrl: 'https://linkedin.com/in/daniel-barbosa',
        salaryExpectation: 9000,
        resumePath: null,
        source: 'linkedin',
        currentStageId: stageTriagem.id,
        status: 'rejected',
        notes: 'Pretensao salarial fora do range da vaga.',
      }
    )

    // Candidatos para "Estagiario Financeiro" (req4 - filled)
    const cand11 = await Candidate.updateOrCreate(
      { email: 'beatriz.lima.financeiro@email.com' },
      {
        jobRequisitionId: req4.id,
        name: 'Beatriz Lima',
        email: 'beatriz.lima.financeiro@email.com',
        phone: '(11) 98765-1234',
        linkedinUrl: null,
        salaryExpectation: 2000,
        resumePath: null,
        source: 'website',
        currentStageId: stageContratado.id,
        status: 'hired',
        notes: 'Candidata contratada. Inicio previsto para 01/12/2025.',
      }
    )

    const cand12 = await Candidate.updateOrCreate(
      { email: 'ricardo.pereira.est@email.com' },
      {
        jobRequisitionId: req4.id,
        name: 'Ricardo Pereira',
        email: 'ricardo.pereira.est@email.com',
        phone: '(21) 97654-1234',
        linkedinUrl: null,
        salaryExpectation: 2200,
        resumePath: null,
        source: 'website',
        currentStageId: stageEntrevistaGestor.id,
        status: 'rejected',
        notes: 'Nao demonstrou interesse suficiente na area financeira.',
      }
    )

    const cand13 = await Candidate.updateOrCreate(
      { email: 'julia.araujo.financas@email.com' },
      {
        jobRequisitionId: req4.id,
        name: 'Julia Araujo',
        email: 'julia.araujo.financas@email.com',
        phone: '(31) 96543-1234',
        linkedinUrl: 'https://linkedin.com/in/julia-araujo',
        salaryExpectation: 1900,
        resumePath: null,
        source: 'referral',
        currentStageId: stageEntrevistaRH.id,
        status: 'rejected',
        notes: 'Optou por outra oportunidade.',
      }
    )

    console.log('Candidatos criados: 13')

    // ============================================================
    // 4. CANDIDATE STAGE HISTORY
    // ============================================================
    console.log('Criando historico de estagios...')

    // Helper para criar historico
    const createHistory = async (
      candidateId: number,
      stageId: number,
      movedById: number,
      enteredAt: DateTime,
      leftAt: DateTime | null,
      feedback: string | null = null,
      score: number | null = null
    ) => {
      await CandidateStageHistory.updateOrCreate(
        { candidateId, stageId, enteredAt: enteredAt },
        {
          candidateId,
          stageId,
          movedBy: movedById,
          enteredAt: enteredAt,
          leftAt: leftAt,
          feedback,
          score,
        }
      )
    }

    // Lucas Ferreira - Triagem -> Entrevista RH -> Teste Tecnico -> Entrevista Gestor (atual)
    await createHistory(
      cand1.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-05'),
      DateTime.fromISO('2026-01-08'),
      'Curriculo bem estruturado, experiencia relevante.',
      4
    )
    await createHistory(
      cand1.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2026-01-08'),
      DateTime.fromISO('2026-01-12'),
      'Boa comunicacao, alinhamento cultural positivo.',
      5
    )
    await createHistory(
      cand1.id,
      stageTesteTecnico.id,
      manager.id,
      DateTime.fromISO('2026-01-12'),
      DateTime.fromISO('2026-01-20'),
      'Excelente desempenho no teste tecnico. Codigo limpo e bem estruturado.',
      5
    )
    await createHistory(
      cand1.id,
      stageEntrevistaGestor.id,
      manager.id,
      DateTime.fromISO('2026-01-20'),
      null,
      null,
      null
    )

    // Mariana Costa - Triagem -> Entrevista RH -> Teste Tecnico (atual)
    await createHistory(
      cand2.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-10'),
      DateTime.fromISO('2026-01-12'),
      'Indicacao interna, perfil muito promissor.',
      5
    )
    await createHistory(
      cand2.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2026-01-12'),
      DateTime.fromISO('2026-01-18'),
      'Excelente fit cultural. Muito motivada.',
      5
    )
    await createHistory(
      cand2.id,
      stageTesteTecnico.id,
      manager.id,
      DateTime.fromISO('2026-01-18'),
      null,
      null,
      null
    )

    // Felipe Santos - Triagem (rejeitado)
    await createHistory(
      cand3.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-15'),
      DateTime.fromISO('2026-01-16'),
      'Pretensao salarial muito acima do budget.',
      3
    )

    // Carolina Silva - Triagem -> Entrevista RH (atual)
    await createHistory(
      cand4.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-20'),
      DateTime.fromISO('2026-01-25'),
      'Experiencia um pouco abaixo do esperado, mas com potencial.',
      4
    )
    await createHistory(
      cand4.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2026-01-25'),
      null,
      null,
      null
    )

    // Roberto Almeida - Triagem -> Entrevista RH -> Teste Tecnico -> Entrevista Gestor -> Proposta (atual)
    await createHistory(
      cand5.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2025-12-10'),
      DateTime.fromISO('2025-12-12'),
      'Curriculo excelente.',
      5
    )
    await createHistory(
      cand5.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2025-12-12'),
      DateTime.fromISO('2025-12-15'),
      'Perfeito alinhamento com os valores da empresa.',
      5
    )
    await createHistory(
      cand5.id,
      stageTesteTecnico.id,
      manager.id,
      DateTime.fromISO('2025-12-15'),
      DateTime.fromISO('2025-12-22'),
      'Melhor performance ate agora. Codigo impecavel.',
      5
    )
    await createHistory(
      cand5.id,
      stageEntrevistaGestor.id,
      manager.id,
      DateTime.fromISO('2025-12-22'),
      DateTime.fromISO('2026-01-05'),
      'Excelente visao tecnica e estrategica. Recomendo contratacao.',
      5
    )
    await createHistory(
      cand5.id,
      stageProposta.id,
      admin.id,
      DateTime.fromISO('2026-01-05'),
      null,
      null,
      null
    )

    // Tatiana Mendes - Triagem (atual)
    await createHistory(
      cand6.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-02-01'),
      null,
      null,
      null
    )

    // Amanda Oliveira - Triagem -> Entrevista RH (atual)
    await createHistory(
      cand7.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-15'),
      DateTime.fromISO('2026-01-18'),
      'Bom portfolio de campanhas realizadas.',
      4
    )
    await createHistory(
      cand7.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2026-01-18'),
      null,
      null,
      null
    )

    // Gabriel Rodrigues - Triagem (atual)
    await createHistory(
      cand8.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-25'),
      null,
      null,
      null
    )

    // Isabela Nascimento - Triagem -> Entrevista RH -> Teste Tecnico (atual)
    await createHistory(
      cand9.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-22'),
      DateTime.fromISO('2026-01-24'),
      'Indicacao interna com boas referencias.',
      4
    )
    await createHistory(
      cand9.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2026-01-24'),
      DateTime.fromISO('2026-01-28'),
      'Muito criativa e proativa.',
      5
    )
    await createHistory(
      cand9.id,
      stageTesteTecnico.id,
      admin.id,
      DateTime.fromISO('2026-01-28'),
      null,
      null,
      null
    )

    // Daniel Barbosa - Triagem (rejeitado)
    await createHistory(
      cand10.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2026-01-30'),
      DateTime.fromISO('2026-01-31'),
      'Pretensao salarial incompativel.',
      5
    )

    // Beatriz Lima - Triagem -> Entrevista RH -> Entrevista Gestor -> Contratado
    await createHistory(
      cand11.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2025-11-01'),
      DateTime.fromISO('2025-11-03'),
      'Estagiaria com bom potencial.',
      4
    )
    await createHistory(
      cand11.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2025-11-03'),
      DateTime.fromISO('2025-11-08'),
      'Muito organizada e atenciosa.',
      5
    )
    await createHistory(
      cand11.id,
      stageEntrevistaGestor.id,
      manager.id,
      DateTime.fromISO('2025-11-08'),
      DateTime.fromISO('2025-11-15'),
      'Aprovada. Boa opcao para o time financeiro.',
      4
    )
    await createHistory(
      cand11.id,
      stageContratado.id,
      admin.id,
      DateTime.fromISO('2025-11-15'),
      null,
      'Contratada. Inicio em 01/12/2025.',
      null
    )

    // Ricardo Pereira - Triagem -> Entrevista RH -> Entrevista Gestor (rejeitado)
    await createHistory(
      cand12.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2025-11-05'),
      DateTime.fromISO('2025-11-07'),
      'Perfil adequado para a vaga.',
      4
    )
    await createHistory(
      cand12.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2025-11-07'),
      DateTime.fromISO('2025-11-12'),
      'Sem grandes destaques, mas dentro do esperado.',
      4
    )
    await createHistory(
      cand12.id,
      stageEntrevistaGestor.id,
      manager.id,
      DateTime.fromISO('2025-11-12'),
      DateTime.fromISO('2025-11-18'),
      'Nao demonstrou interesse genuino pela area.',
      5
    )

    // Julia Araujo - Triagem -> Entrevista RH (rejeitado - desistiu)
    await createHistory(
      cand13.id,
      stageTriagem.id,
      admin.id,
      DateTime.fromISO('2025-11-10'),
      DateTime.fromISO('2025-11-12'),
      'Indicacao interna.',
      4
    )
    await createHistory(
      cand13.id,
      stageEntrevistaRH.id,
      admin.id,
      DateTime.fromISO('2025-11-12'),
      DateTime.fromISO('2025-11-20'),
      'Candidata desistiu para aceitar outra proposta.',
      null
    )

    console.log('Historico de estagios criado')

    // ============================================================
    // 5. INTERVIEWS
    // ============================================================
    console.log('Criando entrevistas...')

    // Buscar employee do manager (admin user doesn't have employee record)
    const managerEmployee = await Employee.findByOrFail('userId', manager.id)

    // Entrevistas completadas
    await Interview.updateOrCreate(
      {
        candidateId: cand1.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-01-08T10:00:00'),
      },
      {
        candidateId: cand1.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-01-08T10:00:00'),
        durationMinutes: 45,
        location: 'Sala de Reuniao 2',
        meetingLink: null,
        status: 'completed',
        feedback: 'Candidato comunicativo e bem preparado. Demonstrou interesse genuino pela vaga.',
        score: 5,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand1.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2026-01-20T14:00:00'),
      },
      {
        candidateId: cand1.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2026-01-20T14:00:00'),
        durationMinutes: 60,
        location: null,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        status: 'completed',
        feedback:
          'Excelente conhecimento tecnico. Boa visao de arquitetura. Recomendo para proxima fase.',
        score: 5,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand2.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-01-12T11:00:00'),
      },
      {
        candidateId: cand2.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-01-12T11:00:00'),
        durationMinutes: 40,
        location: 'Sala de Reuniao 1',
        meetingLink: null,
        status: 'completed',
        feedback: 'Candidata excepcional. Fit cultural perfeito. Muito motivada e preparada.',
        score: 5,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand5.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2025-12-12T15:00:00'),
      },
      {
        candidateId: cand5.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2025-12-12T15:00:00'),
        durationMinutes: 50,
        location: null,
        meetingLink: 'https://meet.google.com/xyz-abcd-efg',
        status: 'completed',
        feedback: 'Candidato muito bom. Valores alinhados, experiencia solida.',
        score: 5,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand5.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2025-12-22T10:00:00'),
      },
      {
        candidateId: cand5.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2025-12-22T10:00:00'),
        durationMinutes: 60,
        location: 'Sala de Reuniao 3',
        meetingLink: null,
        status: 'completed',
        feedback:
          'Melhor candidato ate agora. Visao tecnica e estrategica excelentes. Forte recomendacao de contratacao.',
        score: 5,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand7.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-01-18T09:00:00'),
      },
      {
        candidateId: cand7.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-01-18T09:00:00'),
        durationMinutes: 45,
        location: null,
        meetingLink: 'https://meet.google.com/mkt-interview-001',
        status: 'completed',
        feedback: 'Boa experiencia com campanhas digitais. Portfolio interessante.',
        score: 4,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand11.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2025-11-03T14:00:00'),
      },
      {
        candidateId: cand11.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2025-11-03T14:00:00'),
        durationMinutes: 30,
        location: 'Sala de Reuniao 1',
        meetingLink: null,
        status: 'completed',
        feedback: 'Estagiaria organizada e atenciosa. Boa opcao.',
        score: 5,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand11.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2025-11-08T10:30:00'),
      },
      {
        candidateId: cand11.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2025-11-08T10:30:00'),
        durationMinutes: 40,
        location: 'Sala de Reuniao 2',
        meetingLink: null,
        status: 'completed',
        feedback: 'Aprovada. Perfil adequado para estagio no financeiro.',
        score: 4,
      }
    )

    // Entrevistas agendadas (futuras)
    await Interview.updateOrCreate(
      {
        candidateId: cand4.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-02-15T10:00:00'),
      },
      {
        candidateId: cand4.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-02-15T10:00:00'),
        durationMinutes: 45,
        location: null,
        meetingLink: 'https://meet.google.com/carolina-interview-rh',
        status: 'scheduled',
        feedback: null,
        score: null,
      }
    )

    await Interview.updateOrCreate(
      {
        candidateId: cand9.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-02-12T15:00:00'),
      },
      {
        candidateId: cand9.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaRH.id,
        scheduledAt: DateTime.fromISO('2026-02-12T15:00:00'),
        durationMinutes: 40,
        location: 'Sala de Reuniao 3',
        meetingLink: null,
        status: 'scheduled',
        feedback: null,
        score: null,
      }
    )

    // Entrevista cancelada
    await Interview.updateOrCreate(
      {
        candidateId: cand12.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2025-11-12T11:00:00'),
      },
      {
        candidateId: cand12.id,
        interviewerId: managerEmployee.id,
        stageId: stageEntrevistaGestor.id,
        scheduledAt: DateTime.fromISO('2025-11-12T11:00:00'),
        durationMinutes: 45,
        location: null,
        meetingLink: 'https://meet.google.com/ricardo-interview',
        status: 'cancelled',
        feedback: 'Entrevista cancelada - candidato nao compareceu.',
        score: null,
      }
    )

    console.log('Entrevistas criadas: 11')
    console.log('Seed de recrutamento finalizado com sucesso!')
  }
}

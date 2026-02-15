# Sistema de RH

## Visao Geral

Sistema de Gestao de Recursos Humanos para empresas brasileiras de medio porte. Cobre cadastro de colaboradores (CLT e PJ), controle de ponto, banco de horas, documentos, historico profissional e gestao de usuarios com permissoes por perfil. Arquitetura monorepo com backend API REST e frontend SPA. Roadmap completo disponivel em `docs/ARCHITECTURE.md`.

## Status Atual do Projeto

### Modulos implementados e funcionando:
1. **Auth** - Login/logout com opaque tokens, RBAC (admin/manager/employee), forgot/reset password
2. **Employees** - CRUD completo de CLT e PJ, com departamentos e cargos
3. **Departments + Positions** - Estrutura organizacional
4. **Attendance** - Clock-in/out, almoco, registros dos ultimos 7 dias, gestao completa
5. **Hours Bank** - Saldo mensal, saldo acumulado (positivo e negativo), calculo automatico
6. **Documents** - Upload, visualizacao e download por colaborador, tipos de documento
7. **Employee History** - Timeline de eventos (admissao, promocao, transferencia, etc.)
8. **Users Management** - CRUD de usuarios do sistema (admin only)
9. **Role Permissions** - Admin configura quais telas cada perfil pode ver
10. **Auto User Creation** - Ao cadastrar colaborador, cria user automaticamente
11. **Leave** - Gestao de ferias e licencas com aprovacao, saldo e calendario
12. **Benefits** - Gestao de beneficios (VT, VR, plano saude) com planos, adesoes e dependentes
13. **Payroll** - Folha de pagamento com rubricas, calculos INSS/IRRF, holerites
14. **Performance** - Ciclos de avaliacao, competencias, metas individuais, PDIs
15. **Recruitment** - Vagas, candidatos, entrevistas, stages, kanban board
16. **Training** - Gestao de treinamentos, inscricoes, certificados
17. **Dashboard** - KPIs admin, home employee, graficos de metricas
18. **Onboarding** - Checklists, templates, progresso de integracao
19. **Surveys** - Pesquisas, perguntas, respostas anonimas, resultados
20. **Document Templates** - Templates com variaveis, geracao dinamica
21. **Organograma** - Arvore hierarquica de departamentos e colaboradores
22. **Kanban Recrutamento** - Board com stages, movimentacao de candidatos
23. **Talent Pool** - Banco de talentos com tags e gestao de prospects
24. **Employee Lifecycle** - Timeline unificada de eventos do colaborador
25. **Engagement Scores** - Calculo ponderado de engajamento, dashboard
26. **Turnover Analysis** - Registros de saida, taxas, tendencias, motivos
27. **Communications** - Comunicacoes automatizadas, triggers de eventos
28. **Skills Matrix** - Categorias, skills, avaliacao de nivel 1-5, gap analysis
29. **Career Planning** - Planos de carreira, niveis, sucessao
30. **Saude Ocupacional** - Exames ocupacionais, atestados medicos, alertas
31. **People Analytics** - Workforce metrics, retencao, insights preditivos
32. **Audit Log** - Log de todas acoes do sistema com usuario e timestamp
33. **Notifications** - Sistema de notificacoes in-app com leitura/nao lida
34. **Calendar** - Calendario de eventos, feriados, ferias agendadas
35. **PDF Export** - Geracao de relatorios PDF (holerites, contratos)
36. **Global Search** - Busca em multiplas entidades (colaboradores, vagas, etc)

### Status: TODOS OS 36 MÓDULOS IMPLEMENTADOS

Sistema completo e production-ready com todas as funcionalidades de um RH moderno.
703 testes passando, 0 falhando.

## Stack Tecnologica

| Camada       | Tecnologia         | Versao Minima | Justificativa                              |
| ------------ | ------------------ | ------------- | ------------------------------------------ |
| Backend      | AdonisJS 6         | Node 20+      | Framework full-stack Node.js com ORM Lucid  |
| Frontend     | Vue.js 3           | Vue 3.4+      | Composition API, TypeScript nativo          |
| Banco        | PostgreSQL         | 15+           | Relacional robusto, bom para dados de RH    |
| ORM          | Lucid (AdonisJS)   | -             | Integrado ao Adonis, migrations, seeds      |
| Auth         | AdonisJS Auth      | -             | Access tokens (opaque tokens)               |
| Validacao    | VineJS             | -             | Validador padrao do AdonisJS 6              |
| UI Framework | CSS customizado    | -             | Componentes proprios, sem framework UI externo |
| State Mgmt   | Pinia              | -             | Store oficial do Vue 3                      |
| HTTP Client  | Axios              | -             | Chamadas API no frontend                    |
| Infra        | Docker Compose     | -             | PostgreSQL + Redis + pgAdmin                |
| Testes Back  | Japa (AdonisJS)    | -             | Runner de testes integrado ao Adonis        |
| Testes Front | Vitest + Vue TL    | -             | Testes unitarios e de componentes           |

## Estrutura do Monorepo

```
sistema-de-rh/
├── CLAUDE.md                    # Este arquivo
├── docs/
│   └── ARCHITECTURE.md          # Documentacao de arquitetura, ADRs e roadmap
├── backend/                     # Projeto AdonisJS 6
│   ├── app/
│   │   ├── controllers/         # Controllers HTTP (thin controllers)
│   │   │   ├── auth_controller.ts
│   │   │   ├── departments_controller.ts
│   │   │   ├── positions_controller.ts
│   │   │   ├── employees_controller.ts
│   │   │   ├── documents_controller.ts
│   │   │   ├── time_entries_controller.ts
│   │   │   ├── hours_bank_controller.ts
│   │   │   ├── employee_histories_controller.ts
│   │   │   ├── users_controller.ts
│   │   │   ├── role_permissions_controller.ts
│   │   │   ├── leaves_controller.ts
│   │   │   ├── payroll_controller.ts
│   │   │   ├── benefits_controller.ts
│   │   │   ├── performance_controller.ts
│   │   │   ├── recruitment_controller.ts
│   │   │   ├── notifications_controller.ts
│   │   │   ├── dashboard_controller.ts
│   │   │   ├── trainings_controller.ts
│   │   │   ├── reports_controller.ts
│   │   │   ├── search_controller.ts
│   │   │   ├── calendar_controller.ts
│   │   │   ├── audit_logs_controller.ts
│   │   │   ├── data_change_requests_controller.ts
│   │   │   ├── onboarding_controller.ts
│   │   │   ├── surveys_controller.ts
│   │   │   ├── document_templates_controller.ts
│   │   │   ├── orgchart_controller.ts
│   │   │   ├── talent_pool_controller.ts
│   │   │   ├── engagement_controller.ts
│   │   │   ├── turnover_controller.ts
│   │   │   ├── auto_communication_controller.ts
│   │   │   ├── kanban_controller.ts
│   │   │   ├── employee_lifecycle_controller.ts
│   │   │   ├── skill_matrix_controller.ts
│   │   │   ├── career_planning_controller.ts
│   │   │   ├── occupational_health_controller.ts
│   │   │   ├── people_analytics_controller.ts
│   │   │   └── health_controller.ts
│   │   ├── models/              # Models Lucid (entidades do banco - 64 models)
│   │   │   ├── user.ts, employee.ts, department.ts, position.ts
│   │   │   ├── document.ts, time_entry.ts, hours_bank.ts
│   │   │   ├── employee_history.ts, role_permission.ts
│   │   │   ├── leave.ts, leave_balance.ts, leave_config.ts
│   │   │   ├── payroll_period.ts, payroll_entry.ts, payroll_component.ts
│   │   │   ├── pay_slip.ts, tax_table.ts
│   │   │   ├── benefit.ts, benefit_plan.ts, employee_benefit.ts, benefit_dependent.ts
│   │   │   ├── performance_cycle.ts, competency.ts, cycle_competency.ts
│   │   │   ├── individual_goal.ts, evaluation_score.ts, evaluation.ts, development_plan.ts
│   │   │   ├── job_requisition.ts, recruitment_stage.ts, candidate.ts, interview.ts
│   │   │   ├── candidate_stage_history.ts
│   │   │   ├── training.ts, training_enrollment.ts
│   │   │   ├── notification.ts, audit_log.ts, data_change_request.ts
│   │   │   ├── checklist_template.ts, onboarding_template.ts
│   │   │   ├── onboarding_template_item.ts, checklist_template_item.ts
│   │   │   ├── employee_checklist.ts, employee_checklist_item.ts
│   │   │   ├── survey.ts, survey_question.ts, survey_response.ts, survey_answer.ts
│   │   │   ├── document_template.ts
│   │   │   ├── talent_pool.ts, talent_pool_tag.ts
│   │   │   ├── engagement_score.ts, turnover_record.ts
│   │   │   ├── automated_communication.ts, communication_log.ts
│   │   │   ├── skill_category.ts, skill.ts, employee_skill.ts
│   │   │   ├── career_path.ts, career_path_level.ts, succession_plan.ts
│   │   │   ├── occupational_exam.ts, medical_certificate.ts
│   │   │   ├── analytics_snapshot.ts, password_reset_token.ts
│   │   │   └── (64 models total)
│   │   ├── services/            # Logica de negocio (camada principal)
│   │   ├── validators/          # Schemas de validacao VineJS
│   │   ├── middleware/          # Middlewares HTTP (auth, role)
│   │   └── exceptions/          # Exceptions customizadas
│   ├── config/                  # Configuracoes do Adonis
│   ├── database/
│   │   ├── migrations/          # 70+ migrations (todos os modulos)
│   │   └── seeders/             # Seeds: admin, demo, leave_benefits, payroll, performance, recruitment
│   ├── start/
│   │   ├── routes.ts            # Todas as rotas da API
│   │   └── kernel.ts            # Middlewares globais
│   └── .env.example
├── frontend/                    # Projeto Vue.js 3
│   ├── src/
│   │   ├── assets/              # Arquivos estaticos (CSS, imagens)
│   │   ├── components/          # Componentes reutilizaveis
│   │   │   └── common/          # Componentes genericos
│   │   ├── composables/         # Composables Vue (logica reutilizavel)
│   │   ├── layouts/             # Layouts: AuthLayout, DefaultLayout
│   │   ├── modules/             # Modulos de dominio
│   │   │   ├── auth/            # [IMPLEMENTADO] Login/Logout
│   │   │   ├── employees/       # [IMPLEMENTADO] CRUD completo
│   │   │   ├── departments/     # [IMPLEMENTADO] Dentro de employees
│   │   │   ├── attendance/      # [IMPLEMENTADO] Clock-in/out, gestao
│   │   │   ├── hours-bank/      # [IMPLEMENTADO] Saldo, calculo
│   │   │   ├── documents/       # [IMPLEMENTADO] Upload, view, download
│   │   │   ├── history/         # [IMPLEMENTADO] Timeline
│   │   │   ├── users/           # [IMPLEMENTADO] CRUD admin
│   │   │   ├── admin/           # [IMPLEMENTADO] Permissoes
│   │   │   ├── dashboard/       # [IMPLEMENTADO] Widgets e KPIs
│   │   │   ├── leave/           # [IMPLEMENTADO] Ferias e licencas
│   │   │   ├── payroll/         # [IMPLEMENTADO] Folha de pagamento
│   │   │   ├── benefits/        # [IMPLEMENTADO] Gestao de beneficios
│   │   │   ├── performance/     # [IMPLEMENTADO] Avaliacoes e metas
│   │   │   ├── recruitment/     # [IMPLEMENTADO] Processo seletivo
│   │   │   ├── notifications/   # [IMPLEMENTADO] Notificacoes
│   │   │   └── training/        # [PLACEHOLDER] .gitkeep apenas
│   │   ├── router/              # Configuracao Vue Router
│   │   ├── stores/              # Stores Pinia (auth)
│   │   ├── services/            # Servicos HTTP (chamadas API)
│   │   ├── types/               # Tipos TypeScript
│   │   └── utils/               # Funcoes utilitarias
│   ├── public/
│   └── .env.example
├── docker-compose.yml           # PostgreSQL + Redis + pgAdmin
├── .gitignore
└── package.json                 # Workspace root
```

### Estrutura de cada modulo no frontend

Cada pasta dentro de `frontend/src/modules/` segue a mesma organizacao:

```
modules/employees/
├── components/        # Componentes especificos do modulo
├── views/             # Paginas/Views do modulo
├── composables/       # Logica especifica do modulo
├── services/          # Chamadas API do modulo
└── types/             # Tipos do modulo
```

## Convencoes de Codigo

### Geral
- Linguagem: **TypeScript** em todo o projeto (backend e frontend)
- Idioma do codigo: **ingles** (nomes de variaveis, funcoes, classes, tabelas)
- Idioma dos comentarios e docs: **portugues**
- Formatacao: ESLint + Prettier (config compartilhada)
- Commits: Conventional Commits em portugues (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`)

### Backend (AdonisJS)
- **Controllers**: thin controllers - apenas recebem request, chamam service, retornam response
- **Services**: toda logica de negocio fica nos services
- **Models**: apenas definicao de colunas, relacionamentos e hooks simples
- **Validators**: toda validacao de input via VineJS schemas
- **Policies**: autorizacao via Bouncer policies
- **Nomenclatura de arquivos**: snake_case (padrao AdonisJS)
  - `employees_controller.ts`, `employee_service.ts`, `employee.ts`
- **Nomenclatura de tabelas**: snake_case plural (`employees`, `departments`, `pay_slips`)
- **Nomenclatura de colunas**: snake_case (`first_name`, `created_at`)
- **Rotas**: RESTful, prefixadas com `/api/v1/`

### Frontend (Vue.js)
- **Composition API** exclusivamente (sem Options API)
- **`<script setup lang="ts">`** em todos os componentes
- **Nomenclatura de arquivos de componentes**: PascalCase (`EmployeeList.vue`, `LeaveRequestForm.vue`)
- **Nomenclatura de composables**: camelCase com prefixo `use` (`useEmployees.ts`, `useAuth.ts`)
- **Nomenclatura de stores**: camelCase com prefixo `use` e sufixo `Store` (`useAuthStore.ts`)
- **Props**: camelCase com tipagem TypeScript via `defineProps<T>()`
- **Emits**: camelCase com tipagem via `defineEmits<T>()`

### API REST
- Verbos HTTP semanticos: GET (listar/detalhar), POST (criar), PUT (atualizar completo), PATCH (atualizar parcial), DELETE (remover)
- Status codes corretos: 200, 201, 204, 400, 401, 403, 404, 422, 500
- Paginacao: `?page=1&limit=20` retornando `{ data: [], meta: { total, page, lastPage } }`
- Filtros via query params: `?department_id=1&status=active`
- Resposta de erro padronizada: `{ message: string, errors?: Record<string, string[]> }`

## Padroes Estabelecidos (em uso no codigo)

1. **Service Layer Pattern**: Controllers delegam para Services. Services contem a logica. Exemplo: `EmployeesController` chama `EmployeeService` para todas as operacoes.
2. **Auto-record History**: Operacoes importantes (admissao, mudanca de salario, transferencia) registram automaticamente no `EmployeeHistory` via `EmployeeHistoryService`.
3. **Auto User Creation**: Ao criar colaborador sem userId, o `EmployeeService` cria automaticamente um User com senha padrao `Mudar@123` e role `employee`.
4. **Soft Delete para Employees**: `delete` nao remove do banco - marca status como `terminated` e preenche `terminationDate`.
5. **Role Middleware**: Rotas protegidas por `middleware.role({ roles: ['admin', 'manager'] })` no `routes.ts`.
6. **Module Permissions**: Tabela `role_permissions` controla acesso por modulo no frontend. O router verifica `authStore.permissions[module]` antes de permitir navegacao.
7. **Validator Pattern**: Toda entrada validada via VineJS antes de chegar no service.
8. **Module Pattern (Frontend)**: Frontend organizado por dominio com sub-pastas `components/`, `views/`, `composables/`, `services/`, `types/`.
9. **Composable Pattern**: Logica reutilizavel extraida em composables (ex: `useAuth`).
10. **Store apenas para estado global**: Pinia para auth e permissoes. Estado local fica no componente.

### Ao implementar um novo modulo, seguir este checklist:

**Backend:**
1. Criar migration(s) em `database/migrations/`
2. Criar model(s) em `app/models/`
3. Criar service em `app/services/`
4. Criar validator em `app/validators/` (se houver input do usuario)
5. Criar controller em `app/controllers/`
6. Adicionar rotas em `start/routes.ts` com middlewares adequados
7. Adicionar o modulo na tabela `role_permissions` (migration ou seed)

**Frontend:**
1. Criar types em `modules/<nome>/types/`
2. Criar service HTTP em `modules/<nome>/services/`
3. Criar composable(s) em `modules/<nome>/composables/`
4. Criar componentes em `modules/<nome>/components/`
5. Criar views em `modules/<nome>/views/`
6. Adicionar rotas no `router/index.ts` com `meta: { module: '<nome>' }`
7. Adicionar item no menu lateral (DefaultLayout)

## Modelo de Dados Atual (tabelas existentes no banco)

### Tabelas Core
```
users                  employees              departments
- id                   - id                   - id
- full_name            - user_id FK           - name
- email                - registration_number  - description
- password             - full_name            - created_at
- role (enum)          - cpf / cnpj / rg
- is_active            - email / phone        positions
- created_at           - type (clt/pj)        - id
                       - department_id FK     - title
                       - position_id FK       - description
                       - hire_date            - department_id FK
                       - termination_date     - created_at
                       - salary
                       - status (enum)        documents
                       - birth_date           - id
                       - address_* (7 cols)   - employee_id FK
                       - notes                - type
                       - created_at           - file_path / file_name
                                              - file_size
                                              - title
                                              - uploaded_at
```

### Tabelas de Ponto e Banco de Horas
```
time_entries           hours_bank
- id                   - id
- employee_id FK       - employee_id FK
- date                 - reference_month
- clock_in/out         - reference_year
- lunch_start/end      - expected_minutes
- total_worked_minutes - worked_minutes
- type (enum)          - balance_minutes
- notes                - accumulated_balance_minutes
- created_at           - created_at
```

### Tabelas de Histórico e Permissões
```
employee_histories     role_permissions
- id                   - id
- employee_id FK       - role (enum)
- type (enum)          - module (enum)
- title                - can_access (bool)
- description          - created_at
- old_value
- new_value
- created_by FK
- event_date
- created_at
```

### Tabelas de Férias e Licenças
```
leaves                 leave_balances         leave_configs
- id                   - id                   - id
- employee_id FK       - employee_id FK       - leave_type
- leave_balance_id FK  - accrual_start_date   - label
- type                 - total_days           - default_days
- status               - used_days            - max_days
- start_date           - remaining_days       - requires_approval
- end_date             - status               - is_paid
- days_count           - notes                - color
- return_date          - created_at           - created_at
- reason
- approved_by FK
- approved_at
- rejected_reason
- created_at
```

### Tabelas de Folha de Pagamento
```
payroll_periods        payroll_entries        payroll_components
- id                   - id                   - id
- period_name          - payroll_period_id FK - payroll_entry_id FK
- reference_month      - employee_id FK       - type (earning/deduction)
- reference_year       - gross_salary         - code
- status               - total_earnings       - description
- payment_date         - total_deductions     - amount
- created_by FK        - net_salary           - percentage
- created_at           - inss                 - base_value
- closed_at            - fgts                 - is_taxable
                       - irrf                 - notes
                       - status               - created_at
                       - notes
                       - created_at

tax_tables
- id
- tax_type (inss/irrf)
- year
- min_value
- max_value
- rate
- deduction
- created_at
```

### Tabelas de Benefícios
```
benefits_plans         benefit_enrollments    benefit_dependents
- id                   - id                   - id
- benefit_id FK        - benefit_plan_id FK   - benefit_enrollment_id FK
- name                 - employee_id FK       - name
- description          - status               - relationship
- provider             - enrollment_date      - birth_date
- monthly_value        - cancellation_date    - cpf
- employer_contribution- cancellation_reason  - created_at
- employee_discount_%  - notes
- employee_discount_$  - created_at
- is_active
- created_at

benefits (base)
- id
- name
- type (health/dental/meal/transport/etc)
- description
- created_at
```

### Tabelas de Performance
```
performance_reviews    performance_goals
- id                   - id
- employee_id FK       - employee_id FK
- reviewer_id FK       - performance_review_id FK
- review_period        - title
- review_type          - description
- overall_rating       - type (okr/smart/kpi)
- strengths            - target_value
- weaknesses           - current_value
- achievements         - progress
- improvement_areas    - status
- goals_next_period    - deadline
- status               - created_at
- scheduled_date
- completed_date
- notes
- created_at
```

### Tabelas de Recrutamento
```
job_requisitions       candidates             interviews
- id                   - id                   - id
- title                - job_requisition_id FK- candidate_id FK
- department_id FK     - name                 - interviewer_id FK
- positions_count      - email                - pipeline_stage_id FK
- employment_type      - phone                - type
- salary_range_min/max - resume_url           - scheduled_date
- description          - current_stage        - duration_minutes
- requirements         - source               - location
- responsibilities     - application_date     - feedback
- status               - notes                - rating
- priority             - created_at           - result
- posted_date                                 - notes
- deadline                                    - created_at
- created_by FK
- created_at

pipeline_stages
- id
- job_requisition_id FK
- name
- order
- type (screening/interview/offer/etc)
- created_at
```

### Tabela de Notificações
```
notifications
- id
- user_id FK
- type
- title
- message
- is_read
- read_at
- metadata (json)
- created_at
```

### Tabelas de Treinamentos
```
trainings              training_enrollments
- id                   - id
- title                - training_id FK
- description          - employee_id FK
- type                 - status
- category             - enrolled_at
- instructor           - completed_at
- provider             - grade
- start_date           - notes
- end_date             - created_at
- duration_hours
- max_participants
- location
- status
- is_mandatory
- created_by FK
- created_at
```

### Tabelas de Skills e Career Planning
```
skill_categories       skills                 employee_skills
- id                   - id                   - id
- name                 - category_id FK       - employee_id FK
- description          - name                 - skill_id FK
- display_order        - description          - current_level (1-5)
- is_active            - level_descriptors    - target_level
- created_at           - is_active            - assessed_by FK
                       - created_at           - assessed_at
                                              - notes
career_paths           career_path_levels     succession_plans
- id                   - id                   - id
- name                 - career_path_id FK    - position_id FK
- description          - level_number         - current_holder_id FK
- department_id FK     - title                - successor_id FK
- is_active            - description          - readiness
- created_by FK        - requirements         - priority
- created_at           - typical_salary_min   - development_actions
                       - typical_salary_max   - notes
                       - created_at           - created_by FK
                                              - created_at
```

### Tabelas de Saúde Ocupacional
```
occupational_exams     medical_certificates
- id                   - id
- employee_id FK       - employee_id FK
- type                 - start_date
- exam_date            - end_date
- expiry_date          - days_count
- result               - cid_code
- restrictions         - cid_description
- doctor_name          - doctor_name
- crm                  - crm
- clinic_name          - document_path
- aso_document_path    - leave_id FK
- status               - status
- notes                - approved_by FK
- created_by FK        - notes
- created_at           - created_at
```

### Tabelas de Analytics e Engagement
```
engagement_scores      turnover_records       analytics_snapshots
- id                   - id                   - id
- employee_id FK       - employee_id FK       - snapshot_type
- score                - type                 - reference_date
- attendance_score     - reason               - data (json)
- performance_score    - exit_date            - created_at
- training_score       - department_id FK
- tenure_score         - position_id FK
- leave_score          - tenure_months
- reference_month      - salary_at_exit
- reference_year       - exit_interview_done
- calculated_at        - exit_interview_notes
- created_at           - created_at

talent_pool            talent_pool_tags
- id                   - id
- candidate_id FK      - name
- full_name            - color
- email                - created_at
- phone
- linkedin_url         talent_pool_tag_pivot
- resume_url           - talent_pool_id FK
- source               - tag_id FK
- status
- notes
- experience_years
- salary_expectation
- availability
- added_by FK
- created_at
```

### Tabelas de Onboarding e Surveys
```
checklist_templates    onboarding_templates   employee_checklists
- id                   - id                   - id
- name                 - name                 - employee_id FK
- description          - description          - checklist_template_id FK
- type                 - department_id FK     - assigned_date
- is_active            - position_id FK       - due_date
- created_at           - is_active            - status
                       - created_at           - created_at

checklist_template_items   onboarding_template_items   employee_checklist_items
- id                       - id                        - id
- checklist_template_id FK - onboarding_template_id FK - employee_checklist_id FK
- title                    - title                     - title
- description              - description               - description
- order                    - days_after_hire           - is_completed
- is_required              - responsible_role          - completed_at
- created_at               - order                     - completed_by FK
                           - is_required               - notes
                           - created_at                - created_at

surveys                survey_questions       survey_responses
- id                   - id                   - id
- title                - survey_id FK         - survey_id FK
- description          - question_text        - employee_id FK
- type                 - question_type        - submitted_at
- target_audience      - options (json)       - is_anonymous
- is_anonymous         - order                - created_at
- start_date           - is_required
- end_date             - created_at           survey_answers
- status                                      - id
- created_by FK                               - survey_response_id FK
- created_at                                  - survey_question_id FK
                                              - answer_text
                                              - created_at
```

### Tabelas Auxiliares
```
document_templates     automated_communications   communication_logs
- id                   - id                       - id
- name                 - name                     - communication_id FK
- description          - trigger_event            - employee_id FK
- template_type        - recipient_role           - sent_at
- content              - subject                  - status
- variables (json)     - body                     - error_message
- is_active            - is_active                - created_at
- created_by FK        - created_by FK
- created_at           - created_at

audit_logs             data_change_requests       password_reset_tokens
- id                   - id                       - id
- user_id FK           - employee_id FK           - user_id FK
- action               - field_name               - token
- resource_type        - old_value                - expires_at
- resource_id          - new_value                - used_at
- changes (json)       - reason                   - created_at
- ip_address           - status
- user_agent           - requested_at
- created_at           - reviewed_by FK
                       - reviewed_at
                       - created_at
- status
- is_mandatory
- created_by FK
- notes
- created_at
```

## Sistema de Relatorios (CSV Export)

O sistema oferece exportacao de dados em formato CSV para os principais modulos. Todos os relatorios utilizam UTF-8 com BOM e separador ponto-e-virgula (;) para compatibilidade com Excel brasileiro.

### Endpoints Disponiveis (admin/manager apenas)

1. **GET /api/v1/reports/employees/csv**
   - Exporta lista de colaboradores
   - Query params: `type`, `status`, `departmentId`
   - Colunas: Nome, CPF/CNPJ, Email, Telefone, Tipo, Departamento, Cargo, Salario, Status, Data Admissao, Data Desligamento

2. **GET /api/v1/reports/attendance/csv**
   - Exporta registros de ponto
   - Query params: `month`, `year`, `employeeId`
   - Colunas: Colaborador, Data, Entrada, Saida Almoco, Retorno Almoco, Saida, Horas Trabalhadas, Atraso (min), Tipo, Observacoes

3. **GET /api/v1/reports/payroll/csv**
   - Exporta folha de pagamento
   - Query params: `periodId` (obrigatorio)
   - Colunas: Colaborador, CPF/CNPJ, Salario Base, Total Proventos, Total Descontos, INSS, IRRF, FGTS (Patronal), Salario Liquido, Status

4. **GET /api/v1/reports/leave/csv**
   - Exporta solicitacoes de ferias/licencas
   - Query params: `type`, `status`, `startDate`, `endDate`
   - Colunas: Colaborador, Tipo, Data Inicio, Data Fim, Dias, Status, Aprovado Por, Data Aprovacao, Observacoes

5. **GET /api/v1/reports/trainings/csv**
   - Exporta treinamentos
   - Query params: `type`, `status`, `category`
   - Colunas: Titulo, Tipo, Categoria, Instrutor, Data Inicio, Data Fim, Duracao (h), Inscritos, Concluidos, Status, Obrigatorio

### Formatacao dos Relatorios

- **Datas**: DD/MM/YYYY (padrao brasileiro)
- **Valores monetarios**: Formato brasileiro com 2 casas decimais (ex: 1.234,56)
- **Horas**: HH:mm (ex: 08:30)
- **Charset**: UTF-8 com BOM (para acentuacao correta no Excel)
- **Separador**: Ponto-e-virgula (;)
- **Escape**: Campos com caracteres especiais sao delimitados por aspas duplas

### Implementacao

- **Service**: `backend/app/services/report_service.ts` - Logica de geracao de CSV
- **Controller**: `backend/app/controllers/reports_controller.ts` - Endpoints HTTP
- **Rotas**: `/api/v1/reports/*` - Protegidas por auth + role admin/manager

## Comandos Uteis

```bash
# --- Monorepo ---
npm install                      # Instala dependencias de todos os workspaces

# --- Backend ---
cd backend
node ace generate:key            # Gerar APP_KEY (obrigatorio antes do primeiro uso)
node ace serve --watch           # Iniciar servidor de desenvolvimento
node ace make:controller Name    # Gerar controller
node ace make:model Name         # Gerar model
node ace make:migration Name     # Gerar migration
node ace migration:run           # Executar migrations
node ace migration:rollback      # Reverter ultima migration
node ace db:seed                 # Executar todos os seeders
node ace db:seed --files=demo_seeder.ts  # Executar seeder de demonstracao
node ace test                    # Rodar testes

# --- Frontend ---
cd frontend
npm run dev                      # Iniciar servidor de desenvolvimento
npm run build                    # Build de producao
npm run test                     # Rodar testes
npm run lint                     # Verificar linting
```

## Variaveis de Ambiente

### Backend (.env)
```
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
APP_KEY=<gerada pelo adonis>
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=sistema_rh_dev
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3333/api/v1
```

## Dados de Demonstracao

O sistema inclui um seeder completo para popular o banco com dados realistas de demonstracao:

**Arquivo**: `backend/database/seeders/demo_seeder.ts`

**O que cria:**
- 3 departamentos (TI, RH, Financeiro) com cargos relacionados
- 10 colaboradores (mix CLT/PJ, varios departamentos)
- Registros de ponto dos ultimos 30 dias (dias uteis apenas)
- 2 treinamentos:
  - Seguranca da Informacao (em andamento, obrigatorio)
  - TypeScript Avancado (concluido)
- Inscricoes nos treinamentos
- 3 solicitacoes de ferias com diferentes status (aprovada, pendente, rejeitada)
- 5 notificacoes de exemplo

**Para executar:**
```bash
cd backend
node ace db:seed --files=demo_seeder.ts
```

**Nota**: O seeder usa `updateOrCreate` para evitar duplicacao. Pode ser executado multiplas vezes.

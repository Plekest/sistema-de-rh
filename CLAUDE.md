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
11. **Leave** - Gestao de ferias e licencas com aprovacao, saldo e calendário
12. **Payroll** - Folha de pagamento com rubricas, calculos e impostos
13. **Benefits** - Gestao de beneficios (VT, VR, plano saúde) com planos e adesões
14. **Performance** - Avaliações de desempenho e metas (OKRs)
15. **Recruitment** - Processo seletivo completo (vagas, candidatos, entrevistas, pipeline)
16. **Dashboard** - Visão geral com widgets de métricas e KPIs do RH
17. **Notifications** - Sistema de notificações em tempo real

### Modulos planejados (pastas criadas, sem implementacao):
- **Training** - Gestão de treinamentos e desenvolvimento

### Proximo modulo a implementar: **Training**

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
│   │   │   └── dashboard_controller.ts
│   │   ├── models/              # Models Lucid (entidades do banco)
│   │   │   ├── user.ts
│   │   │   ├── employee.ts       # Suporta CLT e PJ (campo type)
│   │   │   ├── department.ts
│   │   │   ├── position.ts
│   │   │   ├── document.ts
│   │   │   ├── time_entry.ts
│   │   │   ├── hours_bank.ts
│   │   │   ├── employee_history.ts
│   │   │   ├── role_permission.ts
│   │   │   ├── leave.ts
│   │   │   ├── leave_balance.ts
│   │   │   ├── leave_config.ts
│   │   │   ├── payroll_period.ts
│   │   │   ├── payroll_entry.ts
│   │   │   ├── payroll_component.ts
│   │   │   ├── tax_table.ts
│   │   │   ├── benefit_plan.ts
│   │   │   ├── benefit_enrollment.ts
│   │   │   ├── performance_review.ts
│   │   │   ├── performance_goal.ts
│   │   │   ├── job_requisition.ts
│   │   │   ├── candidate.ts
│   │   │   ├── interview.ts
│   │   │   ├── pipeline_stage.ts
│   │   │   └── notification.ts
│   │   ├── services/            # Logica de negocio (camada principal)
│   │   ├── validators/          # Schemas de validacao VineJS
│   │   ├── middleware/          # Middlewares HTTP (auth, role)
│   │   └── exceptions/          # Exceptions customizadas
│   ├── config/                  # Configuracoes do Adonis
│   ├── database/
│   │   ├── migrations/          # 30+ migrations (users, employees, leave, payroll, benefits, etc)
│   │   └── seeders/             # Seeds para desenvolvimento
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

## Comandos Uteis

```bash
# --- Monorepo ---
npm install                      # Instala dependencias de todos os workspaces

# --- Backend ---
cd backend
node ace serve --watch           # Iniciar servidor de desenvolvimento
node ace make:controller Name    # Gerar controller
node ace make:model Name         # Gerar model
node ace make:migration Name     # Gerar migration
node ace migration:run           # Executar migrations
node ace migration:rollback      # Reverter ultima migration
node ace db:seed                 # Executar seeders
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

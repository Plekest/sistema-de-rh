# Sistema de RH

## Visao Geral

Sistema de Gestao de Recursos Humanos para empresas brasileiras de medio porte. Cobre cadastro de colaboradores (CLT e PJ), controle de ponto, banco de horas, documentos, historico profissional e gestao de usuarios com permissoes por perfil. Arquitetura monorepo com backend API REST e frontend SPA. Roadmap completo disponivel em `docs/ARCHITECTURE.md`.

## Status Atual do Projeto

### Modulos implementados e funcionando:
1. **Auth** - Login/logout com opaque tokens, RBAC (admin/manager/employee)
2. **Employees** - CRUD completo de CLT e PJ, com departamentos e cargos
3. **Departments + Positions** - Estrutura organizacional
4. **Attendance** - Clock-in/out, almoco, registros dos ultimos 7 dias
5. **Hours Bank** - Saldo mensal, saldo acumulado (positivo e negativo)
6. **Documents** - Upload, visualizacao e download por colaborador
7. **Employee History** - Timeline de eventos (admissao, promocao, transferencia, etc.)
8. **Users Management** - CRUD de usuarios do sistema (admin only)
9. **Role Permissions** - Admin configura quais telas cada perfil pode ver
10. **Auto User Creation** - Ao cadastrar colaborador, cria user automaticamente

### Modulos planejados (pastas criadas, sem implementacao):
- Leave (ferias/licencas), Payroll (folha), Benefits, Performance, Recruitment, Training, Dashboard (apenas card de boas-vindas)

### Proximo modulo a implementar: **Ferias e Licencas (Leave)**

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
│   │   │   └── role_permissions_controller.ts
│   │   ├── models/              # Models Lucid (entidades do banco)
│   │   │   ├── user.ts
│   │   │   ├── employee.ts       # Suporta CLT e PJ (campo type)
│   │   │   ├── department.ts
│   │   │   ├── position.ts
│   │   │   ├── document.ts
│   │   │   ├── time_entry.ts
│   │   │   ├── hours_bank.ts
│   │   │   ├── employee_history.ts
│   │   │   └── role_permission.ts
│   │   ├── services/            # Logica de negocio (camada principal)
│   │   ├── validators/          # Schemas de validacao VineJS
│   │   ├── middleware/          # Middlewares HTTP (auth, role)
│   │   └── exceptions/          # Exceptions customizadas
│   ├── config/                  # Configuracoes do Adonis
│   ├── database/
│   │   ├── migrations/          # 11 migrations (users ate role_permissions)
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
│   │   │   ├── dashboard/       # [PLACEHOLDER] Apenas welcome card
│   │   │   ├── leave/           # [PLACEHOLDER] .gitkeep apenas
│   │   │   ├── payroll/         # [PLACEHOLDER] .gitkeep apenas
│   │   │   ├── benefits/        # [PLACEHOLDER] .gitkeep apenas
│   │   │   ├── performance/     # [PLACEHOLDER] .gitkeep apenas
│   │   │   ├── recruitment/     # [PLACEHOLDER] .gitkeep apenas
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
time_entries           - position_id FK       - description
- id                   - hire_date            - department_id FK
- employee_id FK       - termination_date     - created_at
- date                 - salary
- clock_in/out         - status (enum)        documents
- lunch_start/end      - birth_date           - id
- total_worked_minutes - address_* (7 cols)   - employee_id FK
- type (enum)          - notes                - type
- notes                - created_at           - file_path / file_name
                                              - uploaded_at
hours_bank             employee_histories
- id                   - id                   role_permissions
- employee_id FK       - employee_id FK       - id
- reference_month      - type (enum: hire,    - role (enum)
- reference_year         promotion, transfer, - module (enum)
- expected_minutes       salary_change, etc.) - can_access (bool)
- worked_minutes       - title                - created_at
- balance_minutes      - description
- accumulated_balance  - old_value/new_value
                       - created_by FK
                       - event_date
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

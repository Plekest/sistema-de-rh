# Sistema de RH

## Visao Geral

Sistema de Gestao de Recursos Humanos completo, cobrindo desde cadastro de funcionarios ate folha de pagamento, controle de ponto, ferias, avaliacao de desempenho, recrutamento e beneficios. Arquitetura monorepo com backend API REST e frontend SPA.

## Stack Tecnologica

| Camada       | Tecnologia         | Versao Minima | Justificativa                              |
| ------------ | ------------------ | ------------- | ------------------------------------------ |
| Backend      | AdonisJS 6         | Node 20+      | Framework full-stack Node.js com ORM Lucid  |
| Frontend     | Vue.js 3           | Vue 3.4+      | Composition API, TypeScript nativo          |
| Banco        | PostgreSQL         | 15+           | Relacional robusto, bom para dados de RH    |
| ORM          | Lucid (AdonisJS)   | -             | Integrado ao Adonis, migrations, seeds      |
| Auth         | AdonisJS Auth      | -             | Access tokens (opaque tokens)               |
| Validacao    | VineJS             | -             | Validador padrao do AdonisJS 6              |
| UI Framework | PrimeVue ou Vuetify| -             | Componentes prontos para sistema corporativo |
| State Mgmt   | Pinia              | -             | Store oficial do Vue 3                      |
| HTTP Client  | Axios              | -             | Chamadas API no frontend                    |
| Testes Back  | Japa (AdonisJS)    | -             | Runner de testes integrado ao Adonis        |
| Testes Front | Vitest + Vue TL    | -             | Testes unitarios e de componentes           |

## Estrutura do Monorepo

```
sistema-de-rh/
├── CLAUDE.md                    # Este arquivo
├── docs/
│   └── ARCHITECTURE.md          # Documentacao de arquitetura e ADRs
├── backend/                     # Projeto AdonisJS 6
│   ├── app/
│   │   ├── controllers/         # Controllers HTTP (thin controllers)
│   │   ├── models/              # Models Lucid (entidades do banco)
│   │   ├── services/            # Logica de negocio (camada principal)
│   │   ├── validators/          # Schemas de validacao VineJS
│   │   ├── policies/            # Politicas de autorizacao (Bouncer)
│   │   ├── middleware/          # Middlewares HTTP
│   │   ├── exceptions/          # Exceptions customizadas
│   │   └── types/               # Tipos TypeScript compartilhados
│   ├── config/                  # Configuracoes do Adonis
│   ├── database/
│   │   ├── migrations/          # Migrations do banco
│   │   ├── seeders/             # Seeds para desenvolvimento
│   │   └── factories/           # Factories para testes
│   ├── start/
│   │   ├── routes.ts            # Definicao de rotas
│   │   ├── kernel.ts            # Middlewares globais
│   │   └── events.ts            # Listeners de eventos
│   ├── tests/
│   │   ├── unit/                # Testes unitarios (services)
│   │   └── functional/          # Testes de API (controllers)
│   └── .env.example
├── frontend/                    # Projeto Vue.js 3
│   ├── src/
│   │   ├── assets/              # Arquivos estaticos (CSS, imagens)
│   │   ├── components/          # Componentes reutilizaveis
│   │   │   └── common/          # Componentes genericos (Button, Modal...)
│   │   ├── composables/         # Composables Vue (logica reutilizavel)
│   │   ├── layouts/             # Layouts de pagina (Default, Auth)
│   │   ├── modules/             # Modulos de dominio (ver abaixo)
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── payroll/
│   │   │   ├── attendance/
│   │   │   ├── leave/
│   │   │   ├── performance/
│   │   │   ├── recruitment/
│   │   │   ├── training/
│   │   │   ├── benefits/
│   │   │   └── dashboard/
│   │   ├── router/              # Configuracao Vue Router
│   │   ├── stores/              # Stores Pinia
│   │   ├── services/            # Servicos HTTP (chamadas API)
│   │   ├── types/               # Tipos TypeScript
│   │   └── utils/               # Funcoes utilitarias
│   ├── public/
│   └── .env.example
├── .gitignore
└── package.json                 # Workspace root (scripts compartilhados)
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

## Padroes a Seguir

1. **Service Layer Pattern**: Controllers delegam para Services. Services contem a logica.
2. **Repository** (quando necessario): Para queries complexas, extrair para classes Repository.
3. **Policy Pattern**: Autorizacao via policies do Bouncer, nunca em controllers.
4. **DTO/Validator**: Toda entrada de dados validada antes de chegar no service.
5. **Module Pattern (Frontend)**: Frontend organizado por dominio, nao por tipo de arquivo.
6. **Composable Pattern**: Logica reutilizavel extraida em composables.
7. **Store apenas para estado global**: Pinia para auth, notifications, configuracoes. Estado local fica no componente.

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

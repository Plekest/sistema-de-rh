# Backend - Sistema de RH

## Stack Tecnologica

- **Framework**: AdonisJS 6
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL 15+
- **ORM**: Lucid (integrado ao AdonisJS)
- **Autenticacao**: Access Tokens (Opaque Tokens)
- **Validacao**: VineJS
- **Testes**: Japa

## Estrutura do Projeto

```
backend/
├── app/
│   ├── controllers/         # Controllers HTTP (thin controllers)
│   ├── models/              # Models Lucid (User criado)
│   ├── services/            # Logica de negocio (a criar)
│   ├── validators/          # Schemas de validacao VineJS (a criar)
│   ├── policies/            # Politicas de autorizacao (a criar)
│   ├── middleware/          # Middlewares HTTP
│   │   ├── auth_middleware.ts
│   │   ├── container_bindings_middleware.ts
│   │   └── force_json_response_middleware.ts
│   ├── exceptions/          # Exceptions customizadas
│   └── types/               # Tipos TypeScript (a criar)
├── config/                  # Configuracoes do Adonis
│   ├── app.ts
│   ├── auth.ts              # Configuracao de access tokens
│   ├── cors.ts              # CORS configurado para localhost:5173
│   ├── database.ts          # Configuracao PostgreSQL
│   ├── hash.ts
│   ├── logger.ts
│   └── bodyparser.ts
├── database/
│   └── migrations/          # Migrations criadas
│       ├── 1770827715304_create_users_table.ts
│       └── 1770827715306_create_access_tokens_table.ts
├── start/
│   ├── routes.ts            # Definicao de rotas
│   ├── kernel.ts            # Middlewares globais
│   └── env.ts               # Validacao de variaveis de ambiente
├── tests/
│   ├── unit/                # Testes unitarios
│   └── functional/          # Testes de API
├── .env                     # Variaveis de ambiente (local)
├── .env.example             # Template de variaveis
├── adonisrc.ts              # Configuracao do AdonisJS
├── package.json
└── tsconfig.json
```

## Pacotes Instalados

### Dependencias Principais
- `@adonisjs/core` - Framework core
- `@adonisjs/lucid` - ORM para PostgreSQL
- `@adonisjs/auth` - Sistema de autenticacao com access tokens
- `@adonisjs/cors` - Middleware CORS
- `@vinejs/vine` - Validacao de dados
- `pg` - Driver PostgreSQL
- `luxon` - Manipulacao de datas

### Dependencias de Desenvolvimento
- `@adonisjs/assembler` - Build e bundling
- `@japa/runner` - Test runner
- `@japa/api-client` - Cliente HTTP para testes
- `typescript` - Compilador TypeScript
- `eslint` - Linter
- `prettier` - Formatador de codigo

## Configuracoes Realizadas

### 1. CORS
Configurado em `config/cors.ts` para aceitar requisicoes do frontend:
- `http://localhost:5173` (Vue.js dev server)
- `http://localhost:3000` (alternativo)
- Em desenvolvimento, aceita qualquer origem localhost

### 2. Autenticacao
- Guard: `api` usando access tokens (opaque tokens)
- Tokens armazenados no banco de dados (tabela `auth_access_tokens`)
- Provider: `tokensUserProvider` usando o modelo `User`
- Middleware de autenticacao: `auth_middleware.ts`

### 3. Banco de Dados
- Conexao: PostgreSQL
- Migrations criadas:
  - `users` - Tabela de usuarios
  - `auth_access_tokens` - Tabela de tokens de acesso

### 4. Variaveis de Ambiente
Arquivo `.env` configurado com:
```env
NODE_ENV=development
TZ=America/Sao_Paulo
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=<gerado automaticamente>
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=sistema_rh_dev
SESSION_DRIVER=cookie
```

## Modelo User

O modelo `User` foi criado com os seguintes campos:
- `id` - Primary key
- `fullName` - Nome completo (nullable)
- `email` - Email unico
- `password` - Senha hash (serializeAs: null)
- `createdAt` - Data de criacao
- `updatedAt` - Data de atualizacao

O modelo implementa:
- `withAuthFinder` - Autenticacao por email/senha
- `DbAccessTokensProvider` - Geracao e validacao de tokens

## Middlewares Globais

Configurados em `start/kernel.ts`:

### Server Middleware (todas as requisicoes)
1. `container_bindings_middleware` - Bindings do container
2. `force_json_response_middleware` - Forca respostas JSON
3. `@adonisjs/cors/cors_middleware` - CORS

### Router Middleware (rotas registradas)
1. `@adonisjs/core/bodyparser_middleware` - Parse do body
2. `@adonisjs/auth/initialize_auth_middleware` - Inicializa autenticacao

### Named Middleware
- `auth` - Requer autenticacao (usa `auth_middleware.ts`)

## Comandos Disponiveis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor com hot reload

# Build
npm run build            # Build de producao

# Testes
npm run test             # Rodar todos os testes

# Qualidade de Codigo
npm run lint             # Verificar linting
npm run format           # Formatar codigo
npm run typecheck        # Verificar tipos TypeScript

# Banco de Dados (usando ace CLI)
node ace migration:run      # Executar migrations
node ace migration:rollback # Reverter ultima migration
node ace db:seed            # Executar seeders

# Geradores
node ace make:controller Name   # Criar controller
node ace make:model Name        # Criar model
node ace make:migration Name    # Criar migration
node ace make:middleware Name   # Criar middleware
node ace make:validator Name    # Criar validator
```

## Proximos Passos

1. Configurar o banco de dados PostgreSQL local
2. Executar as migrations: `node ace migration:run`
3. Implementar autenticacao (AuthController)
4. Criar estrutura de departamentos e cargos
5. Implementar CRUD de funcionarios
6. Adicionar validacoes com VineJS
7. Implementar policies de autorizacao
8. Criar testes unitarios e funcionais

## Padroes a Seguir

### Controllers
- **Thin controllers**: Apenas recebem request, chamam service, retornam response
- Nomenclatura: `snake_case` (ex: `employees_controller.ts`)

### Services
- Toda logica de negocio fica nos services
- Nomenclatura: `snake_case` (ex: `employee_service.ts`)

### Models
- Apenas definicao de colunas, relacionamentos e hooks simples
- Nomenclatura: PascalCase (ex: `User.ts`, `Employee.ts`)

### Validators
- Toda validacao de input via VineJS schemas
- Nomenclatura: `snake_case` (ex: `employee_validator.ts`)

### Rotas
- RESTful, prefixadas com `/api/v1/`
- Exemplo: `GET /api/v1/employees`, `POST /api/v1/employees`

### Tabelas
- Nomenclatura: `snake_case` plural (ex: `employees`, `departments`)

### Colunas
- Nomenclatura: `snake_case` (ex: `first_name`, `created_at`)

## Arquitetura

Ver documentacao completa em:
- `/docs/ARCHITECTURE.md` - Arquitetura e diagramas
- `/CLAUDE.md` - Visao geral do sistema

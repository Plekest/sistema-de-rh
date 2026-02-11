# Inicializacao do Backend AdonisJS 6

## Resumo

O backend do Sistema de RH foi inicializado com sucesso usando AdonisJS 6, configurado com PostgreSQL e autenticacao via access tokens.

## Comando Executado

```bash
npm init adonisjs@latest backend -- --kit=api --db=postgres --auth-guard=access_tokens
```

## O que foi instalado e configurado

### 1. Estrutura Base do Projeto

O AdonisJS criou a seguinte estrutura:

```
backend/
├── app/
│   ├── exceptions/          # Exception handler
│   ├── middleware/          # Middlewares HTTP (3 criados)
│   └── models/              # User model criado
├── bin/                     # Scripts de inicializacao
├── config/                  # Arquivos de configuracao (7 criados)
├── database/
│   └── migrations/          # 2 migrations criadas
├── start/                   # Rotas e kernel
├── tests/                   # Estrutura de testes
│   ├── unit/
│   └── functional/
└── node_modules/            # Dependencias instaladas
```

### 2. Pacotes Instalados

#### Core
- `@adonisjs/core@6.18.0` - Framework principal
- `@adonisjs/lucid@21.6.1` - ORM para PostgreSQL
- `@adonisjs/auth@9.4.0` - Sistema de autenticacao
- `@adonisjs/cors@2.2.1` - Middleware CORS
- `@vinejs/vine@3.0.1` - Validacao de dados
- `pg@8.18.0` - Driver PostgreSQL
- `luxon@3.7.2` - Manipulacao de datas
- `reflect-metadata@0.2.2` - Metadata reflection (decorators)

#### Desenvolvimento
- `@adonisjs/assembler@7.8.2` - Build e bundling
- `@japa/runner@4.2.0` - Test runner
- `@japa/api-client@3.1.0` - Cliente HTTP para testes
- `@japa/assert@4.0.1` - Assertions para testes
- `@japa/plugin-adonisjs@4.0.0` - Plugin Japa para AdonisJS
- `typescript@5.8` - Compilador TypeScript
- `eslint@9.26.0` - Linter
- `prettier@3.5.3` - Formatador
- `hot-hook@0.4.0` - Hot reload
- `pino-pretty@13.0.0` - Logger bonito

### 3. Configuracoes Realizadas

#### 3.1 CORS (`config/cors.ts`)

Modificado para aceitar requisicoes do frontend Vue.js:

```typescript
origin: (origin) => {
  const allowedOrigins = [
    'http://localhost:5173', // Frontend Vue.js
    'http://localhost:3000', // Frontend alternativo
  ]

  if (process.env.NODE_ENV === 'development') {
    return allowedOrigins.includes(origin || '') || origin?.startsWith('http://localhost')
  }

  return allowedOrigins.includes(origin || '')
}
```

**Justificativa**: Em desenvolvimento, permite requisicoes do frontend local. Metodo PATCH adicionado aos metodos permitidos.

#### 3.2 Autenticacao (`config/auth.ts`)

Configurado com access tokens:

```typescript
guards: {
  api: tokensGuard({
    provider: tokensUserProvider({
      tokens: 'accessTokens',
      model: () => import('#models/user')
    }),
  }),
}
```

**Detalhes**:
- Guard padrao: `api`
- Tipo: Opaque tokens (armazenados no banco)
- Tokens salvos na tabela `auth_access_tokens`
- Relacionamento com `users.id`

#### 3.3 Banco de Dados (`config/database.ts`)

Configurado para PostgreSQL:

```typescript
connections: {
  postgres: {
    client: 'pg',
    connection: {
      host: env.get('DB_HOST'),
      port: env.get('DB_PORT'),
      user: env.get('DB_USER'),
      password: env.get('DB_PASSWORD'),
      database: env.get('DB_DATABASE'),
    },
    migrations: {
      naturalSort: true,
      paths: ['database/migrations'],
    },
  },
}
```

#### 3.4 Variaveis de Ambiente

**Arquivo `.env` criado**:
```env
NODE_ENV=development
TZ=America/Sao_Paulo
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=RfcUqoPHY3EtFgC7OCoBv1RZXI7-A7Ph
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=sistema_rh_dev
SESSION_DRIVER=cookie
```

**Alteracoes do padrao**:
- `TZ`: America/Sao_Paulo (Brasil)
- `HOST`: 0.0.0.0 (aceita conexoes externas)
- `DB_USER`: postgres (padrao PostgreSQL)
- `DB_DATABASE`: sistema_rh_dev (especifico do projeto)

**Arquivo `.env.example` atualizado** com as mesmas variaveis (sem APP_KEY preenchida).

### 4. Models Criados

#### User Model (`app/models/user.ts`)

```typescript
export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
```

**Recursos**:
- Autenticacao por email/senha (withAuthFinder)
- Geracao de access tokens (DbAccessTokensProvider)
- Password nunca serializado em JSON (serializeAs: null)
- Timestamps automaticos

### 5. Migrations Criadas

#### 5.1 Create Users Table (`1770827715304_create_users_table.ts`)

```typescript
this.schema.createTable('users', (table) => {
  table.increments('id').notNullable()
  table.string('full_name').nullable()
  table.string('email', 254).notNullable().unique()
  table.string('password').notNullable()
  table.timestamp('created_at').notNullable()
  table.timestamp('updated_at').nullable()
})
```

#### 5.2 Create Access Tokens Table (`1770827715306_create_access_tokens_table.ts`)

```typescript
this.schema.createTable('auth_access_tokens', (table) => {
  table.increments('id')
  table.integer('tokenable_id')
    .notNullable()
    .unsigned()
    .references('id')
    .inTable('users')
    .onDelete('CASCADE')
  table.string('type').notNullable()
  table.string('name').nullable()
  table.string('hash').notNullable()
  table.text('abilities').notNullable()
  table.timestamp('created_at')
  table.timestamp('updated_at')
  table.timestamp('last_used_at').nullable()
  table.timestamp('expires_at').nullable()
})
```

### 6. Middlewares Criados

#### 6.1 Auth Middleware (`app/middleware/auth_middleware.ts`)
- Autentica requisicoes HTTP
- Nega acesso a usuarios nao autenticados
- Pode especificar guards customizados

#### 6.2 Container Bindings Middleware
- Injeta bindings do container IoC

#### 6.3 Force JSON Response Middleware
- Forca todas as respostas a serem JSON (adequado para API)

### 7. Stack de Middlewares

Configurado em `start/kernel.ts`:

**Middlewares Globais (todas as requisicoes)**:
1. `container_bindings_middleware`
2. `force_json_response_middleware`
3. `@adonisjs/cors/cors_middleware`

**Middlewares de Rota (apenas rotas registradas)**:
1. `@adonisjs/core/bodyparser_middleware`
2. `@adonisjs/auth/initialize_auth_middleware`

**Middlewares Nomeados**:
- `auth` - Protege rotas autenticadas

### 8. Rotas

Arquivo `start/routes.ts` criado com rota de exemplo:

```typescript
router.get('/', async () => {
  return { hello: 'world' }
})
```

### 9. Testes

Configurado com Japa:

**Suites de teste** (em `adonisrc.ts`):
- `unit`: testes unitarios (timeout 2s)
- `functional`: testes de API (timeout 30s)

**Diretórios**:
- `tests/unit/` - Testes de services, validators, etc.
- `tests/functional/` - Testes de controllers e endpoints

### 10. Scripts npm

Configurados em `package.json`:

```json
{
  "start": "node bin/server.js",
  "build": "node ace build",
  "dev": "node ace serve --hmr",
  "test": "node ace test",
  "lint": "eslint .",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit"
}
```

### 11. Import Aliases

Configurados em `package.json` (imports):

```json
{
  "#controllers/*": "./app/controllers/*.js",
  "#models/*": "./app/models/*.js",
  "#services/*": "./app/services/*.js",
  "#validators/*": "./app/validators/*.js",
  "#middleware/*": "./app/middleware/*.js",
  "#policies/*": "./app/policies/*.js",
  "#config/*": "./config/*.js",
  "#database/*": "./database/*.js"
}
```

**Exemplo de uso**:
```typescript
import User from '#models/user'
import EmployeeService from '#services/employee_service'
```

## Verificacao da Instalacao

### Pacotes Essenciais Instalados

- @adonisjs/core ✅
- @adonisjs/lucid ✅ (PostgreSQL)
- @adonisjs/auth ✅ (access tokens)
- @vinejs/vine ✅ (validacao)
- @adonisjs/cors ✅

### Configuracoes Concluidas

- CORS configurado ✅
- .env.example criado ✅
- .env criado com APP_KEY ✅
- Autenticacao configurada ✅
- Banco PostgreSQL configurado ✅

### Estrutura de Pastas

Alinhada com a arquitetura definida em `ARCHITECTURE.md`:

- `/app/controllers` - A criar ✅
- `/app/models` - User criado ✅
- `/app/services` - A criar ✅
- `/app/validators` - A criar ✅
- `/app/policies` - A criar ✅
- `/app/middleware` - 3 criados ✅
- `/app/exceptions` - Handler criado ✅
- `/app/types` - A criar ✅
- `/config` - 7 arquivos criados ✅
- `/database/migrations` - 2 migrations criadas ✅
- `/database/seeders` - A criar conforme necessario ✅
- `/database/factories` - A criar conforme necessario ✅
- `/start` - Rotas e kernel criados ✅
- `/tests/unit` - Estrutura criada ✅
- `/tests/functional` - Estrutura criada ✅

## Diferencas do Padrao AdonisJS

### Modificacoes Feitas

1. **CORS**: Configurado para aceitar localhost:5173 (frontend Vue.js)
2. **Variaveis de ambiente**: Ajustadas para o projeto (TZ, DB_DATABASE, etc.)
3. **HOST**: Alterado para 0.0.0.0 (aceita conexoes externas)

### Mantido do Padrao

- Estrutura de pastas base
- Configuracao de autenticacao (access tokens)
- Middlewares globais
- Configuracao de testes

## Proximos Passos

1. **Criar o banco de dados PostgreSQL**:
   ```bash
   createdb sistema_rh_dev
   ```

2. **Executar as migrations**:
   ```bash
   cd backend
   node ace migration:run
   ```

3. **Testar o servidor**:
   ```bash
   npm run dev
   ```
   Acessar: http://localhost:3333

4. **Implementar autenticacao**:
   - Criar `AuthController`
   - Criar `AuthValidator` (login/register)
   - Criar rotas `/api/v1/auth/*`

5. **Estrutura organizacional**:
   - Criar models: `Department`, `Position`
   - Criar migrations
   - Criar controllers e services

6. **CRUD de funcionarios**:
   - Criar model `Employee`
   - Criar migration
   - Criar service e controller
   - Criar validators

## Observacoes

- **Models, controllers e migrations** nao foram criados ainda conforme solicitado
- **Foco** foi na inicializacao e configuracao base
- Projeto pronto para comecar a implementar as funcionalidades

## Documentacao

- **README.md** criado em `/backend/README.md`
- **Este documento** serve como historico da inicializacao
- **Arquitetura completa** em `/docs/ARCHITECTURE.md`
- **Visao geral** em `/CLAUDE.md`

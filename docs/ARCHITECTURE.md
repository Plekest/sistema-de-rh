# Arquitetura do Sistema de RH

## Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Frontend (Vue.js 3 SPA)                  │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐  │  │
│  │  │  Views   │  │  Store  │  │Composable│  │ Services  │  │  │
│  │  │ (pages) │→ │ (Pinia) │→ │  (logic) │→ │  (HTTP)   │  │  │
│  │  └─────────┘  └─────────┘  └──────────┘  └─────┬─────┘  │  │
│  └─────────────────────────────────────────────────┼─────────┘  │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                          REST API (JSON)
                                          /api/v1/*
                                                     │
┌────────────────────────────────────────────────────┼────────────┐
│                   Backend (AdonisJS 6)             │            │
│  ┌─────────────────────────────────────────────────┼─────────┐  │
│  │                      Router                     │         │  │
│  │  ┌──────────┐  ┌─────────┐  ┌──────────┐       │         │  │
│  │  │Middleware │→ │Validator│→ │Controller│       │         │  │
│  │  │(auth,cors)│  │(VineJS) │  │  (thin)  │       │         │  │
│  │  └──────────┘  └─────────┘  └────┬─────┘       │         │  │
│  │                                   │             │         │  │
│  │  ┌──────────┐  ┌─────────┐  ┌────▼─────┐       │         │  │
│  │  │  Policy  │← │  Event  │← │ Service  │       │         │  │
│  │  │(Bouncer) │  │(opcional)│  │ (logica) │       │         │  │
│  │  └──────────┘  └─────────┘  └────┬─────┘       │         │  │
│  │                                   │             │         │  │
│  │                              ┌────▼─────┐       │         │  │
│  │                              │  Model   │       │         │  │
│  │                              │ (Lucid)  │       │         │  │
│  │                              └────┬─────┘       │         │  │
│  └───────────────────────────────────┼─────────────┘         │  │
└──────────────────────────────────────┼───────────────────────┘  │
                                       │                          │
                                ┌──────▼──────┐                   │
                                │ PostgreSQL  │                   │
                                │  Database   │                   │
                                └─────────────┘                   │
```

## Fluxo de uma Requisicao

```
Request HTTP
  → Middleware Global (CORS, BodyParser, Logger)
    → Middleware de Rota (Auth, Role check)
      → Validator (validacao do input)
        → Controller (orquestra, nao decide)
          → Policy (verifica autorizacao)
            → Service (logica de negocio)
              → Model/Lucid (acesso ao banco)
            ← Service retorna resultado
          ← Controller formata resposta
        ← Response HTTP (JSON)
```

---

## Decisoes Arquiteturais (ADRs)

### ADR-001: Monorepo com workspaces npm

**Contexto**: Precisamos organizar backend e frontend no mesmo repositorio.
**Decisao**: Usar npm workspaces com dois pacotes (`backend/` e `frontend/`).
**Justificativa**: Simplicidade. Nao precisamos de ferramentas como Turborepo ou Nx para um projeto desse porte. O npm workspaces resolve compartilhamento de scripts e dependencias.
**Consequencias**: Ambos os projetos vivem no mesmo repo, facilitando PRs que tocam ambos. CI/CD precisa detectar qual workspace mudou para otimizar builds.

### ADR-002: AdonisJS 6 como framework backend

**Contexto**: Precisamos de um framework Node.js para API REST.
**Decisao**: AdonisJS 6 com TypeScript.
**Justificativa**: Framework completo (ORM, auth, validacao, testes) que evita montar stack manualmente. Lucid ORM tem boa integracao com PostgreSQL. Comunidade ativa e boa documentacao.
**Consequencias**: Acoplamento ao ecossistema Adonis. Devs precisam conhecer as convencoes do framework.

### ADR-003: Vue.js 3 com Composition API

**Contexto**: Precisamos de um framework frontend para SPA.
**Decisao**: Vue.js 3 com Composition API, TypeScript e Vite.
**Justificativa**: Composition API oferece melhor reuso de logica e tipagem TypeScript. Vite proporciona DX excelente com HMR rapido.
**Consequencias**: Composition API tem curva de aprendizado maior que Options API. Decidimos nao usar Options API em nenhum componente para manter consistencia.

### ADR-004: Autenticacao via Access Tokens (Opaque Tokens)

**Contexto**: Precisamos autenticar usuarios na API.
**Decisao**: Usar opaque tokens (access tokens do AdonisJS) armazenados no banco. Frontend armazena token em memoria (variavel JS) com fallback para localStorage.
**Justificativa**: Opaque tokens sao mais simples que JWT para invalidacao (basta deletar do banco). O AdonisJS Auth ja suporta nativamente. Nao precisamos de refresh tokens complexos para um sistema interno.
**Consequencias**: Cada requisicao autenticada faz uma consulta ao banco para validar o token. Para um sistema interno de RH, essa carga e aceitavel.

### ADR-005: Autorizacao baseada em roles e permissions

**Contexto**: Diferentes usuarios tem diferentes niveis de acesso.
**Decisao**: RBAC (Role-Based Access Control) com 3 niveis iniciais: `admin`, `manager`, `employee`. Permissoes granulares associadas a roles. Implementado via Bouncer (AdonisJS).
**Justificativa**: RBAC atende bem um sistema de RH onde os perfis de acesso sao claros e previsíveis. Bouncer integra nativamente com AdonisJS.
**Consequencias**: Se no futuro precisarmos de permissoes muito granulares por usuario, podemos estender o modelo com tabela `permissions` associada a roles.

### ADR-006: Organizacao frontend por modulos de dominio

**Contexto**: Precisamos organizar os componentes e paginas do frontend.
**Decisao**: Organizar por modulos de dominio (`modules/employees/`, `modules/payroll/`, etc.) ao inves de por tipo tecnico (`views/`, `components/`).
**Justificativa**: Facilita navegacao no codigo (tudo relacionado a um dominio esta junto). Facilita onboarding de novos devs. Escala melhor que organizacao por tipo.
**Consequencias**: Componentes verdadeiramente genericos ficam em `components/common/`. Pode haver duplicacao pontual entre modulos, que e aceitavel.

### ADR-007: API versionada com prefixo /api/v1

**Contexto**: Precisamos de estabilidade na API conforme o sistema evolui.
**Decisao**: Prefixar todas as rotas com `/api/v1/`.
**Justificativa**: Permite criar v2 sem quebrar clientes existentes. Pratica padrao em APIs REST.
**Consequencias**: Quando surgir v2, manter v1 funcional ate migracao completa.

---

## Modulos do Sistema

### 1. Auth (Autenticacao e Autorizacao)

**Responsabilidade**: Login, logout, gestao de sessao, controle de acesso.

- Login com email/senha
- Geracao e validacao de access tokens
- Middleware de autenticacao
- Roles: `admin`, `manager`, `employee`
- Policies por recurso

**Endpoints principais**:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### 2. Employees (Gestao de Funcionarios)

**Responsabilidade**: CRUD de funcionarios, perfil, documentos, historico.

- Cadastro completo (dados pessoais, endereco, contato, documentos)
- Upload de documentos (RG, CPF, CTPS, comprovantes)
- Historico de cargos e departamentos
- Status: ativo, inativo, afastado, desligado

**Endpoints principais**:
```
GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/:id
PUT    /api/v1/employees/:id
DELETE /api/v1/employees/:id
GET    /api/v1/employees/:id/documents
POST   /api/v1/employees/:id/documents
```

### 3. Departments (Departamentos e Cargos)

**Responsabilidade**: Estrutura organizacional da empresa.

- CRUD de departamentos
- CRUD de cargos (positions)
- Hierarquia de departamentos (opcional: parent_id)
- Associacao cargo ↔ departamento

**Endpoints principais**:
```
GET    /api/v1/departments
POST   /api/v1/departments
GET    /api/v1/departments/:id
PUT    /api/v1/departments/:id
DELETE /api/v1/departments/:id
GET    /api/v1/positions
POST   /api/v1/positions
GET    /api/v1/positions/:id
PUT    /api/v1/positions/:id
DELETE /api/v1/positions/:id
```

### 4. Payroll (Folha de Pagamento)

**Responsabilidade**: Calculo e gestao da folha de pagamento.

- Definicao de salario base por funcionario
- Lancamentos variaveis (horas extras, descontos, bonus)
- Calculo mensal da folha (bruto, deducoes, liquido)
- Historico de contracheques (pay slips)
- Encargos: INSS, IRRF, FGTS (regras brasileiras)

**Endpoints principais**:
```
GET    /api/v1/payroll/periods
POST   /api/v1/payroll/periods/:period/calculate
GET    /api/v1/payroll/periods/:period/slips
GET    /api/v1/payroll/employees/:id/slips
POST   /api/v1/payroll/entries
```

### 5. Leave (Ferias e Licencas)

**Responsabilidade**: Controle de ferias, licencas e ausencias.

- Solicitacao de ferias pelo funcionario
- Aprovacao pelo gestor
- Calculo de periodo aquisitivo e dias disponiveis
- Tipos de licenca: medica, maternidade, paternidade, luto, etc.
- Calendario de ausencias

**Endpoints principais**:
```
GET    /api/v1/leaves
POST   /api/v1/leaves
GET    /api/v1/leaves/:id
PATCH  /api/v1/leaves/:id/approve
PATCH  /api/v1/leaves/:id/reject
GET    /api/v1/leaves/calendar
GET    /api/v1/employees/:id/leave-balance
```

### 6. Attendance (Controle de Ponto/Frequencia)

**Responsabilidade**: Registro e acompanhamento de ponto.

- Registro de entrada/saida (clock in/clock out)
- Intervalo de almoco
- Calculo de horas trabalhadas
- Relatorio mensal de frequencia
- Deteccao de atrasos e faltas

**Endpoints principais**:
```
POST   /api/v1/attendance/clock-in
POST   /api/v1/attendance/clock-out
GET    /api/v1/attendance/today
GET    /api/v1/attendance/report
GET    /api/v1/employees/:id/attendance
```

### 7. Performance (Avaliacao de Desempenho)

**Responsabilidade**: Ciclos de avaliacao e feedback.

- Criacao de ciclos de avaliacao (semestral/anual)
- Avaliacao por competencias e metas
- Autoavaliacao + avaliacao do gestor
- Historico de avaliacoes
- Plano de desenvolvimento individual (PDI)

**Endpoints principais**:
```
GET    /api/v1/performance/cycles
POST   /api/v1/performance/cycles
GET    /api/v1/performance/cycles/:id/evaluations
POST   /api/v1/performance/evaluations
GET    /api/v1/performance/evaluations/:id
PUT    /api/v1/performance/evaluations/:id
```

### 8. Recruitment (Recrutamento e Selecao)

**Responsabilidade**: Gestao de vagas e processo seletivo.

- Abertura de vagas com descricao e requisitos
- Pipeline de candidatos (etapas configuráveis)
- Registro de candidatos e curriculos
- Agendamento de entrevistas
- Status: aberta, em andamento, preenchida, cancelada

**Endpoints principais**:
```
GET    /api/v1/jobs
POST   /api/v1/jobs
GET    /api/v1/jobs/:id
PUT    /api/v1/jobs/:id
GET    /api/v1/jobs/:id/candidates
POST   /api/v1/jobs/:id/candidates
PATCH  /api/v1/candidates/:id/stage
```

### 9. Training (Treinamento e Desenvolvimento)

**Responsabilidade**: Gestao de treinamentos e capacitacoes.

- Catalogo de treinamentos
- Inscricao de funcionarios
- Controle de presenca e certificacao
- Historico de treinamentos por funcionario

**Endpoints principais**:
```
GET    /api/v1/trainings
POST   /api/v1/trainings
GET    /api/v1/trainings/:id
PUT    /api/v1/trainings/:id
POST   /api/v1/trainings/:id/enrollments
GET    /api/v1/employees/:id/trainings
```

### 10. Benefits (Beneficios)

**Responsabilidade**: Gestao de beneficios dos funcionarios.

- Tipos de beneficio: vale-transporte, vale-refeicao, plano de saude, etc.
- Associacao funcionario ↔ beneficios
- Valores e descontos em folha
- Historico de adesao/cancelamento

**Endpoints principais**:
```
GET    /api/v1/benefits
POST   /api/v1/benefits
GET    /api/v1/benefits/:id
PUT    /api/v1/benefits/:id
GET    /api/v1/employees/:id/benefits
POST   /api/v1/employees/:id/benefits
DELETE /api/v1/employees/:id/benefits/:benefitId
```

### 11. Dashboard (Relatorios e Metricas)

**Responsabilidade**: Visao consolidada e relatorios gerenciais.

- Total de funcionarios por departamento e status
- Resumo de folha de pagamento
- Proximas ferias e aniversarios
- Indicadores de turnover
- Relatorios exportaveis (CSV/PDF)

**Endpoints principais**:
```
GET    /api/v1/dashboard/summary
GET    /api/v1/dashboard/headcount
GET    /api/v1/dashboard/payroll-summary
GET    /api/v1/dashboard/birthdays
GET    /api/v1/dashboard/upcoming-leaves
GET    /api/v1/reports/:type
```

---

## Modelo de Dados Inicial

### Diagrama de Entidades (simplificado)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │  departments │     │  positions   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ email        │     │ name         │     │ title        │
│ password     │     │ description  │     │ description  │
│ role         │     │ parent_id FK │     │ department_id│
│ is_active    │     │ manager_id FK│     │ base_salary  │
│ created_at   │     │ created_at   │     │ created_at   │
│ updated_at   │     │ updated_at   │     │ updated_at   │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       │ 1:1
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  employees   │     │   leaves     │     │ attendances  │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ user_id FK   │     │ employee_id  │     │ employee_id  │
│ first_name   │     │ type         │     │ date         │
│ last_name    │     │ start_date   │     │ clock_in     │
│ cpf          │     │ end_date     │     │ clock_out    │
│ birth_date   │     │ status       │     │ lunch_start  │
│ hire_date    │     │ approved_by  │     │ lunch_end    │
│ phone        │     │ notes        │     │ total_hours  │
│ address_*    │     │ created_at   │     │ status       │
│ position_id  │     │ updated_at   │     │ created_at   │
│ department_id│     └──────────────┘     └──────────────┘
│ manager_id FK│
│ salary       │     ┌──────────────┐     ┌──────────────┐
│ status       │     │  pay_slips   │     │ evaluations  │
│ created_at   │     ├──────────────┤     ├──────────────┤
│ updated_at   │     │ id           │     │ id           │
└──────────────┘     │ employee_id  │     │ cycle_id     │
                     │ period       │     │ employee_id  │
┌──────────────┐     │ gross_salary │     │ evaluator_id │
│  documents   │     │ deductions   │     │ score        │
├──────────────┤     │ net_salary   │     │ comments     │
│ id           │     │ details JSONB│     │ status       │
│ employee_id  │     │ status       │     │ created_at   │
│ type         │     │ created_at   │     │ updated_at   │
│ file_path    │     └──────────────┘     └──────────────┘
│ file_name    │
│ uploaded_at  │     ┌──────────────┐     ┌──────────────┐
└──────────────┘     │    jobs      │     │  trainings   │
                     ├──────────────┤     ├──────────────┤
┌──────────────┐     │ id           │     │ id           │
│  benefits    │     │ title        │     │ title        │
├──────────────┤     │ description  │     │ description  │
│ id           │     │ department_id│     │ instructor   │
│ name         │     │ position_id  │     │ start_date   │
│ type         │     │ salary_range │     │ end_date     │
│ description  │     │ status       │     │ max_capacity │
│ provider     │     │ created_at   │     │ status       │
│ created_at   │     │ updated_at   │     │ created_at   │
│ updated_at   │     └──────────────┘     └──────────────┘
└──────────────┘
                     ┌──────────────┐     ┌──────────────┐
┌──────────────┐     │  candidates  │     │ enrollments  │
│employee_     │     ├──────────────┤     ├──────────────┤
│  benefits    │     │ id           │     │ id           │
├──────────────┤     │ job_id       │     │ training_id  │
│ id           │     │ name         │     │ employee_id  │
│ employee_id  │     │ email        │     │ status       │
│ benefit_id   │     │ phone        │     │ completed_at │
│ enrollment_  │     │ resume_path  │     │ certificate  │
│   date       │     │ stage        │     │ created_at   │
│ value        │     │ notes        │     └──────────────┘
│ discount     │     │ created_at   │
│ status       │     └──────────────┘     ┌──────────────┐
│ created_at   │                          │ performance_ │
└──────────────┘                          │   cycles     │
                                          ├──────────────┤
┌──────────────┐                          │ id           │
│  payroll_    │                          │ name         │
│  entries     │                          │ start_date   │
├──────────────┤                          │ end_date     │
│ id           │                          │ status       │
│ employee_id  │                          │ created_at   │
│ period       │                          └──────────────┘
│ type         │
│ description  │
│ amount       │
│ created_at   │
└──────────────┘
```

### Relacionamentos Principais

| Entidade         | Relacionamento          | Entidade         |
| ---------------- | ----------------------- | ---------------- |
| users            | 1:1                     | employees        |
| departments      | 1:N                     | employees        |
| departments      | 1:N                     | positions        |
| departments      | auto-referencia (N:1)   | departments      |
| positions        | 1:N                     | employees        |
| employees        | 1:N                     | leaves           |
| employees        | 1:N                     | attendances      |
| employees        | 1:N                     | pay_slips        |
| employees        | 1:N                     | documents        |
| employees        | N:N (employee_benefits) | benefits         |
| employees        | 1:N (como avaliado)     | evaluations      |
| employees        | 1:N (como avaliador)    | evaluations      |
| performance_cycles| 1:N                    | evaluations      |
| jobs             | 1:N                     | candidates       |
| trainings        | N:N (enrollments)       | employees        |
| employees        | auto-referencia (N:1)   | employees (manager) |

---

## Fluxo de Autenticacao

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Frontend │                    │ Backend  │                    │ Database │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │  POST /api/v1/auth/login      │                               │
     │  { email, password }          │                               │
     │──────────────────────────────>│                               │
     │                               │  Buscar user por email        │
     │                               │──────────────────────────────>│
     │                               │           user                │
     │                               │<──────────────────────────────│
     │                               │                               │
     │                               │  Verificar senha (hash)       │
     │                               │  Gerar opaque token           │
     │                               │                               │
     │                               │  Salvar token no banco        │
     │                               │──────────────────────────────>│
     │                               │           ok                  │
     │                               │<──────────────────────────────│
     │                               │                               │
     │  200 { token, user }          │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │  Armazena token em memoria    │                               │
     │  (+ localStorage fallback)    │                               │
     │                               │                               │
     │  GET /api/v1/employees        │                               │
     │  Authorization: Bearer <token>│                               │
     │──────────────────────────────>│                               │
     │                               │  Validar token no banco       │
     │                               │──────────────────────────────>│
     │                               │         token valido          │
     │                               │<──────────────────────────────│
     │                               │                               │
     │                               │  Verificar policy (Bouncer)   │
     │                               │  Executar logica              │
     │                               │                               │
     │  200 { data: [...] }          │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │  POST /api/v1/auth/logout     │                               │
     │  Authorization: Bearer <token>│                               │
     │──────────────────────────────>│                               │
     │                               │  Deletar token do banco       │
     │                               │──────────────────────────────>│
     │                               │           ok                  │
     │                               │<──────────────────────────────│
     │  204 No Content               │                               │
     │<──────────────────────────────│                               │
     │                               │                               │
     │  Limpa token da memoria       │                               │
     │  Redireciona para /login      │                               │
```

### Detalhes do fluxo

1. **Login**: Usuario envia email + senha. Backend valida credenciais, gera um opaque token, salva hash no banco e retorna o token + dados do usuario.

2. **Requisicoes autenticadas**: Frontend envia o token no header `Authorization: Bearer <token>`. O middleware `auth` do AdonisJS valida o token no banco e injeta o user no contexto.

3. **Autorizacao**: Apos autenticacao, o Bouncer verifica se o usuario tem permissao para a acao solicitada (via policies). As policies recebem o `user` e o recurso alvo.

4. **Logout**: Backend deleta o token do banco. Frontend limpa o token da memoria e redireciona para a tela de login.

5. **Token expirado/invalido**: Backend retorna 401. Frontend intercepta via Axios interceptor, limpa o estado e redireciona para login.

### Roles e Permissoes

| Acao                        | admin | manager | employee |
| --------------------------- | ----- | ------- | -------- |
| Ver todos os funcionarios   | sim   | sim*    | nao      |
| Editar qualquer funcionario | sim   | nao     | nao      |
| Editar proprio perfil       | sim   | sim     | sim      |
| Aprovar ferias              | sim   | sim*    | nao      |
| Ver folha de pagamento      | sim   | nao     | proprio  |
| Gerar folha de pagamento    | sim   | nao     | nao      |
| Gerenciar departamentos     | sim   | nao     | nao      |
| Gerenciar cargos            | sim   | nao     | nao      |
| Abrir vagas                 | sim   | sim     | nao      |
| Registrar ponto             | sim   | sim     | sim      |
| Ver relatorios gerais       | sim   | sim*    | nao      |
| Gerenciar beneficios        | sim   | nao     | nao      |
| Gerenciar treinamentos      | sim   | sim     | nao      |

*`manager` ve apenas dados do proprio departamento/equipe.

---

## Ordem de Implementacao Sugerida

Implementar nesta ordem para garantir que dependencias estejam prontas:

1. **Auth** - Base para todo o resto
2. **Departments + Positions** - Estrutura organizacional
3. **Employees** - Entidade central do sistema
4. **Attendance** - Controle de ponto (funcionalidade diaria)
5. **Leave** - Ferias e licencas
6. **Payroll** - Folha de pagamento (depende de employees, attendance, leave)
7. **Benefits** - Beneficios dos funcionarios
8. **Performance** - Avaliacao de desempenho
9. **Recruitment** - Recrutamento e selecao
10. **Training** - Treinamento e desenvolvimento
11. **Dashboard** - Consolidacao de dados (depende de tudo)

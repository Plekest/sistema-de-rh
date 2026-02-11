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

## Status de Implementacao

### Modulos Implementados (em producao)

| # | Modulo | Backend | Frontend | Observacoes |
|---|--------|---------|----------|-------------|
| 1 | Auth (Login/Logout/Tokens) | Completo | Completo | Opaque tokens, RBAC 3 roles |
| 2 | Departments + Positions | Completo | Completo | CRUD com hierarquia |
| 3 | Employees (CLT e PJ) | Completo | Completo | Cadastro, busca, filtros, criacao auto de user |
| 4 | Documents | Completo | Completo | Upload, visualizacao, download |
| 5 | Attendance (Ponto) | Completo | Completo | Clock-in/out, almoco, registros recentes |
| 6 | Hours Bank (Banco de Horas) | Completo | Completo | Saldo mensal, acumulado, calculo por colaborador |
| 7 | Employee History (Timeline) | Completo | Completo | Admissao, promocao, transferencia, etc. |
| 8 | Users Management | Completo | Completo | CRUD admin-only |
| 9 | Role Permissions | Completo | Completo | Admin configura acesso por perfil/modulo |

### Modulos Planejados (pastas criadas, sem implementacao)

Leave, Payroll, Benefits, Performance, Recruitment, Training, Dashboard (apenas welcome card)

---

## Ordem de Implementacao Original

Implementar nesta ordem para garantir que dependencias estejam prontas:

1. ~~**Auth**~~ - Concluido
2. ~~**Departments + Positions**~~ - Concluido
3. ~~**Employees**~~ - Concluido
4. ~~**Attendance**~~ - Concluido
5. **Leave** - Ferias e licencas
6. **Payroll** - Folha de pagamento (depende de employees, attendance, leave)
7. **Benefits** - Beneficios dos funcionarios
8. **Performance** - Avaliacao de desempenho
9. **Recruitment** - Recrutamento e selecao
10. **Training** - Treinamento e desenvolvimento
11. **Dashboard** - Consolidacao de dados (depende de tudo)

---

## Roadmap de Modulos Futuros

Proposta de modulos priorizados por valor de negocio para uma empresa brasileira de medio porte. Organizados em fases, cada fase depende da anterior.

### FASE 1 - Obrigacoes trabalhistas e operacao diaria (Prioridade Alta)

Estes modulos sao obrigacoes legais ou necessidades operacionais imediatas. Sem eles, o sistema nao substitui planilhas e processos manuais.

---

#### 1.1 Ferias e Licencas (Leave)

**Descricao**: Controle completo de ferias (CLT), licencas legais e ausencias justificadas. Modulo critico porque envolve obrigacoes trabalhistas brasileiras com prazos legais.

**Funcionalidades**:
- Calculo automatico de periodo aquisitivo (12 meses de trabalho = 30 dias)
- Calculo de dias disponiveis considerando faltas (art. 130 CLT: >5 faltas reduz ferias)
- Solicitacao de ferias pelo colaborador com escolha de datas e fracionamento (ate 3 periodos, sendo 1 de no minimo 14 dias - Reforma Trabalhista)
- Abono pecuniario (venda de 1/3 das ferias)
- Fluxo de aprovacao: colaborador solicita, gestor aprova/rejeita, RH confirma
- Licencas legais com duracao pre-configurada: maternidade (120d), paternidade (5d ou 20d Empresa Cidada), casamento (3d), luto (2d), doacao de sangue (1d/ano), alistamento (2d)
- Atestados medicos com upload do documento
- Calendario visual de ausencias por departamento
- Alertas automaticos: ferias vencendo (periodo concessivo proximo do fim), colaborador sem ferias ha mais de 22 meses
- Integracao com banco de horas (desconto de horas do saldo quando aplicavel)

**Modelos/Tabelas**:
- `leaves` - id, employee_id, type (vacation/medical/maternity/paternity/bereavement/wedding/other), status (pending/approved/rejected/cancelled/in_progress/completed), start_date, end_date, days_count, paid_leave (boolean), notes, approved_by, approved_at, created_at
- `leave_balances` - id, employee_id, accrual_start_date, accrual_end_date, total_days, used_days, sold_days, remaining_days, status (accruing/available/expired), created_at
- `leave_configs` - id, leave_type, default_days, requires_approval (boolean), requires_document (boolean), is_paid (boolean)

**Prioridade**: Alta
**Complexidade**: Medio (regras da CLT precisam estar corretas)
**Dependencias**: Employees, Hours Bank

---

#### 1.2 Beneficios (Benefits)

**Descricao**: Gestao dos beneficios oferecidos pela empresa. No Brasil, VT e obrigatorio para CLT, e VR/VA, plano de saude e odontologico sao os mais comuns e impactam diretamente a retencao de talentos.

**Funcionalidades**:
- Cadastro de planos/tipos de beneficio com fornecedor, valor, regras de elegibilidade
- Tipos pre-configurados: vale-transporte (VT), vale-refeicao (VR), vale-alimentacao (VA), plano de saude, plano odontologico, seguro de vida, auxilio-creche, gympass/wellhub
- VT com calculo automatico: desconto de ate 6% do salario base (CLT art. 458)
- Adesao e cancelamento por colaborador com historico
- Controle de dependentes para plano de saude/odontologico
- Valores diferenciados por cargo/nivel (ex: plano saude enfermaria vs apartamento)
- Relatorio mensal de custos com beneficios por departamento
- Integracao futura com folha de pagamento (descontos automaticos)

**Modelos/Tabelas**:
- `benefits` - id, name, type (vt/vr/va/health/dental/life_insurance/daycare/gym/other), description, provider, is_active, created_at
- `benefit_plans` - id, benefit_id, name, monthly_value, employee_discount_value, employee_discount_percentage, eligibility_rules (JSONB), is_active, created_at
- `employee_benefits` - id, employee_id, benefit_plan_id, enrollment_date, cancellation_date, status (active/cancelled/suspended), notes, created_at
- `benefit_dependents` - id, employee_benefit_id, name, cpf, birth_date, relationship (spouse/child/parent), created_at

**Prioridade**: Alta
**Complexidade**: Medio
**Dependencias**: Employees

---

#### 1.3 Folha de Pagamento Simplificada (Payroll)

**Descricao**: Calculo mensal da remuneracao com encargos brasileiros. Este e o modulo mais complexo do sistema. A sugestao e implementar uma versao simplificada primeiro (calculos basicos de INSS, IRRF, FGTS) e iterar.

**Funcionalidades - Fase 1 (MVP)**:
- Cadastro de componentes salariais por colaborador (salario base, adicionais fixos)
- Lancamentos variaveis mensais: horas extras (50% e 100%), adicional noturno, comissoes, bonus, descontos (faltas, atrasos, adiantamentos)
- Calculo automatico de INSS com tabela progressiva vigente
- Calculo automatico de IRRF com tabela progressiva e deducoes (dependentes, pensao)
- Calculo de FGTS (8% sobre remuneracao bruta)
- Geracao de contracheque (holerite) com detalhamento de proventos e descontos
- Historico de contracheques por colaborador
- Fechamento mensal com status (aberta/calculando/fechada)
- Exportacao de resumo para contabilidade (CSV)
- Desconto automatico de VT (6%) e outros beneficios conforme cadastro

**Funcionalidades - Fase 2 (posterior)**:
- 13o salario (1a e 2a parcela)
- Ferias (1/3 constitucional)
- Rescisao (aviso previo, multa FGTS 40%, ferias proporcionais)
- Integracao com eSocial (eventos periodicos)
- DSR (descanso semanal remunerado)
- Adicional de insalubridade/periculosidade

**Modelos/Tabelas**:
- `payroll_periods` - id, reference_month, reference_year, status (open/calculating/closed), closed_by, closed_at, created_at
- `payroll_components` - id, employee_id, type (base_salary/fixed_bonus/hazard_pay/other), description, amount, is_active, effective_from, effective_until, created_at
- `payroll_entries` - id, payroll_period_id, employee_id, component_type (earning/deduction), code (base_salary/overtime_50/overtime_100/night_shift/bonus/commission/inss/irrf/vt_discount/benefit_discount/absence/advance/other), description, reference_value, quantity, amount, created_at
- `pay_slips` - id, payroll_period_id, employee_id, gross_salary, total_earnings, total_deductions, net_salary, inss_amount, irrf_amount, fgts_amount, details (JSONB com breakdown completo), status (draft/final), created_at
- `tax_tables` - id, type (inss/irrf), bracket_min, bracket_max, rate, deduction_value, effective_from, effective_until

**Prioridade**: Alta
**Complexidade**: Complexo (regras tributarias brasileiras, tabelas que mudam anualmente)
**Dependencias**: Employees, Attendance, Hours Bank, Benefits, Leave

---

### FASE 2 - Gestao de pessoas e desenvolvimento (Prioridade Media)

Modulos que agregam valor estrategico: ajudam a reter talentos, desenvolver equipes e contratar melhor. Nao sao obrigacoes legais, mas diferenciam um sistema de RH de uma planilha.

---

#### 2.1 Dashboard e Relatorios (Dashboard)

**Descricao**: Painel gerencial com indicadores de RH e relatorios operacionais. Atualmente existe apenas um card de boas-vindas. Este modulo consolida dados de todos os outros modulos em visualizacoes uteis para a tomada de decisao.

**Funcionalidades**:
- Cards de resumo: total de colaboradores (ativos/inativos), admissoes e demissoes do mes, aniversariantes do mes, ferias em andamento
- Headcount por departamento (grafico de barras)
- Distribuicao CLT vs PJ (grafico de pizza)
- Evolucao de headcount nos ultimos 12 meses (grafico de linha)
- Taxa de turnover mensal e acumulada
- Custo total de folha por departamento
- Colaboradores com ferias vencendo nos proximos 30/60/90 dias
- Lista de aniversariantes da semana/mes
- Relatorio de frequencia (atrasos, faltas, horas extras) por periodo
- Exportacao de relatorios em CSV e PDF
- Filtros por departamento, periodo e tipo de colaborador
- Visao diferenciada por role: admin ve tudo, manager ve apenas seu departamento

**Modelos/Tabelas**: Nenhuma tabela nova. Consome dados de employees, attendance, hours_bank, leaves, pay_slips via queries agregadas.

**Prioridade**: Media-Alta (agrega muito valor com pouca complexidade de banco)
**Complexidade**: Medio (queries complexas, graficos no frontend)
**Dependencias**: Todos os modulos da Fase 1

---

#### 2.2 Avaliacao de Desempenho (Performance)

**Descricao**: Ciclos de avaliacao periodica com autoavaliacao, avaliacao do gestor e PDI (Plano de Desenvolvimento Individual). Essencial para empresas que querem formalizar feedbacks e embasar decisoes de promocao e merito.

**Funcionalidades**:
- Criacao de ciclos de avaliacao (semestral ou anual) com datas de inicio/fim
- Cadastro de competencias por cargo/departamento (ex: lideranca, comunicacao, dominio tecnico)
- Cadastro de metas individuais com peso e criterio de atingimento
- Autoavaliacao pelo colaborador (nota 1-5 por competencia + comentarios)
- Avaliacao pelo gestor direto (nota 1-5 por competencia + comentarios)
- Nota final ponderada (competencias + metas)
- Calibracao: RH/admin pode ajustar notas antes do fechamento
- PDI (Plano de Desenvolvimento Individual): acoes de desenvolvimento com prazo e responsavel
- Historico de avaliacoes por colaborador
- Relatorio consolidado: distribuicao de notas por departamento, ranking

**Modelos/Tabelas**:
- `performance_cycles` - id, name, type (semestral/anual), start_date, end_date, self_eval_deadline, manager_eval_deadline, status (draft/self_eval/manager_eval/calibration/closed), created_at
- `competencies` - id, name, description, category (technical/behavioral/leadership), is_active, created_at
- `cycle_competencies` - id, cycle_id, competency_id, weight
- `individual_goals` - id, cycle_id, employee_id, title, description, weight, target_value, achieved_value, status (pending/in_progress/achieved/not_achieved), created_at
- `evaluations` - id, cycle_id, employee_id, evaluator_id, type (self/manager), status (pending/in_progress/completed), overall_score, comments, completed_at, created_at
- `evaluation_scores` - id, evaluation_id, competency_id, score (1-5), comments
- `development_plans` - id, employee_id, cycle_id, action, description, responsible_id, deadline, status (pending/in_progress/completed/cancelled), created_at

**Prioridade**: Media
**Complexidade**: Complexo (multiplos fluxos, calibracao, metas)
**Dependencias**: Employees, Departments

---

#### 2.3 Recrutamento e Selecao (Recruitment)

**Descricao**: Gestao de vagas abertas, candidatos e pipeline de selecao. Permite que gestores solicitem vagas, RH publique e acompanhe candidatos pelas etapas do processo.

**Funcionalidades**:
- Abertura de requisicao de vaga pelo gestor com justificativa
- Aprovacao da vaga pelo RH/admin
- Cadastro da vaga: titulo, departamento, cargo, faixa salarial, requisitos, tipo (CLT/PJ), regime (presencial/hibrido/remoto)
- Pipeline configuravel por etapas: triagem, entrevista RH, teste tecnico, entrevista gestor, proposta, contratado, reprovado
- Cadastro de candidatos: nome, email, telefone, curriculo (upload PDF), LinkedIn, pretensao salarial
- Movimentacao de candidatos entre etapas com registro de feedback/notas
- Agendamento de entrevistas com data, horario e entrevistador
- Conversao de candidato aprovado em colaborador (pre-preenchimento do cadastro de employee)
- Dashboard de vagas: abertas, em andamento, fechadas, tempo medio de preenchimento
- Kanban visual do pipeline por vaga

**Modelos/Tabelas**:
- `job_requisitions` - id, title, department_id, position_id, requested_by, approved_by, salary_range_min, salary_range_max, employment_type (clt/pj), work_model (onsite/hybrid/remote), headcount, description, requirements, status (pending_approval/approved/open/filled/cancelled), approved_at, closed_at, created_at
- `recruitment_stages` - id, name, display_order, is_default, is_active (para permitir customizacao do pipeline)
- `candidates` - id, job_requisition_id, name, email, phone, linkedin_url, salary_expectation, resume_path, source (referral/linkedin/website/other), current_stage_id, status (active/hired/rejected/withdrawn), notes, created_at
- `candidate_stage_history` - id, candidate_id, stage_id, moved_by, feedback, score (1-5), entered_at, left_at
- `interviews` - id, candidate_id, interviewer_id, stage_id, scheduled_at, duration_minutes, location, meeting_link, status (scheduled/completed/cancelled), feedback, score, created_at

**Prioridade**: Media
**Complexidade**: Medio
**Dependencias**: Employees, Departments, Positions

---

### FASE 3 - Diferencial competitivo (Prioridade Baixa-Media)

Modulos que tornam o sistema mais completo e profissional, mas que podem esperar ate que o core esteja solido.

---

#### 3.1 Treinamento e Desenvolvimento (Training)

**Descricao**: Catalogo de treinamentos, inscricao de colaboradores, controle de participacao e certificacao. Atende obrigacoes de treinamentos obrigatorios (NRs, CIPA) e desenvolvimento voluntario.

**Funcionalidades**:
- Cadastro de treinamentos: titulo, descricao, instrutor (interno ou externo), carga horaria, modalidade (presencial/online/hibrido), custo
- Tipos: obrigatorio (NR, CIPA, integracao), tecnico, comportamental, lideranca
- Turmas com datas, horarios, local e vagas
- Inscricao pelo colaborador (com aprovacao do gestor se necessario) ou inscricao em massa pelo RH
- Lista de presenca por sessao
- Emissao de certificado ao concluir (PDF gerado)
- Controle de vencimento de treinamentos obrigatorios com alertas
- Historico de treinamentos por colaborador (portfolio de capacitacao)
- Relatorio de horas de treinamento por departamento
- Controle de budget de treinamento por departamento/ano

**Modelos/Tabelas**:
- `trainings` - id, title, description, type (mandatory/technical/behavioral/leadership/onboarding), modality (onsite/online/hybrid), instructor_name, instructor_type (internal/external), total_hours, cost, validity_months (para treinamentos com vencimento), is_active, created_at
- `training_sessions` - id, training_id, start_date, end_date, location, meeting_link, max_capacity, status (scheduled/in_progress/completed/cancelled), created_at
- `training_enrollments` - id, training_session_id, employee_id, enrolled_by, status (enrolled/confirmed/attended/absent/cancelled), attendance_percentage, score, certificate_path, completed_at, created_at
- `training_budgets` - id, department_id, year, total_budget, used_budget, created_at

**Prioridade**: Media-Baixa
**Complexidade**: Medio
**Dependencias**: Employees, Departments

---

#### 3.2 Comunicados e Notificacoes Internas (Announcements)

**Descricao**: Canal de comunicacao interna para avisos do RH, lembretes e notificacoes do sistema. Substitui emails dispersos e garante que informacoes importantes cheguem a todos.

**Funcionalidades**:
- Publicacao de comunicados pelo RH/admin com titulo, corpo (rich text), prioridade (normal/importante/urgente)
- Segmentacao: para todos, por departamento, por cargo, por tipo de contrato
- Comunicados fixados (pinned) aparecem no topo
- Controle de leitura (quem visualizou)
- Notificacoes in-app do sistema: ferias aprovada/rejeitada, novo documento disponivel, avaliacao de desempenho aberta, treinamento agendado
- Badges de notificacoes nao lidas no menu
- Central de notificacoes com historico

**Modelos/Tabelas**:
- `announcements` - id, title, body, priority (normal/important/urgent), target_audience (JSONB: all, department_ids, position_ids, employment_types), is_pinned, published_by, published_at, expires_at, status (draft/published/archived), created_at
- `announcement_reads` - id, announcement_id, user_id, read_at
- `notifications` - id, user_id, type (leave_approved/leave_rejected/document_uploaded/evaluation_open/training_scheduled/payslip_available/announcement/other), title, message, reference_type, reference_id, is_read, read_at, created_at

**Prioridade**: Media-Baixa
**Complexidade**: Simples
**Dependencias**: Users (para destinatarios)

---

#### 3.3 Onboarding/Offboarding Checklists

**Descricao**: Checklists configuráveis para admissao e desligamento de colaboradores. Garante que nenhuma etapa seja esquecida nos processos que envolvem multiplas areas (RH, TI, financeiro, gestor).

**Funcionalidades**:
- Templates de checklist para onboarding e offboarding, editaveis pelo admin
- Itens com responsavel (RH, TI, gestor, colaborador), prazo (D+N dias da admissao/demissao) e instrucoes
- Onboarding tipico: criar email corporativo, configurar estacao de trabalho, entregar cracha, cadastrar biometria, assinar contrato, entregar EPIs, integracao com equipe, treinamento inicial
- Offboarding tipico: devolver equipamentos, revogar acessos, entrevista de desligamento, exame demissional, homologacao, calculo de rescisao
- Acompanhamento em tempo real: quais itens estao pendentes, quem e o responsavel
- Notificacao automatica para os responsaveis quando um novo colaborador e admitido ou desligado
- Relatorio de tempo medio de onboarding por departamento

**Modelos/Tabelas**:
- `checklist_templates` - id, name, type (onboarding/offboarding), is_active, created_at
- `checklist_template_items` - id, template_id, title, description, responsible_role (hr/it/manager/employee/finance), deadline_days (D+N), display_order, is_required, created_at
- `employee_checklists` - id, employee_id, template_id, type (onboarding/offboarding), status (in_progress/completed), started_at, completed_at, created_at
- `employee_checklist_items` - id, employee_checklist_id, template_item_id, title, responsible_user_id, deadline_date, status (pending/in_progress/completed/skipped), completed_by, completed_at, notes, created_at

**Prioridade**: Media-Baixa
**Complexidade**: Medio
**Dependencias**: Employees, Users

---

### FASE 4 - Modulos avancados (Prioridade Baixa)

Para quando o sistema ja estiver maduro e atendendo bem as necessidades basicas.

---

#### 4.1 Organograma Interativo

**Descricao**: Visualizacao grafica da estrutura hierarquica da empresa baseada nos dados ja existentes (departamentos, cargos, gestores).

**Funcionalidades**:
- Arvore hierarquica interativa (expandir/colapsar nos)
- Cada no mostra: foto, nome, cargo, departamento
- Navegacao clicavel (abre perfil do colaborador)
- Filtro por departamento
- Exportacao como imagem (PNG/SVG)

**Modelos/Tabelas**: Nenhuma nova. Usa employees.manager_id, departments.parent_id e dados existentes.

**Prioridade**: Baixa
**Complexidade**: Simples (backend zero, apenas frontend com biblioteca de grafos)
**Dependencias**: Employees, Departments

---

#### 4.2 Pesquisa de Clima e Engajamento

**Descricao**: Pesquisas anonimas periodicas para medir satisfacao e engajamento dos colaboradores. Ferramenta estrategica para reter talentos e identificar problemas antes que gerem turnover.

**Funcionalidades**:
- Criacao de pesquisas com perguntas configuráveis (escala 1-5, multipla escolha, texto livre)
- Templates pre-definidos: eNPS, satisfacao geral, clima organizacional
- Envio segmentado (todos, por departamento)
- Respostas anonimas (sem vinculo com usuario apos submissao)
- Dashboard de resultados: media por pergunta, eNPS score, nuvem de palavras das respostas livres
- Comparativo entre periodos (evolucao trimestral/semestral)

**Modelos/Tabelas**:
- `surveys` - id, title, description, type (enps/climate/satisfaction/custom), target_audience (JSONB), start_date, end_date, is_anonymous, status (draft/active/closed), created_by, created_at
- `survey_questions` - id, survey_id, text, type (scale_1_5/multiple_choice/text), options (JSONB), display_order, is_required, created_at
- `survey_responses` - id, survey_id, respondent_hash (hash anonimo), department_id (para segmentacao sem identificar), submitted_at, created_at
- `survey_answers` - id, response_id, question_id, answer_value, answer_text, created_at

**Prioridade**: Baixa
**Complexidade**: Medio
**Dependencias**: Employees, Departments

---

#### 4.3 Gestao de Atestados e Saude Ocupacional (ASO)

**Descricao**: Controle de exames ocupacionais obrigatorios (admissional, periodico, demissional, retorno ao trabalho, mudanca de funcao) e atestados medicos. Obrigatorio pela NR-7 (PCMSO).

**Funcionalidades**:
- Cadastro de tipos de exame (admissional, periodico, demissional, retorno, mudanca de funcao)
- Agenda de exames por colaborador com periodicidade configuravel
- Upload e armazenamento do ASO (PDF)
- Alertas de vencimento: exame periodico proximo de vencer
- Registro de atestados medicos com CID (opcional), dias de afastamento, medico responsavel
- Dashboard de saude: quantidade de atestados por periodo, departamentos com mais afastamentos
- Integracao com modulo de Leave (atestado gera licenca medica automaticamente)

**Modelos/Tabelas**:
- `occupational_exams` - id, employee_id, type (admission/periodic/dismissal/return/role_change), exam_date, expiry_date, result (fit/unfit/fit_with_restrictions), restrictions, doctor_name, crm, clinic_name, aso_document_path, status (scheduled/completed/expired), created_at
- `medical_certificates` - id, employee_id, start_date, end_date, days_count, cid_code, cid_description, doctor_name, crm, document_path, leave_id (FK para leave gerada), created_at

**Prioridade**: Baixa
**Complexidade**: Simples-Medio
**Dependencias**: Employees, Documents, Leave

---

### Resumo Visual do Roadmap

```
FASE 1 (Alta prioridade)          FASE 2 (Media prioridade)
[Ferias/Licencas] ──────────────> [Dashboard/Relatorios]
[Beneficios] ───────────────────> [Avaliacao Desempenho]
[Folha de Pagamento MVP] ──────> [Recrutamento]

FASE 3 (Media-Baixa)              FASE 4 (Baixa)
[Treinamentos]                    [Organograma]
[Comunicados/Notificacoes]        [Pesquisa de Clima]
[Onboarding/Offboarding]          [Saude Ocupacional/ASO]
```

### Estimativa de Esforco por Modulo

| Modulo | Backend (dias) | Frontend (dias) | Total estimado |
|--------|---------------|-----------------|----------------|
| Ferias/Licencas | 5-7 | 5-7 | 10-14 dias |
| Beneficios | 4-5 | 4-5 | 8-10 dias |
| Folha de Pagamento MVP | 8-12 | 6-8 | 14-20 dias |
| Dashboard/Relatorios | 4-6 | 6-8 | 10-14 dias |
| Avaliacao Desempenho | 7-10 | 7-10 | 14-20 dias |
| Recrutamento | 5-7 | 6-8 | 11-15 dias |
| Treinamentos | 4-6 | 4-6 | 8-12 dias |
| Comunicados | 2-3 | 3-4 | 5-7 dias |
| Onboarding/Offboarding | 3-5 | 4-5 | 7-10 dias |
| Organograma | 0 | 3-4 | 3-4 dias |
| Pesquisa de Clima | 4-5 | 5-6 | 9-11 dias |
| Saude Ocupacional | 3-4 | 3-4 | 6-8 dias |

**Total estimado para todas as fases**: ~105-145 dias de desenvolvimento

### Recomendacao de Ordem de Implementacao

A ordem sugerida dentro de cada fase considera dependencias tecnicas e valor entregue:

1. **Ferias/Licencas** - obrigacao legal, alta frequencia de uso
2. **Beneficios** - obrigacao legal (VT), impacto direto no colaborador
3. **Folha de Pagamento MVP** - depende de ferias e beneficios para descontos corretos
4. **Dashboard/Relatorios** - consolida os 3 modulos anteriores, alto impacto visual
5. **Recrutamento** - alimenta o cadastro de colaboradores, fluxo independente
6. **Avaliacao de Desempenho** - ciclo semestral/anual, pode esperar
7. **Comunicados/Notificacoes** - melhora UX de todos os modulos
8. **Treinamentos** - complementa avaliacao de desempenho
9. **Onboarding/Offboarding** - complementa recrutamento e demissao
10. **Organograma** - esforco minimo, entrega visual bonita
11. **Pesquisa de Clima** - modulo independente, baixa urgencia
12. **Saude Ocupacional** - complementa ferias/licencas

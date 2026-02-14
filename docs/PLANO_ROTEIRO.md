# Plano de Roteiro - Sistema de RH

**Elaborado por:** Arquiteto de Software / Tech Lead
**Data:** 2026-02-14
**Versao:** 1.0

---

## PARTE 1: DIAGNOSTICO COMPLETO DO ESTADO ATUAL

### 1.1 Resumo Executivo

O sistema possui 38 migrations, 36 models, 18 services, 17 controllers, 16 validators e um frontend completo com 17 modulos. Em termos de funcionalidades, o projeto avancou significativamente alem do que o CLAUDE.md descreve como "implementado" - modulos como Leave, Benefits, Payroll, Performance e Recruitment ja possuem backend e frontend funcionais, nao sao mais apenas placeholders.

Contudo, existem 5 bugs criticos identificados pela equipe de QA (relatorio em `/docs/QA_SUMMARY.md`), e o modulo de Training permanece como unico placeholder real. Ha tambem problemas de arquitetura que precisam ser resolvidos antes de avancar.

### 1.2 Estado Real de Cada Modulo

| # | Modulo | Backend | Frontend | Nivel Real |
|---|--------|---------|----------|------------|
| 1 | Auth (Login/Logout/Forgot/Reset) | Completo | Completo | Producao com ressalvas |
| 2 | Departments + Positions | Completo | Completo | Producao |
| 3 | Employees (CLT e PJ) | Completo | Completo | Producao com ressalvas |
| 4 | Documents | Completo | Completo | Producao |
| 5 | Attendance (Ponto) | Completo | Completo | Producao |
| 6 | Hours Bank (Banco de Horas) | Completo | Completo | Producao |
| 7 | Employee History (Timeline) | Completo | Completo | Producao |
| 8 | Users Management | Completo | Completo | Producao |
| 9 | Role Permissions | Completo | Completo | Producao |
| 10 | **Leave (Ferias/Licencas)** | **Completo** | **Completo** | **Producao com ressalvas** |
| 11 | **Benefits** | **Completo** | **Completo** | **Producao com ressalvas** |
| 12 | **Payroll** | **Completo** | **Completo** | **Bugs criticos - nao usar** |
| 13 | **Performance** | **Completo** | **Completo** | **Beta** |
| 14 | **Recruitment** | **Completo** | **Completo** | **Beta** |
| 15 | **Dashboard** | **Completo** | **Completo** | **Producao (admin e employee)** |
| 16 | Training | Nada | Nada | Placeholder (.gitkeep) |

**Descoberta importante:** O CLAUDE.md esta desatualizado. Os modulos Leave, Benefits, Payroll, Performance, Recruitment e Dashboard ja foram implementados integralmente, com controllers, services, models, migrations, seeders, validators, frontend services, types e views.

### 1.3 Analise de Qualidade do Codigo

#### Pontos Fortes

1. **Arquitetura consistente** - Todos os modulos seguem o padrao Service Layer (Controller -> Service -> Model). Controllers sao thin, servicos contem a logica.
2. **TypeScript em todo o projeto** - Tipagem forte tanto no backend (AdonisJS) quanto no frontend (Vue 3 + Composition API).
3. **Validacoes com VineJS** - Toda entrada de dados e validada nos validators antes de chegar no service.
4. **Historico automatico** - `EmployeeHistoryService` registra mudancas de salario, departamento, status, beneficios, ferias, etc. automaticamente.
5. **Dashboard funcional** - Duas views: `AdminHomeView` (KPIs gerais) e `EmployeeHomeView` (dados pessoais do colaborador).
6. **Soft delete** - Employees nao sao deletados, mudam para status `terminated`.
7. **RBAC funcional** - 3 roles (admin/manager/employee) com middleware no backend e verificacao no frontend router guard + menu sidebar.
8. **Regras CLT implementadas** - Ferias com fracionamento (3 periodos, minimo 14 dias no primeiro), abono pecuniario (1/3), licencas legais com duracoes corretas, calculo progressivo de INSS/IRRF.

#### Problemas Criticos (da analise QA)

1. **BUG-001 e BUG-002** - Calculo INSS progressivo incorreto em `payroll_service.ts`. Risco financeiro ALTO.
2. **BUG-003** - Senha gerada por `password_generator.ts` (ja corrigido parcialmente - usa funcao dedicada agora, mas o QA reportou como hardcoded).
3. **BUG-004** - PostgreSQL retorna `numeric/decimal` como string. Conversoes `Number()` inconsistentes em calculos financeiros.
4. **BUG-005** - Race condition no calculo de folha. Dois usuarios podem processar simultaneamente. Ja tem `forUpdate()` no codigo, mas o QA reportou como incompleto.

#### Problemas Arquiteturais

1. **Views monoliticas no frontend** - Arquivos como `PerformanceView.vue` (2284 linhas), `RecruitmentView.vue` (2119 linhas), `BenefitsListView.vue` (1481 linhas), `PayrollView.vue` (1456 linhas) sao monolitos que misturam logica, template e estilos. Precisam ser decompostos em componentes menores.
2. **Nenhum composable nos modulos novos** - Modulos Leave, Benefits, Payroll, Performance, Recruitment colocam toda a logica nas views. As pastas `composables/` destes modulos contem apenas `.gitkeep`.
3. **Nenhum componente reutilizavel nos modulos novos** - As pastas `components/` dos modulos novos tambem contem apenas `.gitkeep`. Toda a UI esta nos arquivos de view.
4. **Pastas `components/common/` vazia** - So tem `.gitkeep` e um README. Nao ha componentes genericos (DataTable, FormField, Modal, Badge, etc.).
5. **Falta de interceptor de erro no frontend** - O interceptor do Axios em `services/api.ts` nao trata erros 401 (nao faz logout/redirect). Depende do router guard e auth store, mas falha silenciosamente.
6. **Services instanciados no construtor dos controllers** - `new EmployeeService()` em cada controller. Melhor seria usar Dependency Injection do AdonisJS 6.
7. **Sem Bouncer policies** - Apesar da arquitetura mencionar Bouncer para autorizacao, nao existe nenhum arquivo de policy. A autorizacao e feita apenas pelo middleware de role nas rotas.
8. **Sem auditoria de alteracoes** - Nao ha log de quem alterou o que e quando (audit trail), exceto pelo `EmployeeHistory`.
9. **Sem tratamento de erros padronizado** - Cada controller trata erros de forma diferente com try/catch manual.
10. **CLAUDE.md desatualizado** - Diz que modulos Leave, Benefits, etc. sao "placeholder", mas estao todos implementados.

#### Problemas de Infraestrutura

1. **Sem CI/CD** - Nenhum workflow do GitHub Actions, GitLab CI ou similar.
2. **Sem Swagger/OpenAPI** - API sem documentacao automatica.
3. **Redis configurado mas nao utilizado** - Docker Compose tem Redis, mas nenhum uso no codigo (nem cache, nem filas, nem sessoes).
4. **Sem healthcheck endpoint** - Backend nao tem rota de status.
5. **Sem rate limiting** - Nenhuma protecao contra brute force no login.
6. **APP_KEY exposta no .env commitado** - O arquivo `.env` real esta no repositorio (nao apenas o `.env.example`).

### 1.4 Gaps nos Modulos Implementados

| Modulo | Funcionalidade Faltando |
|--------|------------------------|
| **Auth** | Rate limiting no login; troca de senha pelo usuario; sessoes ativas (listar/revogar) |
| **Employees** | Validacao de CPF/CNPJ duplicado; foto do colaborador; busca por CNPJ em API publica |
| **Attendance** | Calculo automatico do banco de horas ao fazer clock-out; deteccao de atrasos; relatorio mensal |
| **Hours Bank** | Calculo automatico (hoje e manual trigger); compensacao de horas; alertas de saldo negativo |
| **Documents** | Tipos pre-definidos (RG, CPF, CTPS, etc.); vencimento de documentos; notificacao de expirado |
| **Leave** | Transicao automatica de status (approved -> in_progress -> completed baseado nas datas); notificacao ao gestor; calendario visual no frontend |
| **Benefits** | Calculo automatico de VT (6% do salario); relatorio de custos; descontos integrados com folha |
| **Payroll** | Correcao dos bugs de INSS; 13o salario; ferias (1/3); rescisao; tabelas fiscais atualizaveis pela UI |
| **Performance** | Notificacoes de deadline; relatorio consolidado; grafico de distribuicao de notas |
| **Recruitment** | Upload de curriculo (PDF); Kanban visual; conversao candidato -> employee |
| **Dashboard** | Graficos (atualmente so tem numeros/tabelas); taxa de turnover; aniversariantes |

### 1.5 Automacoes que Precisam ser Implementadas

1. **Banco de horas automatico** - Ao registrar clock-out, calcula e atualiza o saldo do mes automaticamente.
2. **Transicao automatica de ferias** - Job/cron que verifica diariamente: `approved` com `start_date` = hoje vira `in_progress`; `in_progress` com `end_date` < hoje vira `completed`.
3. **Calculo automatico de periodo aquisitivo** - Ao completar 12 meses de admissao, gera automaticamente o saldo de ferias.
4. **Alerta de ferias vencendo** - Notificacao quando o periodo concessivo esta prestes a expirar (dobra de ferias).
5. **Desconto automatico de beneficios na folha** - Ao calcular folha, desconta automaticamente os beneficios ativos do colaborador.
6. **Calculo automatico de VT** - 6% do salario base quando o colaborador tem VT ativo.
7. **Workflow de aprovacao** - Notificacoes automaticas ao gestor quando colaborador solicita ferias, e ao colaborador quando gestor aprova/rejeita.
8. **Geracao automatica de contracheque** - Ao fechar periodo da folha, gerar PDF do holerite automaticamente.
9. **Auto-recalculo de folha** - Ao incluir lancamento variavel (hora extra, falta, bonus), recalcular o contracheque daquele colaborador.
10. **Onboarding automatico** - Ao criar colaborador, gerar automaticamente checklist de onboarding com tarefas para RH, TI e gestor.

---

## PARTE 2: PLANO DE IMPLEMENTACAO

### Principio Orientador

**Corrigir e solidificar o que existe antes de construir coisas novas.** O sistema tem uma base funcional ampla, mas com divida tecnica significativa. A prioridade e transformar o que existe em algo confiavel e automatico.

---

### SPRINT 0 - CORRECOES CRITICAS E DIVIDA TECNICA (1 semana)

**Objetivo:** Tornar o sistema confiavel para uso em desenvolvimento/testes. Sem novas features.

#### Dev Backend

| # | Tarefa | Prioridade | Estimativa |
|---|--------|-----------|------------|
| B0.1 | Corrigir calculo INSS progressivo (BUG-001 e BUG-002) | Critica | 4h |
| B0.2 | Implementar helper `toDecimal()` para conversoes PostgreSQL numeric -> number (BUG-004) | Critica | 2h |
| B0.3 | Revisar race condition no calculo de folha - validar lock pessimista (BUG-005) | Critica | 2h |
| B0.4 | Remover `.env` do repositorio, adicionar ao `.gitignore` | Critica | 30min |
| B0.5 | Adicionar rate limiting no endpoint de login (middleware) | Alta | 2h |
| B0.6 | Criar endpoint `/api/v1/health` para healthcheck | Media | 30min |
| B0.7 | Implementar tratamento de erros padronizado (exception handler global) | Alta | 4h |
| B0.8 | Validar CPF/CNPJ unico no `employee_validator.ts` | Alta | 1h |
| B0.9 | Executar e corrigir os 130+ testes unitarios criados pelo QA | Alta | 4h |

#### Dev Frontend

| # | Tarefa | Prioridade | Estimativa |
|---|--------|-----------|------------|
| F0.1 | Adicionar tratamento de erro 401 no interceptor Axios (logout automatico) | Critica | 1h |
| F0.2 | Criar componentes `common/` reutilizaveis: DataTable, FormField, Modal, Badge, EmptyState, LoadingSpinner | Alta | 8h |
| F0.3 | Corrigir o handler de erros nas views para exibir mensagens amigaveis | Media | 4h |

#### QA

| # | Tarefa | Prioridade | Estimativa |
|---|--------|-----------|------------|
| Q0.1 | Executar todos os testes unitarios e documentar resultado | Critica | 2h |
| Q0.2 | Validar correcoes de INSS com tabela 2024/2025 | Critica | 2h |
| Q0.3 | Testar fluxo completo: criar employee -> registrar ponto -> calcular banco horas -> calcular folha | Alta | 4h |

---

### SPRINT 1 - AUTOMACOES DO CORE (2 semanas)

**Objetivo:** Automatizar os processos manuais dos modulos ja existentes. O sistema deve funcionar com minima intervencao humana.

#### 1A - Automacao de Banco de Horas (Attendance + Hours Bank)

**Dev Backend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B1.1 | Auto-calculo do banco de horas no clock-out | Ao registrar `clockOut`, chamar `HoursBankService.calculateMonth()` para o mes/ano corrente do employee. Isso faz o saldo ser atualizado em tempo real, sem precisar de trigger manual. |
| B1.2 | Deteccao de atrasos | Comparar `clockIn` com horario padrao (8:00 ou configuravel). Se > 10min de atraso, marcar no `time_entry`. Criar coluna `is_late` (boolean) e `late_minutes` (integer) na tabela `time_entries` via migration. |
| B1.3 | Feriados nacionais | Criar tabela `holidays` (date, name, is_national). Excluir feriados do calculo de dias uteis no `HoursBankService.calculateExpectedMinutes()`. |
| B1.4 | Relatorio mensal de frequencia | Endpoint `GET /api/v1/attendance/report?month=X&year=Y&departmentId=Z` que retorna: total de dias trabalhados, total de horas, atrasos, faltas, por colaborador. |

**Dev Frontend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F1.1 | Remover botao "Calcular" do banco de horas | O calculo agora e automatico. Manter apenas visualizacao do saldo e historico. |
| F1.2 | Indicador visual de atraso na lista de ponto | Badge "Atrasado" e minutos de atraso na lista `AttendanceListView`. |
| F1.3 | Relatorio de frequencia (nova view) | Tabela com filtros por mes/departamento mostrando resumo de cada colaborador. |

#### 1B - Automacao de Ferias (Leave)

**Dev Backend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B1.5 | Job diario de transicao de status | Criar `AdonisJS command` agendavel: `node ace leave:update-status`. Busca leaves `approved` onde `start_date <= today` e muda para `in_progress`. Busca `in_progress` onde `end_date < today` e muda para `completed`. Registrar no `EmployeeHistory`. |
| B1.6 | Calculo automatico de periodo aquisitivo na admissao | Ao criar employee, chamar `LeaveService.calculateBalances()` automaticamente. Tambem rodar no job diario para todos os ativos (cria novos periodos quando vencem os 12 meses). |
| B1.7 | Alerta de ferias vencendo | No job diario, identificar colaboradores cujo periodo concessivo termina em 30/60/90 dias. Armazenar na tabela `notifications` (a ser criada no Sprint 2). Por ora, retornar no endpoint de dashboard. |
| B1.8 | Validar periodo concessivo expirado | Ferias nao gozadas no prazo de 12 meses apos vencer o periodo aquisitivo = ferias em dobro (art. 137 CLT). Marcar saldo como `expired` e calcular o valor dobrado. |

**Dev Frontend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F1.4 | Calendario visual de ausencias | Componente de calendario mensal mostrando quem esta de ferias/licenca por departamento. Usar dados do endpoint `GET /api/v1/leaves/calendar`. |
| F1.5 | Decompor `LeaveListView.vue` (933 linhas) | Extrair: `LeaveRequestForm.vue`, `LeaveTable.vue`, `LeaveBalanceCard.vue`, `LeaveFilters.vue`. Criar composable `useLeaves.ts`. |

#### 1C - Integracao Automatica Benefits + Payroll

**Dev Backend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B1.9 | Desconto automatico de beneficios na folha | No metodo `calculatePayroll()`, buscar `employee_benefits` ativos e gerar `payroll_entries` de desconto automaticamente. VT: 6% do salario base. Outros: conforme `benefit_plans.employee_discount_value` ou `employee_discount_percentage`. |
| B1.10 | Auto-gerar componente base_salary | Ao criar employee com salary, auto-criar `payroll_component` do tipo `base_salary`. Ao atualizar salary, atualizar o componente. |

---

### SPRINT 2 - SISTEMA DE NOTIFICACOES + REFATORACAO FRONTEND (2 semanas)

**Objetivo:** Implementar notificacoes in-app para fechar o loop de workflows de aprovacao. Refatorar views monoliticas do frontend.

#### 2A - Sistema de Notificacoes

**Dev Backend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B2.1 | Migration + Model para `notifications` | Tabela: id, user_id, type (enum), title, message, reference_type, reference_id, is_read, read_at, created_at. Types: leave_requested, leave_approved, leave_rejected, payslip_available, evaluation_open, document_uploaded, vacation_expiring, etc. |
| B2.2 | Service `NotificationService` | Metodos: `create(userId, type, title, message, ref)`, `markAsRead(id)`, `markAllAsRead(userId)`, `getUnread(userId)`, `getAll(userId, page, limit)`. |
| B2.3 | Controller + Rotas | `GET /api/v1/notifications` (lista), `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/:id/read`, `PATCH /api/v1/notifications/read-all`. |
| B2.4 | Integrar notificacoes nos fluxos existentes | Leave: ao solicitar, notifica gestor. Ao aprovar/rejeitar, notifica colaborador. Payroll: ao fechar periodo, notifica todos com holerite. Performance: ao abrir ciclo de avaliacao, notifica participantes. |

**Dev Frontend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F2.1 | Badge de notificacoes no header | Icone de sino com badge de contagem no `DefaultLayout.vue`. |
| F2.2 | Dropdown de notificacoes | Panel com ultimas 10 notificacoes. Link para "Ver todas". Botao "Marcar todas como lidas". |
| F2.3 | View de notificacoes completa | Pagina `/notifications` com lista paginada, filtros, marcacao de lida. |

#### 2B - Refatoracao Frontend (Views Monoliticas)

**Dev Frontend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F2.4 | Decompor `PerformanceView.vue` (2284 linhas) | Extrair: `CycleList.vue`, `CycleForm.vue`, `CompetencyManager.vue`, `GoalManager.vue`, `EvaluationForm.vue`, `DevelopmentPlanManager.vue`. Criar composable `usePerformance.ts`. |
| F2.5 | Decompor `RecruitmentView.vue` (2119 linhas) | Extrair: `RequisitionList.vue`, `RequisitionForm.vue`, `CandidateList.vue`, `CandidateForm.vue`, `InterviewManager.vue`, `RecruitmentKanban.vue`. Criar composable `useRecruitment.ts`. |
| F2.6 | Decompor `PayrollView.vue` (1456 linhas) | Extrair: `PeriodList.vue`, `PeriodCalculator.vue`, `PaySlipDetail.vue`, `ComponentManager.vue`, `EntryForm.vue`. Criar composable `usePayroll.ts`. |
| F2.7 | Decompor `BenefitsListView.vue` (1481 linhas) | Extrair: `BenefitCatalog.vue`, `BenefitForm.vue`, `PlanManager.vue`, `EmployeeBenefitManager.vue`, `DependentManager.vue`. Criar composable `useBenefits.ts`. |

**QA:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| Q2.1 | Testes de integracao para fluxos de notificacao | Testar que cada acao gera a notificacao correta para o usuario certo. |
| Q2.2 | Regressao visual apos refatoracao | Verificar que as views decompostas funcionam identicamente as originais. |

---

### SPRINT 3 - DASHBOARD AVANCADO + RELATORIOS (2 semanas)

**Objetivo:** Transformar o dashboard em uma ferramenta real de gestao com graficos, KPIs e relatorios exportaveis.

#### Dev Backend

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B3.1 | Endpoint de headcount historico | `GET /api/v1/dashboard/headcount-history` - retorna total de colaboradores ativos por mes nos ultimos 12 meses (query em `employees` por `hire_date` e `termination_date`). |
| B3.2 | Endpoint de taxa de turnover | `GET /api/v1/dashboard/turnover?period=12m` - calculo: (admissoes + demissoes) / 2 / media de ativos. |
| B3.3 | Endpoint de aniversariantes | `GET /api/v1/dashboard/birthdays?period=month` - colaboradores com aniversario no mes corrente. |
| B3.4 | Endpoint de custo por departamento | `GET /api/v1/dashboard/payroll-by-department?month=X&year=Y` - total de folha agrupado por departamento. |
| B3.5 | Exportacao CSV generica | Middleware/utility que aceita um array de objetos e gera CSV para download. Aplicar em: lista de employees, relatorio de frequencia, folha de pagamento. |
| B3.6 | Geracao de PDF para holerite | Usar biblioteca (PDFKit ou similar) para gerar contracheque em PDF. Endpoint `GET /api/v1/payroll/slips/:id/pdf`. |

#### Dev Frontend

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F3.1 | Biblioteca de graficos | Instalar Chart.js (ou ApexCharts) + wrapper Vue. Configurar tema visual consistente com a UI. |
| F3.2 | Dashboard admin com graficos | Grafico de barras: headcount por departamento. Grafico de linha: evolucao headcount 12 meses. Grafico de pizza: CLT vs PJ. Grafico de barras: custo folha por departamento. |
| F3.3 | Card de aniversariantes do mes | Lista com nome, departamento e data no dashboard. |
| F3.4 | Card de taxa de turnover | Indicador visual (gauge ou numero grande) com comparativo periodo anterior. |
| F3.5 | Botoes de exportacao CSV | Em todas as tabelas principais (employees, attendance, payroll, leaves). |
| F3.6 | Botao de download PDF no holerite | Na view de detalhes do contracheque. |

#### UX/UI

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| U3.1 | Design system minimo | Documentar cores, espacamentos, tipografia, tamanhos de componentes usados no CSS customizado. Criar variaveis CSS globais (`:root { --color-primary: ... }`). |
| U3.2 | Icones consistentes | Escolher e integrar uma biblioteca de icones (Lucide, Heroicons ou Phosphor). Atualmente nao ha nenhum icone no sistema - apenas texto. |
| U3.3 | Melhorar layout responsivo | Testar e ajustar todas as views para funcionar em tablet (768px-1024px). |

---

### SPRINT 4 - MODULO DE TRAINING + ONBOARDING (2 semanas)

**Objetivo:** Implementar o unico modulo placeholder restante (Training) e adicionar o fluxo de onboarding/offboarding.

#### 4A - Training (Treinamento e Desenvolvimento)

**Dev Backend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B4.1 | Migrations | `trainings`, `training_sessions`, `training_enrollments`, `training_budgets`. |
| B4.2 | Models | Training, TrainingSession, TrainingEnrollment, TrainingBudget. |
| B4.3 | TrainingService | CRUD de treinamentos, turmas, inscricoes, controle de presenca, certificados. |
| B4.4 | TrainingValidator | Validacoes de input. |
| B4.5 | TrainingController | Thin controller delegando para o service. |
| B4.6 | Rotas | `GET/POST /api/v1/trainings`, `GET/POST /api/v1/trainings/:id/sessions`, `POST /api/v1/sessions/:id/enrollments`, `GET /api/v1/employees/:id/trainings`. |
| B4.7 | Atualizar role_permissions | Adicionar modulo `training` na tabela de permissoes. |

**Dev Frontend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F4.1 | Types | Interfaces TypeScript para Training, Session, Enrollment. |
| F4.2 | Service HTTP | `training.service.ts` com chamadas a API. |
| F4.3 | Composable | `useTraining.ts` com logica de negocio. |
| F4.4 | Views | `TrainingListView.vue`, `TrainingDetailView.vue`, componentes menores. |
| F4.5 | Rotas e menu | Adicionar no router e no menu lateral. |

#### 4B - Onboarding/Offboarding Checklists

**Dev Backend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B4.8 | Migrations | `checklist_templates`, `checklist_template_items`, `employee_checklists`, `employee_checklist_items`. |
| B4.9 | Models | ChecklistTemplate, ChecklistTemplateItem, EmployeeChecklist, EmployeeChecklistItem. |
| B4.10 | ChecklistService | CRUD de templates. Auto-gerar checklist ao admitir ou desligar colaborador. Marcar itens como concluidos. |
| B4.11 | Auto-trigger no EmployeeService | Ao criar employee (status = active), gerar checklist de onboarding. Ao mudar status para terminated, gerar checklist de offboarding. |
| B4.12 | Notificacoes | Ao gerar checklist, notificar responsaveis de cada item. |

**Dev Frontend:**

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F4.6 | Admin: gerenciar templates de checklist | View para criar/editar templates com drag-and-drop de itens. |
| F4.7 | Employee detail: aba de checklist | Na view de detalhe do colaborador, exibir checklist de onboarding/offboarding com progresso. |

---

### SPRINT 5 - POLIMENTO, TESTES E PREPARACAO PARA PRODUCAO (2 semanas)

**Objetivo:** Fechar gaps de qualidade, testes abrangentes e preparar para deploy.

#### Dev Backend

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| B5.1 | Testes de integracao para fluxos criticos | Fluxo completo: admissao -> ponto -> banco horas -> ferias -> folha -> holerite. |
| B5.2 | Swagger/OpenAPI automatico | Usar `@adonisjs/swagger` ou gerar a partir dos validators para documentar a API. |
| B5.3 | Fila para calculos pesados | Usar Redis (ja no Docker) + Bull/BullMQ para processar calculo de folha em background. |
| B5.4 | Cache para tabelas fiscais | Cachear tabelas INSS/IRRF no Redis. Invalidar quando admin atualizar. |
| B5.5 | Auditoria de alteracoes (audit trail) | Criar tabela `audit_logs` (user_id, action, table_name, record_id, old_data JSONB, new_data JSONB, ip, timestamp). Hook global nos models criticos. |
| B5.6 | Logging estruturado | Configurar Pino (ja integrado no AdonisJS) com formato JSON para producao. |
| B5.7 | Seed completo para demonstracao | Atualizar seeders para criar cenario realista: empresa com 3 departamentos, 15 colaboradores, pontos, ferias, folha calculada, avaliacoes, vagas. |

#### Dev Frontend

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| F5.1 | Testes unitarios com Vitest | Testar composables, services e stores. Minimo 80% de cobertura nos services. |
| F5.2 | Testes de componentes com Vue Test Library | Testar componentes reutilizaveis criados no Sprint 0. |
| F5.3 | Acessibilidade (a11y) | Revisar todas as views: labels nos forms, roles ARIA, navegacao por teclado, contraste de cores. |
| F5.4 | Loading states e empty states | Garantir que toda view tem: estado de carregamento (skeleton ou spinner), estado vazio (mensagem + acao), estado de erro (mensagem + botao retry). |

#### QA

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| Q5.1 | Teste E2E dos fluxos criticos | Cypress ou Playwright: login, criar employee, registrar ponto, solicitar ferias, aprovar, calcular folha. |
| Q5.2 | Teste de carga | Validar performance com 100+ employees, 1000+ time entries, calculo de folha para 50 colaboradores. |
| Q5.3 | Validacao com especialista trabalhista | Conferir todos os calculos de INSS, IRRF, FGTS, ferias com valores reais. |
| Q5.4 | Revisao de seguranca | OWASP top 10: SQL injection (ORM ja protege), XSS, CSRF, autenticacao, autorizacao. |

#### DevOps

| # | Tarefa | Detalhamento |
|---|--------|-------------|
| D5.1 | CI/CD com GitHub Actions | Pipeline: lint -> typecheck -> test -> build. Trigger em push/PR para master. |
| D5.2 | Docker multi-stage para producao | Dockerfile otimizado para backend e frontend. |
| D5.3 | Variveis de ambiente para producao | Documentar todas as envs necessarias. Criar `.env.production.example`. |

---

## PARTE 3: BACKLOG FUTURO (pos-MVP)

Estas features devem ser implementadas apos os 5 sprints acima, quando o sistema estiver estavel em producao.

### Fase Futura A - Melhorias de Payroll

| # | Feature | Detalhamento |
|---|---------|-------------|
| FA.1 | 13o salario | 1a parcela (ate 30/nov) e 2a parcela (ate 20/dez). Calculo automatico no periodo correto. |
| FA.2 | Ferias na folha | 1/3 constitucional calculado automaticamente quando leave tipo vacation e aprovada. |
| FA.3 | Rescisao | Calculo: aviso previo, multa FGTS 40%, ferias proporcionais + 1/3, 13o proporcional. |
| FA.4 | Tabelas fiscais pela UI | View para admin atualizar faixas de INSS/IRRF quando o governo publicar novas tabelas. |

### Fase Futura B - Modulos Avancados

| # | Feature | Detalhamento |
|---|---------|-------------|
| FB.1 | Organograma interativo | Visualizacao de arvore hierarquica com D3.js ou GoJS. Usa `employees.manager_id` e `departments.parent_id`. |
| FB.2 | Comunicados internos | Publicacao segmentada pelo RH. Controle de leitura. Feed no dashboard. |
| FB.3 | Pesquisa de clima | Pesquisas anonimas. eNPS. Dashboard de resultados. |
| FB.4 | Saude ocupacional (ASO) | Exames periodicos, atestados, integracoes com Leave. |
| FB.5 | Integracao eSocial | Eventos periodicos obrigatorios para o governo. |
| FB.6 | App mobile (PWA) | Progressive Web App para registro de ponto e consulta de holerite pelo celular. |

---

## PARTE 4: ATRIBUICAO POR ESPECIALISTA

### Dev Backend

**Foco principal:** Correcoes criticas, automacoes de calculo, sistema de notificacoes, novos modulos.

Sprints: Sprint 0 (9 tarefas) -> Sprint 1 (10 tarefas) -> Sprint 2A (4 tarefas) -> Sprint 3 (6 tarefas) -> Sprint 4 (12 tarefas) -> Sprint 5 (7 tarefas).

**Skills necessarios:** AdonisJS 6, Lucid ORM, PostgreSQL, regras trabalhistas brasileiras, processamento assincrono.

### Dev Frontend

**Foco principal:** Componentes reutilizaveis, refatoracao de views monoliticas, graficos, acessibilidade.

Sprints: Sprint 0 (3 tarefas) -> Sprint 1 (5 tarefas) -> Sprint 2 (7 tarefas) -> Sprint 3 (6 tarefas) -> Sprint 4 (7 tarefas) -> Sprint 5 (4 tarefas).

**Skills necessarios:** Vue 3 Composition API, TypeScript, CSS customizado (sem framework UI), Chart.js, acessibilidade web.

### UX/UI

**Foco principal:** Design system, icones, responsividade, experiencia de usuario.

Sprints: Sprint 3 (3 tarefas) -> Sprint 5 (review de acessibilidade).

**Atuacao pontual:** Review de cada view refatorada para garantir consistencia visual.

### QA

**Foco principal:** Testes unitarios, de integracao e E2E. Validacao de regras trabalhistas.

Sprints: Sprint 0 (3 tarefas) -> Sprint 2 (2 tarefas) -> Sprint 5 (4 tarefas).

**Atuacao continua:** Validar cada sprint antes de considerar concluido.

---

## PARTE 5: DEPENDENCIAS ENTRE SPRINTS

```
Sprint 0 (Correcoes Criticas)
  |
  v
Sprint 1A (Auto Banco Horas) ----+
Sprint 1B (Auto Ferias) ---------+---> Sprint 2A (Notificacoes)
Sprint 1C (Benefits + Payroll) --+         |
                                           v
                                    Sprint 2B (Refatoracao Frontend)
                                           |
                                           v
                                    Sprint 3 (Dashboard + Relatorios)
                                           |
                                           v
                                    Sprint 4A (Training)
                                    Sprint 4B (Onboarding)
                                           |
                                           v
                                    Sprint 5 (QA + Producao)
```

**Notas:**
- Sprint 0 e bloqueante para todos os demais (correcoes criticas).
- Sprint 1A, 1B e 1C podem rodar em paralelo.
- Sprint 2A (notificacoes) depende do Sprint 1 porque as automacoes geram notificacoes.
- Sprint 2B (refatoracao) pode rodar em paralelo com 2A.
- Sprint 3 depende de 2 porque o dashboard consome dados dos modulos refatorados.
- Sprint 4 e independente tecnicamente, mas faz sentido sequencial para nao sobrecarregar.
- Sprint 5 e o gate final antes de producao.

---

## PARTE 6: ATUALIZACAO DO CLAUDE.MD

**Acao imediata necessaria:** Atualizar o CLAUDE.md para refletir o estado real do projeto. Os seguintes modulos devem ser marcados como [IMPLEMENTADO]:

- Leave (Ferias/Licencas)
- Benefits
- Payroll
- Performance
- Recruitment
- Dashboard (admin + employee views)

O modulo Training deve ser marcado como [PLACEHOLDER].

A secao "Proximo modulo a implementar" deve ser alterada para refletir que a proxima prioridade e a correcao de bugs criticos e automacoes, nao novos modulos.

Tambem adicionar ao modelo de dados as novas tabelas: `leaves`, `leave_balances`, `leave_configs`, `benefits`, `benefit_plans`, `employee_benefits`, `benefit_dependents`, `tax_tables`, `payroll_periods`, `payroll_components`, `payroll_entries`, `pay_slips`, `performance_cycles`, `competencies`, `cycle_competencies`, `individual_goals`, `evaluations`, `evaluation_scores`, `development_plans`, `job_requisitions`, `recruitment_stages`, `candidates`, `candidate_stage_history`, `interviews`, `password_reset_tokens`.

---

## PARTE 7: METRICAS DE SUCESSO

| Metrica | Alvo Sprint 0 | Alvo Sprint 5 |
|---------|---------------|---------------|
| Bugs criticos abertos | 0 | 0 |
| Testes unitarios passando | 130+ | 300+ |
| Cobertura de testes (backend) | 60% | 80% |
| Cobertura de testes (frontend) | 0% | 60% |
| Linhas por view (max) | 2284 | 500 |
| Tempo de calculo de folha (50 employees) | N/A | < 10s |
| Tempo de resposta API (P95) | N/A | < 500ms |
| Score Lighthouse (acessibilidade) | N/A | > 80 |

---

## PARTE 8: RISCOS E MITIGACOES

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Calculos trabalhistas incorretos | Alta | Critico | Validar com contador/especialista. Testes com valores reais. |
| Refatoracao quebra funcionalidades | Media | Alto | Testes de regressao antes e depois. Deploy incremental. |
| Performance da folha com muitos employees | Media | Medio | Processamento em background com Redis/Bull. |
| Tabelas fiscais desatualizadas | Baixa | Alto | Criar view admin para atualizar. Alertar quando tabela vence. |
| Complexidade do frontend sem framework UI | Media | Medio | Design system minimo. Componentes common bem documentados. |

---

**Este plano prioriza estabilidade e automacao sobre novas features. O sistema ja tem uma base funcional ampla - o trabalho agora e torna-la confiavel, automatica e pronta para producao.**

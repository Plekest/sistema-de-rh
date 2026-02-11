# Relatório de QA - Fase 2: Performance e Recruitment

**Data:** 2026-02-11
**Analista:** QA Team
**Módulos Analisados:** Avaliação de Desempenho (Performance) e Recrutamento e Seleção (Recruitment)

---

## Sumário Executivo

Este relatório apresenta a análise de qualidade dos dois módulos implementados na Fase 2 do Sistema de RH. Foram identificados **15 bugs/problemas**, sendo **3 críticos**, **5 de alta severidade**, **4 de média severidade** e **3 de baixa severidade**.

**Status Geral:** ⚠️ **NÃO APROVADO PARA PRODUÇÃO** - Correções críticas necessárias

---

## 1. Bugs Críticos (Bloqueadores)

### 🔴 CRÍTICO #1: Hardcoded User ID no Recruitment Service

**Arquivo:** `/backend/app/services/recruitment_service.ts`
**Linha:** 386
**Código:**
```typescript
await CandidateStageHistory.create({
  candidateId: candidate.id,
  stageId: defaultStage.id,
  movedBy: 1, // Sistema ❌ HARDCODED
  enteredAt: DateTime.now(),
})
```

**Problema:** O campo `movedBy` está hardcoded como `1` (Sistema), mas deveria receber o ID do usuário que está criando o candidato.

**Impacto:**
- Perda de rastreabilidade (não sabemos quem criou o candidato)
- Auditoria comprometida
- Possível erro se user ID 1 não existir no banco

**Solução:**
```typescript
async createCandidate(data: CreateCandidateData, userId: number) {
  // ...
  await CandidateStageHistory.create({
    candidateId: candidate.id,
    stageId: defaultStage.id,
    movedBy: userId,
    enteredAt: DateTime.now(),
  })
}
```

---

### 🔴 CRÍTICO #2: Parâmetro Não Utilizado no Recruitment Service

**Arquivo:** `/backend/app/services/recruitment_service.ts`
**Linhas:** 472, 500

**Código:**
```typescript
async hireCandidate(candidateId: number, _userId: number) {
  // _userId não é usado ❌
}

async rejectCandidate(candidateId: number, _userId: number, feedback?: string | null) {
  // _userId não é usado ❌
}
```

**Problema:** O parâmetro `_userId` é prefixado com `_` (indicando que não será usado), mas deveria ser registrado no histórico de mudança de etapa.

**Impacto:**
- Não há registro de quem contratou/rejeitou o candidato
- Auditoria incompleta

**Solução:**
```typescript
async hireCandidate(candidateId: number, userId: number) {
  // Fecha a etapa atual
  await CandidateStageHistory.query()
    .where('candidateId', candidateId)
    .whereNull('leftAt')
    .update({
      leftAt: DateTime.now(),
      feedback: 'Candidato contratado',
      movedBy: userId, // ✅ Adicionar
    })
  // ...
}
```

---

### 🔴 CRÍTICO #3: Falta de Validação de Permissions no Frontend

**Arquivo:** `/frontend/src/modules/performance/views/PerformanceView.vue`
**Linhas:** 647-656

**Problema:** O frontend permite criar metas/PDI apenas verificando `isAdmin`, mas não verifica se o módulo `performance` está habilitado para o usuário nas permissões.

**Impacto:**
- Usuários sem permissão podem tentar acessar recursos
- Experiência inconsistente (botão aparece mas backend bloqueia)

**Solução:**
```typescript
const canManagePerformance = computed(() =>
  (authStore.isAdmin || authStore.isManager) &&
  authStore.permissions.performance
)
```

---

## 2. Bugs de Alta Severidade

### 🟠 ALTO #1: Falta de Validação de Datas no Performance Validator

**Arquivo:** `/backend/app/validators/performance_validator.ts`
**Linhas:** 10-13

**Problema:** O validator aceita qualquer string para as datas, mas não valida:
- Se `startDate` < `endDate`
- Se `selfEvalDeadline` está entre start e end
- Se `managerEvalDeadline` > `selfEvalDeadline`

**Impacto:**
- Ciclos com datas incoerentes podem ser criados
- Lógica de negócio quebrada

**Solução:** Adicionar custom validation no service:
```typescript
async createCycle(data: CreateCycleData, currentUserId?: number) {
  const start = DateTime.fromISO(data.startDate)
  const end = DateTime.fromISO(data.endDate)
  const selfDeadline = DateTime.fromISO(data.selfEvalDeadline)
  const managerDeadline = DateTime.fromISO(data.managerEvalDeadline)

  if (start >= end) {
    throw new Error('Data de início deve ser anterior à data de fim')
  }
  if (selfDeadline < start || selfDeadline > end) {
    throw new Error('Prazo de autoavaliação deve estar dentro do período do ciclo')
  }
  if (managerDeadline < selfDeadline) {
    throw new Error('Prazo de avaliação do gestor deve ser posterior à autoavaliação')
  }
  // ...
}
```

---

### 🟠 ALTO #2: Falta de Validação de Salário Mínimo/Máximo

**Arquivo:** `/backend/app/validators/recruitment_validator.ts`
**Linhas:** 11-12

**Problema:** Não há validação para garantir que `salaryRangeMin` <= `salaryRangeMax`.

**Impacto:**
- Vagas com faixa salarial inválida (min > max)
- Confusão para usuários

**Solução:** Adicionar no service:
```typescript
async createRequisition(data: CreateRequisitionData, userId: number) {
  if (data.salaryRangeMin && data.salaryRangeMax &&
      data.salaryRangeMin > data.salaryRangeMax) {
    throw new Error('Salário mínimo não pode ser maior que o máximo')
  }
  // ...
}
```

---

### 🟠 ALTO #3: Falta de Index em Foreign Keys

**Observação:** Não foram lidos os arquivos de migration, mas é uma boa prática criar índices em todas as foreign keys para performance.

**Recomendação:** Verificar se as migrations incluem:
```typescript
table.index('cycle_id')
table.index('employee_id')
table.index('competency_id')
table.index('job_requisition_id')
table.index('candidate_id')
```

---

### 🟠 ALTO #4: Race Condition no Move Candidate

**Arquivo:** `/backend/app/services/recruitment_service.ts`
**Linhas:** 418-467

**Problema:** Não há transaction ao mover candidato entre etapas. Se dois usuários moverem simultaneamente, pode causar estado inconsistente.

**Impacto:**
- Histórico de etapas duplicado ou incorreto
- Etapa atual do candidato não bate com histórico

**Solução:**
```typescript
async moveToStage(...) {
  const trx = await db.transaction()

  try {
    await CandidateStageHistory.query({ client: trx })
      .where('candidateId', candidateId)
      .whereNull('leftAt')
      .update({ leftAt: DateTime.now(), feedback, score })

    await CandidateStageHistory.create({
      candidateId,
      stageId,
      movedBy: userId,
      enteredAt: DateTime.now(),
    }, { client: trx })

    candidate.useTransaction(trx)
    candidate.currentStageId = stageId
    await candidate.save()

    await trx.commit()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}
```

---

### 🟠 ALTO #5: Missing Error Handling no Frontend

**Arquivo:** `/frontend/src/modules/recruitment/views/RecruitmentView.vue`
**Linhas:** 195-203

**Problema:** O método `loadInterviews()` faz um loop em TODOS os candidatos para buscar entrevistas, sem limit. Se houver 10.000 candidatos, farão 10.000 requests.

**Impacto:**
- Performance crítica
- Possível crash do navegador
- Backend sobrecarregado

**Solução:** Criar endpoint específico no backend:
```typescript
// Backend
router.get('recruitment/interviews', [RecruitmentController, 'allInterviews'])

async allInterviews({ request, response }: HttpContext) {
  const { limit = 100, candidateId } = request.qs()
  const query = Interview.query()
    .preload('candidate')
    .preload('interviewer')
    .preload('stage')
    .orderBy('scheduledAt', 'desc')
    .limit(limit)

  if (candidateId) {
    query.where('candidateId', candidateId)
  }

  const interviews = await query
  return response.ok({ data: interviews })
}
```

---

## 3. Bugs de Média Severidade

### 🟡 MÉDIO #1: Tipos Inconsistentes no Frontend

**Arquivo:** `/frontend/src/modules/performance/types/index.ts`
**Linhas:** 103-105

**Problema:** O tipo `IndividualGoal` define `targetValue` e `achievedValue` como `number`, mas no backend são `string | null`.

**Código Backend:**
```typescript
// backend/app/models/individual_goal.ts
@column()
declare targetValue: string | null

@column()
declare achievedValue: string | null
```

**Impacto:**
- Type safety comprometida
- Possíveis bugs em runtime

**Solução:** Alinhar tipos:
```typescript
export interface IndividualGoal {
  // ...
  targetValue?: string | null  // ✅ Corrigir
  achievedValue?: string | null  // ✅ Corrigir
}
```

---

### 🟡 MÉDIO #2: Filtros de Query Params Não Validados

**Arquivo:** `/backend/app/controllers/recruitment_controller.ts`
**Linha:** 34

**Problema:** Os filtros são extraídos diretamente de `validateUsing`, mas não há sanitização de SQL injection caso sejam usados em raw queries.

**Nota:** Como está usando Lucid ORM, o risco é baixo, mas ainda assim é uma boa prática validar.

---

### 🟡 MÉDIO #3: Missing Loading States

**Arquivo:** `/frontend/src/modules/recruitment/views/RecruitmentView.vue`

**Problema:** Não há feedback visual quando operações lentas (aprovar vaga, contratar candidato) estão em andamento.

**Solução:** Adicionar loading states e desabilitar botões durante operação.

---

### 🟡 MÉDIO #4: Falta de Paginação no Frontend

**Arquivo:** `/frontend/src/modules/performance/views/PerformanceView.vue`
**Linha:** 133

**Problema:** A lista de ciclos usa `limit: 50`, mas não implementa paginação no UI. Se houver mais de 50 ciclos, não há como acessar os demais.

**Solução:** Adicionar componente de paginação ou scroll infinito.

---

## 4. Bugs de Baixa Severidade

### 🟢 BAIXO #1: Console.error em Produção

**Arquivos:** Múltiplos arquivos Vue

**Problema:** Há vários `console.error()` no código que vão para produção.

**Solução:** Usar um logger adequado ou remover logs sensíveis em build de produção.

---

### 🟢 BAIXO #2: Textos Sem i18n

**Problema:** Todas as mensagens de erro estão hardcoded em português. Não há suporte a internacionalização.

**Recomendação:** Implementar i18n se houver requisito futuro de multi-idioma.

---

### 🟢 BAIXO #3: Missing JSDoc em Métodos Complexos

**Problema:** Métodos como `submitEvaluation()` e `moveToStage()` não têm documentação JSDoc explicando parâmetros e retorno.

**Recomendação:** Adicionar JSDoc para melhor manutenibilidade.

---

## 5. Verificação de Padrões

### ✅ Padrões Seguidos Corretamente

1. **Arquitetura MVC** - Controllers, Services, Models estão bem separados
2. **Validators** - Uso consistente de VineJS
3. **Relacionamentos** - Models usam `@belongsTo` e `@hasMany` corretamente
4. **Naming Convention** - snake_case no DB, camelCase no código
5. **HTTP Status Codes** - Uso correto de 200, 201, 400, 404, etc.
6. **Middleware de Auth** - Todas as rotas protegidas
7. **Middleware de Role** - Operações sensíveis restritas a admin/manager

### ⚠️ Padrões Inconsistentes

1. **Error Handling** - Alguns lugares retornam `error.message`, outros retornam mensagens genéricas
2. **Preload Strategy** - Alguns métodos fazem preload, outros não (inconsistência)
3. **Date Formatting** - Frontend formata datas em componentes, deveria ter utility centralizada

---

## 6. Verificação de Segurança

### ✅ Pontos Positivos

1. **SQL Injection** - Protegido pelo Lucid ORM
2. **Authentication** - Todas as rotas autenticadas
3. **Authorization** - Role-based access control implementado
4. **Password Hashing** - Não aplicável neste módulo (auth já implementado anteriormente)

### ⚠️ Pontos de Atenção

1. **Mass Assignment** - Models não definem `$fillable` ou `$guarded` (Lucid não tem, mas bom estar ciente)
2. **Rate Limiting** - Não visto (deveria ter em rotas de criação)
3. **File Upload** - Campo `resumePath` no Candidate aceita qualquer string (risco de path traversal)

---

## 7. Verificação de Performance

### ⚠️ Problemas de Performance

1. **N+1 Queries** - Em `loadInterviews()` do frontend (loop de requests)
2. **Missing Indexes** - Verificar se FKs têm índices
3. **Eager Loading** - Alguns métodos podem se beneficiar de mais preload
4. **Select *** - Queries fazem select de todos os campos, mesmo quando não necessário

### 💡 Sugestões de Otimização

1. Adicionar índices compostos em queries frequentes:
   - `(candidateId, status)` em candidates
   - `(cycleId, employeeId)` em evaluations
   - `(cycleId, status)` em individual_goals

2. Implementar cache para:
   - Lista de etapas (recruitment stages)
   - Lista de competências ativas
   - Estatísticas de dashboard

---

## 8. Verificação de Consistência Backend ↔ Frontend

### ✅ Consistências

1. **Rotas** - Frontend consome as mesmas rotas expostas pelo backend
2. **Status Codes** - Frontend trata corretamente 200, 201, 400, 404
3. **Enums** - Labels em português correspondem aos valores do backend

### ❌ Inconsistências

1. **Tipos** - `targetValue` e `achievedValue` são string no backend, number no frontend
2. **Filtros** - Alguns filtros do frontend não são enviados ao backend
3. **Ordenação** - Frontend não controla ordenação, sempre usa default do backend

---

## 9. Verificação de Migrations

**NOTA:** Os arquivos de migration não foram totalmente lidos, mas com base nos models:

### Checklist de Migrations

- [ ] Todas as tabelas criadas com timestamps (`created_at`, `updated_at`)
- [ ] Todas as FKs têm `onDelete` e `onUpdate` definidos
- [ ] Campos nullable têm `.nullable()` nas migrations
- [ ] Enums têm valores explícitos
- [ ] Índices criados em FKs
- [ ] Seeds para `recruitment_stages` incluem as etapas padrão

---

## 10. Sugestões de Melhoria

### 🎯 Alta Prioridade

1. **Testes Unitários** - Criar testes para services (0% coverage atualmente)
2. **Testes de Integração** - Testar fluxos completos (criar ciclo → adicionar competências → criar avaliação)
3. **Error Boundaries** - Adicionar no frontend para capturar erros inesperados
4. **API Documentation** - Gerar docs automaticamente (Swagger/OpenAPI)

### 🎯 Média Prioridade

1. **Auditoria Completa** - Log de TODAS as operações críticas (criar vaga, contratar candidato, etc.)
2. **Notificações** - Enviar email quando avaliação for criada, entrevista agendada, etc.
3. **Validação de Arquivos** - Se `resumePath` aceita upload, validar tipo e tamanho
4. **Soft Delete** - Considerar soft delete em vez de delete físico

### 🎯 Baixa Prioridade

1. **Paginação Client-Side** - Implementar navegação entre páginas
2. **Export to Excel** - Permitir exportar listas de candidatos, avaliações, etc.
3. **Dark Mode** - Suporte a tema escuro no frontend
4. **Keyboard Shortcuts** - Atalhos para ações comuns

---

## 11. Checklist de Correções Obrigatórias

Antes de aprovar para produção, os seguintes bugs **DEVEM** ser corrigidos:

- [ ] **CRÍTICO #1** - Remover hardcoded user ID no createCandidate
- [ ] **CRÍTICO #2** - Usar parâmetro `_userId` em hireCandidate e rejectCandidate
- [ ] **CRÍTICO #3** - Validar permissions no frontend
- [ ] **ALTO #1** - Validar datas no createCycle
- [ ] **ALTO #2** - Validar faixa salarial
- [ ] **ALTO #4** - Adicionar transaction no moveToStage
- [ ] **ALTO #5** - Corrigir loop de requests no loadInterviews
- [ ] **MÉDIO #1** - Corrigir tipos no frontend (targetValue/achievedValue)

---

## 12. Conclusão

### Status Final: ⚠️ **NÃO APROVADO PARA PRODUÇÃO**

Os módulos de Performance e Recruitment foram implementados seguindo a arquitetura e padrões do projeto, mas apresentam **3 bugs críticos** e **5 bugs de alta severidade** que precisam ser corrigidos antes de ir para produção.

### Pontos Positivos

- Código bem estruturado e seguindo padrões MVC
- Separação clara de responsabilidades
- Uso consistente de validators
- Autenticação e autorização implementadas
- Interface amigável e responsiva

### Pontos Negativos

- Falta de testes (0% coverage)
- Hardcoded values em lugares críticos
- Race conditions em operações concorrentes
- Performance issues em carregamento de entrevistas
- Tipos inconsistentes entre backend e frontend

### Recomendação

**Bloquear deploy para produção** até que os 8 bugs críticos/altos sejam corrigidos. Após correções, realizar novo ciclo de QA e testes de integração.

---

**Próximos Passos:**

1. Correção dos bugs críticos/altos pela equipe de desenvolvimento
2. Code review das correções
3. Testes de integração dos fluxos completos
4. Testes de carga (stress test) nos endpoints de listagem
5. Novo ciclo de QA
6. Aprovação final para produção

---

**Relatório gerado por:** QA Team
**Data:** 2026-02-11
**Versão do Sistema:** 2.0.0-beta
**Tempo de Análise:** ~2 horas

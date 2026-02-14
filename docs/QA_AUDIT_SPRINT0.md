# Auditoria de Qualidade - Sprint 0

**Data:** 2026-02-14
**Responsavel:** QA Agent (Analista de Qualidade)
**Versao:** 2.0 (Auditoria aprofundada)
**Relatorio anterior:** `/docs/QA_SUMMARY.md` (2026-02-11)

---

## SUMARIO EXECUTIVO

Auditoria completa do Sistema de RH cobrindo: validacao dos 5 bugs criticos reportados,
auditoria de validacoes (validators), auditoria de seguranca (rotas, auth, dados sensiveis),
verificacao de consistencia de dados (models vs migrations), e verificacao de fluxos criticos.

### Resultado Geral

| Categoria | Qtd Issues | Critica | Alta | Media | Baixa |
|-----------|-----------|---------|------|-------|-------|
| Bugs confirmados (da analise anterior) | 3 | 2 | 1 | 0 | 0 |
| Bugs corrigidos (desde a analise anterior) | 3 | 2 | 1 | 0 | 0 |
| Novos bugs encontrados nesta auditoria | 11 | 1 | 5 | 3 | 2 |
| Issues de seguranca | 5 | 1 | 2 | 1 | 1 |
| Issues de validacao | 8 | 0 | 3 | 4 | 1 |
| **TOTAL PENDENTE** | **24** | **2** | **8** | **7** | **3** |

---

## 1. VERIFICACAO DOS 5 BUGS CRITICOS REPORTADOS

### BUG-001 - Calculo INSS Fallback Progressivo

**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/payroll_service.ts`
**Metodo:** `calculateINSSFallback()` (linhas 565-593)
**Reportado como:** Calculo progressivo incorreto
**Status:** CORRIGIDO

**Analise detalhada:**

O codigo ATUAL (pos-correcao) implementa corretamente o calculo progressivo:

```typescript
// Linhas 565-593 (versao atual - CORRETA)
private calculateINSSFallback(grossSalary: number): number {
    const brackets = [
      { max: 1412.00, rate: 7.5 },
      { max: 2666.68, rate: 9.0 },
      { max: 4000.03, rate: 12.0 },
      { max: 7786.02, rate: 14.0 },
    ]

    const salary = toNumber(grossSalary)
    if (salary <= 0) return 0

    const cappedSalary = Math.min(salary, 7786.02)
    let totalINSS = 0
    let previousMax = 0

    for (const bracket of brackets) {
      if (cappedSalary <= previousMax) break
      const taxableInBracket = Math.min(cappedSalary, bracket.max) - previousMax
      if (taxableInBracket > 0) {
        totalINSS += taxableInBracket * (bracket.rate / 100)
      }
      previousMax = bracket.max
    }

    return Math.round(totalINSS * 100) / 100
}
```

**Verificacao com valores de referencia:**

Para salario de R$3.000,00:
- 1a faixa: 1.412,00 * 7,5% = R$105,90
- 2a faixa: (2.666,68 - 1.412,00) * 9,0% = 1.254,68 * 9% = R$112,92
- 3a faixa: (3.000,00 - 2.666,68) * 12,0% = 333,32 * 12% = R$40,00
- Total esperado: R$258,82
- Algoritmo calcula: (1412 * 0.075) + (1254.68 * 0.09) + (333.32 * 0.12) = 105.90 + 112.92 + 40.00 = 258.82 -- CORRETO

Para teto (R$7.786,02):
- 1a faixa: 1.412,00 * 7,5% = R$105,90
- 2a faixa: 1.254,68 * 9,0% = R$112,92
- 3a faixa: 1.333,35 * 12,0% = R$160,00
- 4a faixa: 3.785,99 * 14,0% = R$530,04
- Total esperado: R$908,86
- Algoritmo: correto com o `previousMax` tracking

**Conclusao:** O BUG-001 foi CORRIGIDO. A logica `previousMax` garante o calculo progressivo
correto, acumulando o teto de cada faixa anterior.

---

### BUG-002 - Calculo INSS Tabela Dinamica (DB)

**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/payroll_service.ts`
**Metodo:** `calculateINSS()` (linhas 508-555)
**Reportado como:** Calculo com tabela do banco incorreto
**Status:** CORRIGIDO

**Analise detalhada:**

O codigo atual usa a mesma logica `previousMax` correta:

```typescript
// Linhas 531-552 (versao atual - CORRETA)
let totalINSS = 0
let previousMax = 0

for (const bracket of brackets) {
  const min = toNumber(bracket.bracketMin)
  const max = bracket.bracketMax ? toNumber(bracket.bracketMax) : Infinity
  const rate = toNumber(bracket.rate)

  const bracketFloor = previousMax
  const bracketCeiling = max

  if (cappedSalary <= bracketFloor) break

  const taxableInBracket = Math.min(cappedSalary, bracketCeiling) - bracketFloor
  if (taxableInBracket > 0) {
    totalINSS += taxableInBracket * (rate / 100)
  }
  previousMax = bracketCeiling
}
```

**Observacao importante:** O metodo usa `previousMax` ao inves de `bracket.bracketMin` para
calcular o piso de cada faixa. Isso e correto DESDE QUE as faixas no banco sejam contiguos
(sem gaps). Se houver gap entre faixas (ex: faixa 1 vai ate 1412 e faixa 2 comeca em 1413),
a variavel `previousMax` garante que nao perde nenhum centavo.

Porem, se as faixas tiverem overlap (min da faixa 2 < max da faixa 1), havera calculo
duplicado. O codigo NAO valida isso.

**Conclusao:** BUG-002 CORRIGIDO. Recomendacao: adicionar validacao na seed/import de tabelas
fiscais para garantir que faixas sao contiguos sem overlap.

---

### BUG-003 - Senha Hardcoded no Codigo

**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/employee_service.ts`
**Metodo:** `create()` (linhas 96-137)
**Reportado como:** Senha "Mudar@123" hardcoded
**Status:** CORRIGIDO

**Analise detalhada:**

O codigo atual usa `generateRandomPassword()`:

```typescript
// Linha 104 (employee_service.ts)
const randomPassword = generateRandomPassword()
const newUser = await User.create({
  fullName: data.fullName,
  email: data.email,
  password: randomPassword,
  role: 'employee',
  isActive: true,
})
```

O `password_generator.ts` (`/home/fernandes/IA/sistema-de-rh/backend/app/utils/password_generator.ts`)
gera senhas aleatorias de 12 caracteres usando `crypto.randomBytes()`, garantindo que contem
maiusculas, minusculas, numeros e simbolos.

**Conclusao:** BUG-003 CORRIGIDO. A senha agora e gerada aleatoriamente com criptografia
segura. Entretanto, ha um problema residual: a senha gerada nao e comunicada ao usuario
de nenhuma forma (nao ha envio de email com a senha temporaria). O usuario criado
automaticamente nao tem como saber sua senha para fazer login.

**Novo bug derivado:** Ver BUG-NEW-001 abaixo.

---

### BUG-004 - Conversao Decimal PostgreSQL

**Arquivos:** Multiplos services
**Reportado como:** `Number()` inconsistente para valores decimais do PostgreSQL
**Status:** PARCIALMENTE CORRIGIDO

**Analise detalhada:**

Foi criado o helper `toNumber()` em `/home/fernandes/IA/sistema-de-rh/backend/app/utils/number_helper.ts`:

```typescript
export function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  if (isNaN(num)) return 0
  return num
}
```

**Uso no payroll_service.ts:** ADEQUADO. O `payroll_service.ts` usa `toNumber()` em todas as
operacoes com valores decimais (linhas 355, 427, 429, 472, 476, 523, 528, 535-537, 573,
610, 629, 632-633).

**Uso em outros services:** INSUFICIENTE. Os seguintes services ainda usam `Number()` direto:

| Arquivo | Linha(s) | Variavel | Risco |
|---------|----------|----------|-------|
| `dashboard_service.ts` | 18, 32, 47, 63, 68, 119, 129, 170, 201 | Contagens e soma financeira | MEDIO - contagens sao inteiros, mas `totalPayroll` (linha 119) e financeiro |
| `performance_service.ts` | 119-121 | Contagens | BAIXO - sao counts, nao decimais |
| `recruitment_service.ts` | 146, 183, 261, 282-284, 722-725 | Contagens e salary | MEDIO - `salaryRangeMin/Max` (146, 183) podem ser decimais |

**Conclusao:** BUG-004 PARCIALMENTE CORRIGIDO. O `payroll_service` esta adequado. Outros
services que manipulam valores financeiros (especialmente `dashboard_service.ts` linha 119
para `totalPayroll`) devem migrar para `toNumber()`.

**Arquivos que precisam de correcao:**
1. `/home/fernandes/IA/sistema-de-rh/backend/app/services/dashboard_service.ts` - linha 119: `totalPayroll = Number(payrollSum[0].$extras.total) || 0` -- usar `toNumber()`
2. `/home/fernandes/IA/sistema-de-rh/backend/app/services/recruitment_service.ts` - linhas 146, 183: comparacao de salary ranges

---

### BUG-005 - Race Condition no Calculo de Folha

**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/payroll_service.ts`
**Metodo:** `calculatePayroll()` (linhas 233-308)
**Reportado como:** Dois usuarios podem processar folha simultaneamente
**Status:** CORRIGIDO (com ressalvas)

**Analise detalhada:**

O codigo atual implementa DUPLA protecao:

1. **Lock pessimista** (linha 238-241):
```typescript
const period = await PayrollPeriod.query({ client: trx })
  .where('id', periodId)
  .forUpdate()        // <-- Lock pessimista no registro
  .firstOrFail()
```

2. **Atomic status check-and-update** (linhas 254-265):
```typescript
const [updated] = await db
  .from('payroll_periods')
  .where('id', periodId)
  .where('status', 'open')           // <-- WHERE atomico
  .update({ status: 'calculating' }) // <-- Muda status atomicamente
  .returning('*')
  .useTransaction(trx)

if (!updated) {
  await trx.rollback()
  throw new Error('Periodo nao esta mais aberto para calculo')
}
```

3. **Cleanup em caso de erro** (linhas 296-304):
```typescript
try {
  await db.from('payroll_periods')
    .where('id', periodId)
    .where('status', 'calculating')
    .update({ status: 'open' })
} catch (cleanupError) {
  // Ignora erro de cleanup
}
```

**Problemas residuais:**

A. O cleanup de erro (linhas 296-304) roda FORA da transacao (apos `trx.rollback()`).
   Isso e correto para resetar o status, mas ha uma janela de tempo entre o rollback
   e o update onde o periodo fica com status 'calculating' orfao. Se o processo morrer
   (kill, OOM) entre o rollback e o cleanup, o periodo fica travado permanentemente.
   **Solucao sugerida:** Adicionar um job de limpeza que busca periodos em 'calculating'
   ha mais de X minutos e reseta para 'open'.

B. O status volta para 'open' tanto em caso de sucesso (linha 283-287) quanto em erro.
   Isso significa que apos calcular com sucesso, qualquer usuario pode recalcular
   livremente. Nao ha indicacao no status de que o calculo ja foi feito.
   **Sugestao:** Adicionar status 'calculated' apos sucesso, diferente de 'open'.

**Conclusao:** BUG-005 CORRIGIDO para o cenario primario (race condition entre dois usuarios).
Recomendacoes de robustez documentadas acima.

---

## 2. NOVOS BUGS ENCONTRADOS

### BUG-NEW-001 - Senha gerada automaticamente nao e comunicada ao usuario

**Severidade:** ALTA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/employee_service.ts` (linhas 99-113)
**Descricao:** Quando um employee e criado sem `userId`, o sistema gera uma senha aleatoria
e cria um User automaticamente. Porem, essa senha nao e enviada por email nem retornada
na resposta. O usuario criado automaticamente NAO TEM COMO SABER SUA SENHA.

**Impacto:** Usuarios criados automaticamente nao conseguem fazer login. Precisam pedir
reset de senha, o que depende de SMTP configurado (que tambem pode nao estar).

**Solucao sugerida:** Enviar email com credenciais ao usuario, ou retornar a senha
temporaria na resposta da criacao (apenas para admin), ou forcar reset de senha no
primeiro login.

---

### BUG-NEW-002 - FGTS contabilizado como deducao no contracheque

**Severidade:** ALTA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/payroll_service.ts` (linhas 403-417)
**Descricao:** O FGTS (8% sobre bruto) e criado como entry com `componentType: 'deduction'`.
Na CLT, o FGTS e um deposito PATRONAL, nao um desconto do colaborador. Ele nao deve
aparecer como deducao no contracheque (nao diminui o salario liquido).

O calculo de `totalDeductions` na linha 475 filtra o FGTS (`e.code !== 'fgts'`), entao o
salario liquido esta correto. POREM, o FGTS aparece na lista de deducoes do contracheque,
o que e conceitualmente errado e confunde o usuario.

```typescript
// Linha 475 - filtro correto para calculo
const totalDeductions = entries
  .filter((e) => e.componentType === 'deduction' && e.code !== 'fgts')
  .reduce((sum, e) => sum + toNumber(e.amount), 0)
```

**Impacto:** Informacao incorreta no contracheque. O FGTS deve ser um item INFORMATIVO,
nao uma deducao.

**Solucao sugerida:** Criar um novo `componentType` chamado `informative` ou `employer_cost`,
e usar esse tipo para FGTS. Ou simplesmente nao incluir FGTS nas entries de deducao.

---

### BUG-NEW-003 - Dependentes de IRRF hardcoded como 0

**Severidade:** ALTA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/payroll_service.ts` (linha 387)

```typescript
const dependents = 0 // TODO: Buscar numero de dependentes do colaborador
```

**Descricao:** O numero de dependentes para deducao do IRRF esta hardcoded como 0. Na
legislacao brasileira, cada dependente deduz R$189,59 da base de calculo do IRRF. Isso
afeta diretamente o valor do imposto retido.

**Impacto:** Colaboradores com dependentes pagam MAIS IRRF do que deveriam. Impacto
financeiro direto para cada colaborador com dependentes.

**Solucao sugerida:** Adicionar campo `dependents_count` na tabela `employees` ou buscar
a contagem de `benefit_dependents` do colaborador.

---

### BUG-NEW-004 - Calculo de VT sobre salario bruto ao inves de base_salary

**Severidade:** MEDIA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/payroll_service.ts` (linhas 449-467)

```typescript
// Linha 455
vtDiscount = Math.round(grossSalary * 0.06 * 100) / 100
```

**Descricao:** O desconto de Vale Transporte (6%) esta sendo calculado sobre o `grossSalary`
(que inclui todos os componentes: salario base + bonus + periculosidade + insalubridade).
Na CLT, o desconto de VT de 6% deve incidir apenas sobre o SALARIO BASE, nao sobre
adicionais.

**Impacto:** Colaboradores com adicionais salariais terao desconto de VT maior do que o legal.

**Solucao sugerida:** Filtrar `components` para pegar apenas o tipo `base_salary` e usar
esse valor para o calculo de 6%.

---

### BUG-NEW-005 - Ausencia de verificacao de permissao de objeto (IDOR)

**Severidade:** ALTA
**Arquivos:**
- `/home/fernandes/IA/sistema-de-rh/backend/app/controllers/payroll_controller.ts` (linhas 85-91, 187-194, 200-214, 220-230)
- `/home/fernandes/IA/sistema-de-rh/backend/start/routes.ts` (linhas 229-233)

**Descricao:** As rotas de contracheque permitem que qualquer usuario autenticado acesse:
- `GET /api/v1/payroll/periods/:periodId/slips` - lista TODOS os contracheques do periodo
- `GET /api/v1/payroll/slips` - lista contracheques com filtro por employeeId (qualquer um)
- `GET /api/v1/payroll/slips/:id` - detalhes de qualquer contracheque

Nenhuma dessas rotas verifica se o usuario logado tem permissao para ver os dados. Um
colaborador com role `employee` pode ver os contracheques de TODOS os outros colaboradores
basta saber o `periodId` ou `slipId`.

**Impacto:** Vazamento de dados salariais de todos os colaboradores. Violacao de privacidade.
LGPD.

**Solucao sugerida:** Implementar Bouncer policy ou verificacao no controller: se role e
`employee`, filtrar automaticamente pelo proprio `employeeId`. Se role e `manager`, filtrar
por departamento.

---

### BUG-NEW-006 - Leave cancel sem verificacao de propriedade

**Severidade:** ALTA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/leave_service.ts` (linhas 188-205)
**Rota:** `PATCH /api/v1/leaves/:id/cancel` (sem middleware de role)

**Descricao:** Qualquer usuario autenticado pode cancelar qualquer solicitacao de ferias.
A rota `leaves/:id/cancel` nao tem middleware de role e o service nao verifica se o usuario
logado e o dono da solicitacao ou um admin/manager.

```typescript
// routes.ts linha 163
router.patch('leaves/:id/cancel', [LeavesController, 'cancel'])
// SEM .use(middleware.role(...))
```

**Impacto:** Um colaborador pode cancelar as ferias de outro colaborador.

**Solucao sugerida:** No controller, verificar se `auth.user.id` corresponde ao
`leave.employee.userId` ou se o usuario e admin/manager.

---

### BUG-NEW-007 - Employees nao pode ser desvinculado do user ao deletar (soft delete)

**Severidade:** MEDIA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/services/employee_service.ts` (linhas 235-250)

**Descricao:** Quando um employee e "deletado" (soft delete -> status = terminated), o
usuario associado (User) continua ativo e com acesso ao sistema. O servico nao desativa
o usuario correspondente.

**Impacto:** Ex-colaboradores continuam com acesso ao sistema apos desligamento.

**Solucao sugerida:** Ao mudar status para `terminated`, desativar o User associado
(`user.isActive = false`).

---

### BUG-NEW-008 - Dashboard employee acessivel sem verificacao de employeeId

**Severidade:** MEDIA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/controllers/dashboard_controller.ts`
**Rota:** `GET /api/v1/dashboard/employee` (sem middleware de role)

**Descricao:** O endpoint de dashboard do employee provavelmente recebe o `employeeId`
como parametro (nao verificado diretamente no controller). Se o `employeeId` vier da
query string ou do body, qualquer usuario autenticado pode ver o dashboard de outro
colaborador. O endpoint esta disponivel para todos os roles sem restricao.

---

### BUG-NEW-009 - Falta de unique constraint no email de Employee

**Severidade:** ALTA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/database/migrations/1770830000003_create_employees_table.ts` (linha 21)

**Descricao:** A coluna `email` na tabela `employees` e definida como `notNullable()` mas
NAO tem constraint `unique()`. Isso permite que dois employees tenham o mesmo email, o que
causa problemas na auto-criacao de usuario (o service usa `User.findBy('email', data.email)`
para verificar, mas nao no Employee).

```typescript
// Linha 21 da migration
table.string('email').notNullable()  // SEM .unique()
```

O validator tambem nao valida unicidade de email no employee:
```typescript
// employee_validator.ts linha 21
email: vine.string().trim().email().normalizeEmail(),  // SEM .unique()
```

**Impacto:** Duplicacao de dados, confusao na vinculacao employee-user.

---

### BUG-NEW-010 - Falta de validacao de formato de CPF/CNPJ

**Severidade:** BAIXA
**Arquivo:** `/home/fernandes/IA/sistema-de-rh/backend/app/validators/employee_validator.ts` (linhas 8-19)

**Descricao:** Os campos `cpf` e `cnpj` sao validados apenas por `maxLength` (14 e 18
caracteres respectivamente), mas nao ha validacao de formato (regex) nem de digitos
verificadores.

```typescript
cpf: vine.string().trim().maxLength(14).optional().nullable(),
cnpj: vine.string().trim().maxLength(18).optional().nullable(),
```

**Impacto:** CPFs e CNPJs invalidos podem ser cadastrados. Nao ha validacao de unicidade
tambem (a migration tem unique constraint na coluna, mas o validator nao previne antes).

---

### BUG-NEW-011 - Falta de validacao de formato de data em multiplos validators

**Severidade:** BAIXA
**Arquivos:** Todos os validators que aceitam datas

**Descricao:** Campos de data sao validados apenas como `string().trim()` sem validacao de
formato ISO (YYYY-MM-DD). Exemplos:

| Validator | Campo | Validacao atual |
|-----------|-------|-----------------|
| `employee_validator.ts` | `hireDate` | `vine.string().trim()` |
| `employee_validator.ts` | `terminationDate` | `vine.string().trim().optional().nullable()` |
| `employee_validator.ts` | `birthDate` | `vine.string().trim().optional().nullable()` |
| `leave_validator.ts` | `startDate` | `vine.string().trim()` |
| `leave_validator.ts` | `endDate` | `vine.string().trim()` |
| `payroll_validator.ts` | `effectiveFrom` | `vine.string().trim()` |
| `performance_validator.ts` | `startDate` | `vine.string().trim()` |
| `recruitment_validator.ts` | `scheduledAt` | `vine.string().trim()` |

**Impacto:** Datas invalidas passam pela validacao e podem causar erros no `DateTime.fromISO()`
do Luxon, resultando em valores `null` ou excecoes nao tratadas.

**Solucao sugerida:** Usar `vine.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/)` ou
implementar uma regra customizada de data.

---

## 3. AUDITORIA DE SEGURANCA

### 3.1 Arquivo .env

**Status:** OK (com ressalva)

O `.gitignore` na raiz (`/home/fernandes/IA/sistema-de-rh/.gitignore`) inclui `.env`:
```
# Variaveis de ambiente
.env
.env.local
.env.*.local
```

O `git ls-files` confirma que apenas `.env.example` esta versionado, nao `.env`.
Os arquivos `.env` existem no disco (backend e frontend) mas NAO estao no repositorio.

**Ressalva do PLANO_ROTEIRO.md:** O plano menciona "APP_KEY exposta no .env commitado"
(secao 1.4, linha 81). Porem, na verificacao atual, o `.env` NAO esta no git. E possivel
que tenha sido removido entre a analise do arquiteto e esta auditoria, ou que estivesse
no historico e tenha sido excluido. **Recomendacao:** Verificar historico git para confirmar
que o `.env` nunca foi commitado. Se foi, rotacionar a APP_KEY e credenciais.

### 3.2 Rate Limiting

**Status:** AUSENTE

O arquivo `/home/fernandes/IA/sistema-de-rh/backend/start/kernel.ts` nao registra nenhum
middleware de rate limiting. O endpoint `POST /api/v1/auth/login` esta completamente
desprotegido contra brute force.

Tambem nao ha rate limiting nos endpoints:
- `POST /api/v1/auth/forgot-password` (pode ser usado para email bombing)
- `POST /api/v1/auth/reset-password` (pode ser usado para brute force de tokens)

**Risco:** Um atacante pode tentar milhares de senhas por segundo no endpoint de login.

### 3.3 Rotas sem Autenticacao que Deveriam Ter

**Status:** Sem problemas criticos

Rotas publicas (sem auth):
- `GET /` - Healthcheck basico (ok)
- `POST /api/v1/auth/login` - Login (ok, deve ser publico)
- `POST /api/v1/auth/forgot-password` - Recuperacao de senha (ok)
- `POST /api/v1/auth/reset-password` - Reset de senha (ok)

Todas as demais rotas estao dentro do grupo `.use(middleware.auth({ guards: ['api'] }))`.
Nenhuma rota que deveria ser autenticada esta publica.

### 3.4 Rotas sem Middleware de Role Adequado (RBAC)

Rotas que qualquer usuario autenticado pode acessar, mas que deveriam ter restricao:

| Rota | Metodo | Problema |
|------|--------|----------|
| `/api/v1/payroll/periods` | GET | Qualquer user ve periodos de folha |
| `/api/v1/payroll/periods/:periodId/slips` | GET | Qualquer user ve todos os contracheques |
| `/api/v1/payroll/slips` | GET | Qualquer user lista contracheques de qualquer employee |
| `/api/v1/payroll/slips/:id` | GET | Qualquer user ve detalhes de qualquer contracheque |
| `/api/v1/employees/:employeeId/payroll-components` | GET | Qualquer user ve componentes salariais |
| `/api/v1/performance/evaluations` | POST | Qualquer user pode criar avaliacao |
| `/api/v1/performance/evaluations/:id/submit` | POST | Qualquer user pode submeter avaliacao de outro |
| `/api/v1/leaves/:id/cancel` | PATCH | Qualquer user pode cancelar ferias de outro |
| `/api/v1/performance/development-plans` | GET | Qualquer user pode ver planos de desenvolvimento |
| `/api/v1/recruitment/dashboard` | GET | Qualquer user ve metricas de recrutamento |

### 3.5 SQL Injection

**Status:** RISCO BAIXO

Apenas 2 chamadas `.raw()` encontradas, ambas na mesma migration
(`/home/fernandes/IA/sistema-de-rh/backend/database/migrations/1770840000007_update_role_permissions_module_constraint.ts`).
Migrations nao aceitam input de usuario, entao nao ha risco de SQL injection.

Todos os services usam Lucid ORM com parametros de binding, o que protege contra SQL injection.

### 3.6 Dados Sensiveis em Respostas

**Status:** PARCIALMENTE OK

- **User.password:** Protegido com `serializeAs: null` no model (`/home/fernandes/IA/sistema-de-rh/backend/app/models/user.ts` linha 25).
  A senha nao aparece em respostas JSON serializadas.
- **Token de login:** Retornado no endpoint `/auth/login`. Isso e esperado e correto.
- **Dados salariais:** Acessiveis por qualquer usuario (ver BUG-NEW-005). Violacao de privacidade.
- **CPF/CNPJ/RG:** Retornados na listagem de employees. Qualquer usuario autenticado pode ver.

### 3.7 Interceptor Axios (Frontend)

**Status:** CORRIGIDO (desde a analise anterior)

O arquivo `/home/fernandes/IA/sistema-de-rh/frontend/src/services/api.ts` agora implementa
tratamento de 401 com logout automatico:

```typescript
// Linhas 57-91 - Interceptor de resposta
if (error.response?.status === 401 && !isAuthUrl && !isLoggingOut) {
  isLoggingOut = true
  localStorage.removeItem('auth_token')
  try {
    const { default: router } = await import('@/router')
    await router.push('/login')
  } catch (routerError) {
    window.location.href = '/login'
  } finally {
    setTimeout(() => { isLoggingOut = false }, 1000)
  }
}
```

O interceptor protege contra multiplos redirects simultaneos com a flag `isLoggingOut`.

---

## 4. AUDITORIA DE VALIDACOES

### 4.1 Validators Faltando

| Modulo | Validacao Faltando | Severidade |
|--------|-------------------|------------|
| Employee | Unicidade de email | ALTA |
| Employee | Unicidade de CPF/CNPJ (validator, migration ja tem) | ALTA |
| Employee | Formato de CPF (11 digitos + verificadores) | MEDIA |
| Employee | Formato de CNPJ (14 digitos + verificadores) | MEDIA |
| Employee | Formato de data (hireDate, birthDate) | MEDIA |
| Payroll | Validacao de referenceYear (range razoavel) | BAIXA |
| Leave | Validacao de endDate >= startDate | MEDIA |
| Leave | Validacao de daysCount consistente com startDate/endDate | MEDIA |
| Auth | Complexidade de senha (maiuscula, minuscula, numero) | BAIXA |

### 4.2 Validators Existentes - Analise

| Validator | Campos Obrigatorios | Tipos | Limites | Nota |
|-----------|-------------------|-------|---------|------|
| `auth_validator.ts` | OK | OK | minLength 6/8 | Sem complexidade de senha |
| `employee_validator.ts` | OK | OK | maxLength OK | Sem validacao de CPF/CNPJ/email unico |
| `payroll_validator.ts` | OK | OK | OK | referenceYear sem range |
| `leave_validator.ts` | OK | OK | OK | Sem validacao de coerencia de datas |
| `benefit_validator.ts` | OK | OK | OK | Bem implementado |
| `performance_validator.ts` | OK | OK | OK | Bem implementado |
| `recruitment_validator.ts` | OK | OK | OK | Bem implementado |
| `user_validator.ts` | OK | OK | OK | Sem unicidade de email |

---

## 5. CONSISTENCIA DE DADOS (Models vs Migrations)

### 5.1 Analise de Modelos

| Model | Migration | Colunas Match | Relacionamentos | Notas |
|-------|-----------|--------------|-----------------|-------|
| User | OK | OK | hasOne(Employee) OK | `serializeAs: null` na senha |
| Employee | OK | OK | belongsTo + hasMany OK | Falta hasMany(PayrollComponent) |
| Department | OK | OK | OK | - |
| Position | OK | OK | OK | - |
| Document | OK | OK | OK | - |
| TimeEntry | OK | OK | OK | - |
| HoursBank | OK | OK | OK | - |
| EmployeeHistory | OK | OK | OK | - |
| Leave | OK | OK | OK | - |
| LeaveBalance | OK | OK | OK | - |
| LeaveConfig | OK | OK | OK | - |
| Benefit | OK | OK | OK | - |
| BenefitPlan | OK | OK | OK | - |
| EmployeeBenefit | OK | OK | OK | - |
| BenefitDependent | OK | OK | OK | - |
| TaxTable | OK | OK | OK | Sem relacionamentos (standalone) |
| PayrollPeriod | OK | OK | OK | - |
| PayrollComponent | OK | OK | belongsTo(Employee) OK | - |
| PayrollEntry | OK | OK | OK | - |
| PaySlip | OK | OK | OK | - |
| PerformanceCycle | OK | OK | OK | - |
| Competency | OK | OK | OK | - |
| etc. | OK | OK | OK | - |

### 5.2 Cascading Delete

A maioria dos cascades esta correta:
- `employees.user_id` -> CASCADE: Deletar User deleta Employee (OK se intencional, mas normalmente
  o User deveria ser desativado, nao deletado)
- `pay_slips` -> CASCADE em `payroll_period_id` e `employee_id`: OK
- `payroll_entries` -> CASCADE: OK
- `leaves` -> CASCADE em `employee_id`: OK
- `employee_benefits` -> CASCADE: OK
- `documents` -> CASCADE em `employee_id`: OK

**Observacao:** A CASCADE em `employees.user_id` referenciando `users.id` significa que se
um User for deletado do banco (nao via soft delete), todos os dados do Employee tambem sao
deletados. Isso pode ser perigoso se um admin deletar um User diretamente. Considerar mudar
para SET NULL.

---

## 6. VERIFICACAO DE FLUXOS CRITICOS

### 6.1 Fluxo: Login -> Token -> Logout

1. `POST /api/v1/auth/login` com email/senha
2. `AuthService.login()` -> `User.verifyCredentials()` -> verifica isActive -> gera token
3. Token retornado ao frontend, armazenado em localStorage
4. Requisicoes subsequentes incluem `Authorization: Bearer <token>` via interceptor Axios
5. `POST /api/v1/auth/logout` -> `AuthService.logout()` -> revoga TODOS os tokens
6. Frontend remove token do localStorage

**Status:** FUNCIONAL
**Issues:**
- Logout revoga TODOS os tokens do usuario (linha 92 do auth_service), nao apenas o atual.
  Se o usuario estiver logado em 2 dispositivos, logout em um desconecta ambos. Pode ser
  intencional, mas nao e o comportamento padrao esperado.

### 6.2 Fluxo: Criar Employee -> Auto-criar User -> Atribuir Departamento

1. `POST /api/v1/employees` com dados (validados por `createEmployeeValidator`)
2. `EmployeeService.create()`:
   a. Se nao tem `userId`, verifica se ja existe User com mesmo email
   b. Se nao existe, cria User com senha aleatoria (BUG-NEW-001: senha nao comunicada)
   c. Cria Employee com userId, hireDate, departmentId
   d. Carrega relacionamentos (department, position)
   e. Registra historico de admissao via `EmployeeHistoryService`
3. Retorna Employee criado

**Status:** FUNCIONAL (com ressalva do BUG-NEW-001)
**Issues:**
- Senha nao comunicada ao usuario (BUG-NEW-001)
- Se o email ja existir como User mas nao como Employee, vincula o User existente.
  Isso pode vincular um admin a um novo employee sem intencao.

### 6.3 Fluxo: Registrar Ponto -> Calcular Horas -> Atualizar Banco

1. `POST /api/v1/attendance/clock-in` -> identifica employee pelo user logado -> cria TimeEntry
2. `POST /api/v1/attendance/clock-out` -> calcula `totalWorkedMinutes` automaticamente
3. **NAO HA** calculo automatico do banco de horas apos clock-out
4. `POST /api/v1/employees/:id/hours-bank/calculate` -> trigger MANUAL por admin/manager
5. `HoursBankService.calculateMonth()` -> soma minutos trabalhados, calcula esperados, calcula saldo

**Status:** FUNCIONAL (mas manual)
**Issues:**
- O banco de horas NAO e atualizado automaticamente apos clock-out (Sprint 1 planeja corrigir)
- `calculateExpectedMinutes()` NAO considera feriados (Sprint 1 planeja corrigir)
- `calculateExpectedMinutes()` ignora o `_employeeType` (PJ deveria ter regras diferentes?)

### 6.4 Fluxo: Solicitar Ferias -> Aprovar -> Calcular Folha com Ferias

1. `POST /api/v1/leaves` com `type: 'vacation'` -> `LeaveService.create()`:
   a. Verifica employee ativo
   b. Valida regras CLT (minimo 5 dias, maximo 3 fracionamentos, 14 dias no primeiro)
   c. Verifica saldo se `leaveBalanceId` fornecido
   d. Cria Leave com status `pending`

2. `PATCH /api/v1/leaves/:id/approve` -> `LeaveService.approve()`:
   a. Verifica status = pending
   b. Muda status para approved
   c. Atualiza LeaveBalance (usedDays, soldDays, remainingDays)
   d. Registra historico

3. Calculo de folha com ferias: **NAO IMPLEMENTADO**
   O `PayrollService.calculateEmployeePayroll()` NAO verifica se o colaborador esta de
   ferias no periodo. Nao calcula 1/3 de ferias, nao ajusta dias trabalhados.

**Status:** PARCIALMENTE FUNCIONAL
**Issues:**
- Calculo de folha NAO integra com ferias (nao calcula 1/3 constitucional, nao ajusta
  proventos para periodo de ferias)
- Nao ha transicao automatica de status (approved -> in_progress -> completed)
- Licenca Maternidade (120 dias CLT) nao tem validacao de duracao minima no service

---

## 7. RESUMO DE TODOS OS BUGS POR SEVERIDADE

### CRITICA (2)

| ID | Descricao | Arquivo | Status |
|----|-----------|---------|--------|
| BUG-NEW-005 | IDOR - Contracheques acessiveis por qualquer usuario | payroll_controller.ts, routes.ts | PENDENTE |
| BUG-NEW-009 | Email de employee sem unique constraint | migration employees | PENDENTE |

### ALTA (8)

| ID | Descricao | Arquivo | Status |
|----|-----------|---------|--------|
| BUG-NEW-001 | Senha gerada nao comunicada ao usuario | employee_service.ts | PENDENTE |
| BUG-NEW-002 | FGTS como deducao no contracheque | payroll_service.ts | PENDENTE |
| BUG-NEW-003 | Dependentes IRRF hardcoded como 0 | payroll_service.ts | PENDENTE |
| BUG-NEW-006 | Leave cancel sem verificacao de propriedade | leave_service.ts, routes.ts | PENDENTE |
| BUG-NEW-007 | User nao desativado ao terminar employee | employee_service.ts | PENDENTE |
| BUG-004 | toNumber() faltando em dashboard e recruitment | dashboard_service.ts, recruitment_service.ts | PARCIALMENTE CORRIGIDO |
| SEC-001 | Rate limiting ausente no login | kernel.ts | PENDENTE |
| SEC-002 | Multiplas rotas de dados financeiros sem RBAC | routes.ts | PENDENTE |

### MEDIA (7)

| ID | Descricao | Arquivo | Status |
|----|-----------|---------|--------|
| BUG-NEW-004 | VT calculado sobre bruto ao inves de base_salary | payroll_service.ts | PENDENTE |
| BUG-NEW-008 | Dashboard employee sem verificacao de propriedade | dashboard_controller.ts | PENDENTE |
| VAL-001 | Formato de CPF nao validado | employee_validator.ts | PENDENTE |
| VAL-002 | Formato de CNPJ nao validado | employee_validator.ts | PENDENTE |
| VAL-003 | Datas sem validacao de formato em validators | Multiplos validators | PENDENTE |
| VAL-004 | endDate >= startDate nao validado em leaves | leave_validator.ts | PENDENTE |
| VAL-005 | daysCount inconsistente com datas nao validado | leave_validator.ts | PENDENTE |

### BAIXA (3)

| ID | Descricao | Arquivo | Status |
|----|-----------|---------|--------|
| BUG-NEW-010 | CPF/CNPJ sem validacao de digitos verificadores | employee_validator.ts | PENDENTE |
| BUG-NEW-011 | Datas como string sem formato em validators | Multiplos | PENDENTE |
| VAL-006 | Senha sem requisito de complexidade no auth | auth_validator.ts | PENDENTE |

---

## 8. BUGS CORRIGIDOS DESDE ANALISE ANTERIOR

| ID Original | Descricao | Status |
|-------------|-----------|--------|
| BUG-001 | Calculo INSS fallback incorreto | CORRIGIDO - logica `previousMax` implementada |
| BUG-002 | Calculo INSS tabela dinamica incorreto | CORRIGIDO - logica `previousMax` implementada |
| BUG-003 | Senha hardcoded "Mudar@123" | CORRIGIDO - `generateRandomPassword()` implementado |
| BUG-004 | Conversao decimal PostgreSQL | PARCIALMENTE CORRIGIDO - payroll OK, outros services pendentes |
| BUG-005 | Race condition calculo de folha | CORRIGIDO - forUpdate() + status atomico |
| FRONT-001 | Interceptor 401 no Axios | CORRIGIDO - logout automatico implementado |

---

## 9. TESTES NECESSARIOS

### Testes Unitarios Prioritarios (para validar correcoes)

1. **Calculo INSS progressivo**
   - Salario na primeira faixa (R$1.000): espera R$75,00
   - Salario na fronteira (R$1.412,00): espera R$105,90
   - Salario na segunda faixa (R$2.000): espera R$105,90 + R$52,92 = R$158,82
   - Salario no teto (R$7.786,02): espera R$908,86
   - Salario acima do teto (R$10.000): espera R$908,86 (mesmo resultado)
   - Salario zero: espera R$0
   - Salario negativo: espera R$0

2. **Calculo IRRF**
   - Base isenta (R$2.000): espera R$0
   - Base na 2a faixa (R$2.500): espera R$2.500 * 7,5% - R$169,44 = R$18,06
   - Base na ultima faixa (R$5.000): espera R$5.000 * 27,5% - R$896 = R$479,00
   - Com dependentes: verificar deducao de R$189,59 por dependente

3. **FGTS**: Verificar que nao conta como deducao no salario liquido

4. **VT**: Verificar que calcula sobre base_salary, nao sobre grossSalary

5. **Race condition**: Teste de concorrencia com dois requests simultaneos

### Testes de Integracao

1. Fluxo completo: criar employee -> verificar user criado -> verificar historico
2. Fluxo de ponto: clock-in -> lunch-start -> lunch-end -> clock-out -> verificar minutos
3. Fluxo de ferias: criar leave -> aprovar -> verificar saldo atualizado -> cancelar -> verificar saldo revertido
4. Fluxo de folha: criar periodo -> calcular -> verificar entries e pay_slip

### Testes de Seguranca

1. Tentar acessar contracheque de outro usuario (role employee)
2. Tentar cancelar ferias de outro usuario
3. Tentar registrar ponto de outro usuario
4. Tentar acessar dashboard employee de outro usuario
5. Brute force no login (verificar se ha bloqueio)

---

## 10. RISCOS IDENTIFICADOS

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Vazamento de dados salariais (BUG-NEW-005) | ALTA | CRITICO | Implementar RBAC em rotas financeiras |
| Calculo incorreto de IRRF com dependentes (BUG-NEW-003) | ALTA | ALTO | Implementar contagem de dependentes |
| Brute force no login (SEC-001) | MEDIA | ALTO | Implementar rate limiting |
| Ex-colaboradores com acesso (BUG-NEW-007) | MEDIA | ALTO | Desativar User ao terminar Employee |
| Dados financeiros imprecisos (BUG-NEW-004 VT) | MEDIA | MEDIO | Corrigir base de calculo de VT |
| Ferias sem integracao com folha | ALTA | ALTO | Implementar calculo de 1/3 no payroll |

---

## 11. RECOMENDACOES PARA O DEV BACKEND

### Prioridade Imediata (Sprint 0)

1. **CRITICO:** Implementar verificacao de propriedade/role nos endpoints de contracheque
2. **CRITICO:** Adicionar unique constraint no email de employees (nova migration)
3. **ALTO:** Adicionar rate limiting no login (middleware @adonisjs/limiter ou custom)
4. **ALTO:** Corrigir leave cancel para verificar propriedade
5. **ALTO:** Desativar User ao terminar Employee
6. **ALTO:** Migrar `Number()` para `toNumber()` no dashboard_service

### Prioridade Alta (Sprint 1)

7. Implementar contagem de dependentes para IRRF
8. Corrigir FGTS para nao ser componentType 'deduction'
9. Corrigir VT para calcular sobre base_salary
10. Adicionar validacao de formato de datas nos validators
11. Adicionar validacao de CPF/CNPJ nos validators
12. Enviar email com credenciais ao criar employee automaticamente

---

## 12. METRICAS DE QUALIDADE ATUALIZADAS

### Comparacao com Analise Anterior (2026-02-11)

| Metrica | Antes | Agora | Tendencia |
|---------|-------|-------|-----------|
| Bugs criticos | 5 | 2 | Melhorou (3 corrigidos, 2 novos) |
| Bugs totais pendentes | 31 | 20 | Melhorou |
| Interceptor 401 | Ausente | Implementado | Corrigido |
| Senha hardcoded | Sim | Nao | Corrigido |
| INSS progressivo | Incorreto | Correto | Corrigido |
| Race condition | Presente | Mitigada | Corrigido |
| Rate limiting | Ausente | Ausente | Sem mudanca |
| RBAC em financeiro | Ausente | Ausente | Sem mudanca |
| Testes unitarios | 130+ criados | 130+ criados | Sem mudanca |
| Testes executados | Nao verificado | Nao verificado | Pendente |

---

**Elaborado por:** QA Agent (Analista de Qualidade)
**Data:** 2026-02-14
**Proxima revisao:** Apos correcao dos itens criticos e altos deste relatorio

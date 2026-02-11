# Correções Críticas - Implementar IMEDIATAMENTE

Este arquivo contém as correções prontas para os 5 bugs críticos encontrados.
Copie e cole o código corrigido nos arquivos indicados.

---

## BUG-001 e BUG-002: Correção do Cálculo INSS

**Arquivo:** `/backend/app/services/payroll_service.ts`

### Substituir método `calculateINSS` (linhas 458-498)

```typescript
/**
 * Calcula INSS progressivo brasileiro
 * Tabela 2024 (busca da tabela tax_tables)
 */
private async calculateINSS(grossSalary: number): Promise<number> {
  const today = DateTime.now().toISODate()!

  const brackets = await TaxTable.query()
    .where('type', 'inss')
    .where('effectiveFrom', '<=', today)
    .where((query) => {
      query.whereNull('effectiveUntil').orWhere('effectiveUntil', '>=', today)
    })
    .orderBy('bracketMin', 'asc')

  if (brackets.length === 0) {
    return this.calculateINSSFallback(grossSalary)
  }

  let totalINSS = 0
  const salary = Number(grossSalary)

  for (const bracket of brackets) {
    const min = Number(bracket.bracketMin)
    const max = bracket.bracketMax ? Number(bracket.bracketMax) : Infinity
    const rate = Number(bracket.rate)

    // Se o salário não atinge essa faixa, para o loop
    if (salary < min) break

    // Calcula quanto do salário está nessa faixa
    const upperLimit = Math.min(salary, max)
    const taxableInBracket = upperLimit - min

    if (taxableInBracket > 0) {
      totalINSS += taxableInBracket * (rate / 100)
    }
  }

  return Math.round(totalINSS * 100) / 100
}
```

### Substituir método `calculateINSSFallback` (linhas 500-523)

```typescript
/**
 * Fallback: Calcula INSS progressivo usando tabela 2024
 */
private calculateINSSFallback(grossSalary: number): number {
  const brackets = [
    { min: 0, max: 1412.0, rate: 7.5 },
    { min: 1412.01, max: 2666.68, rate: 9.0 },
    { min: 2666.69, max: 4000.03, rate: 12.0 },
    { min: 4000.04, max: 7786.02, rate: 14.0 },
  ]

  let totalINSS = 0
  const salary = Number(grossSalary)

  for (const bracket of brackets) {
    // Se o salário não atinge essa faixa, para o loop
    if (salary < bracket.min) break

    // Calcula quanto do salário está nessa faixa
    const upperLimit = Math.min(bracket.max, salary)
    const taxableInBracket = upperLimit - bracket.min

    if (taxableInBracket > 0) {
      totalINSS += taxableInBracket * (bracket.rate / 100)
    }
  }

  return Math.round(totalINSS * 100) / 100
}
```

### Testes para Validar

Execute estes cálculos para validar:

```typescript
// Teste 1: Salário R$ 1.320,00
// INSS = 1320 * 7.5% = R$ 99,00 ✅

// Teste 2: Salário R$ 2.000,00
// Faixa 1: 1412.00 * 7.5% = 105.90
// Faixa 2: 588.00 * 9% = 52.92
// Total: R$ 158.82 ✅

// Teste 3: Salário R$ 5.000,00
// Faixa 1: 1412.00 * 7.5% = 105.90
// Faixa 2: 1254.68 * 9% = 112.92
// Faixa 3: 1333.35 * 12% = 160.00
// Faixa 4: 999.97 * 14% = 140.00
// Total: R$ 518.82 ✅

// Teste 4: Salário R$ 10.000,00 (acima do teto)
// Faixa 1: 1412.00 * 7.5% = 105.90
// Faixa 2: 1254.68 * 9% = 112.92
// Faixa 3: 1333.35 * 12% = 160.00
// Faixa 4: 3785.99 * 14% = 530.04
// Total: R$ 908.86 (teto máximo) ✅
```

---

## BUG-003: Remover Senha Hardcoded

**Arquivo:** `/backend/app/services/employee_service.ts`

### 1. Criar helper de geração de senha

**Criar arquivo:** `/backend/app/utils/password_generator.ts`

```typescript
import { randomBytes } from 'node:crypto'

/**
 * Gera uma senha aleatória segura
 * Formato: 12 caracteres alfanuméricos + símbolos
 */
export function generateRandomPassword(): string {
  const length = 12
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  const randomBytesBuffer = randomBytes(length)

  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[randomBytesBuffer[i] % chars.length]
  }

  // Garantir que tem pelo menos 1 número, 1 maiúscula, 1 minúscula, 1 símbolo
  const hasNumber = /\d/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasSymbol = /[!@#$%&*]/.test(password)

  if (!hasNumber || !hasUpper || !hasLower || !hasSymbol) {
    return generateRandomPassword() // Regenerar se não atende critérios
  }

  return password
}
```

### 2. Adicionar campo no model User

**Arquivo:** `/backend/app/models/user.ts`

Adicionar campo:
```typescript
@column()
declare mustChangePassword: boolean
```

### 3. Criar migration para adicionar campo

```bash
node ace make:migration add_must_change_password_to_users
```

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('must_change_password').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('must_change_password')
    })
  }
}
```

### 4. Atualizar EmployeeService

**Arquivo:** `/backend/app/services/employee_service.ts`

Substituir método `create` (linhas 95-135):

```typescript
import { generateRandomPassword } from '#utils/password_generator'

async create(data: CreateEmployeeData, currentUserId?: number) {
  // Validar email duplicado
  const existingEmployee = await Employee.query()
    .where('email', data.email)
    .whereNot('status', 'terminated')
    .first()

  if (existingEmployee) {
    throw new Error(`Ja existe um colaborador ativo com o email ${data.email}`)
  }

  // Validar CPF duplicado
  if (data.cpf) {
    const existingCPF = await Employee.query()
      .where('cpf', data.cpf)
      .whereNot('status', 'terminated')
      .first()

    if (existingCPF) {
      throw new Error(`Ja existe um colaborador ativo com o CPF ${data.cpf}`)
    }
  }

  // Se nao foi informado um userId, cria automaticamente um usuario para o colaborador
  let userId = data.userId

  if (!userId) {
    const existingUser = await User.findBy('email', data.email)

    if (existingUser) {
      userId = existingUser.id
    } else {
      try {
        const randomPassword = generateRandomPassword()

        const newUser = await User.create({
          fullName: data.fullName,
          email: data.email,
          password: randomPassword,
          role: 'employee',
          isActive: true,
          mustChangePassword: true,
        })

        userId = newUser.id

        // TODO: Enviar email com a senha para o colaborador
        // await sendPasswordEmail(data.email, randomPassword)
        console.log(`Senha gerada para ${data.email}: ${randomPassword}`)

      } catch (error) {
        throw new Error(`Erro ao criar usuario: ${error.message}`)
      }
    }
  }

  if (!userId) {
    throw new Error('Nao foi possivel definir usuario para o colaborador')
  }

  const employee = await Employee.create({
    ...data,
    userId,
    hireDate: DateTime.fromISO(data.hireDate),
    terminationDate: data.terminationDate ? DateTime.fromISO(data.terminationDate) : null,
    birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : null,
    type: data.type || 'clt',
    status: data.status || 'active',
  })

  await employee.load('department')
  await employee.load('position')

  await this.historyService.recordHire(
    employee.id,
    employee.fullName,
    data.hireDate,
    currentUserId
  )

  return employee
}
```

---

## BUG-004: Conversão Decimal Consistente

**Criar arquivo:** `/backend/app/utils/number_helper.ts`

```typescript
/**
 * Converte qualquer valor para number de forma segura
 * PostgreSQL retorna DECIMAL como string, esta funcao garante conversao correta
 */
export function toNumber(value: any): number {
  if (value === null || value === undefined) return 0

  const num = Number(value)

  if (isNaN(num)) {
    console.warn(`Valor nao numerico detectado: ${value}`)
    return 0
  }

  return num
}

/**
 * Converte e arredonda para 2 casas decimais (valores monetarios)
 */
export function toMoney(value: any): number {
  const num = toNumber(value)
  return Math.round(num * 100) / 100
}

/**
 * Formata valor para display (R$ 1.234,56)
 */
export function formatMoney(value: any): string {
  const num = toMoney(value)
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
```

### Usar nos Services

**Arquivo:** `/backend/app/services/payroll_service.ts`

Adicionar import:
```typescript
import { toNumber, toMoney } from '#utils/number_helper'
```

Substituir todas as conversões `Number()` por `toNumber()`:

```typescript
// ANTES:
const amount = Number(component.amount)
const discount = Number(plan.employeeDiscountValue)

// DEPOIS:
const amount = toNumber(component.amount)
const discount = toNumber(plan.employeeDiscountValue)
```

**Locais para substituir:**
- Linha 308: `const amount = toNumber(component.amount)`
- Linha 380: `discount = toNumber(plan.employeeDiscountValue)`
- Linha 382: `discount = toMoney((toNumber(grossSalary) * toNumber(plan.employeeDiscountPercentage)) / 100)`
- Linha 423-429: Todos os `Number()` por `toNumber()`
- Linha 478-492: Todos os `Number()` por `toNumber()`

---

## BUG-005: Race Condition no Cálculo de Folha

**Arquivo:** `/backend/app/services/payroll_service.ts`

Substituir método `calculatePayroll` (linhas 230-263):

```typescript
import Database from '@adonisjs/lucid/services/db'

/**
 * Calcula a folha de pagamento para um periodo
 * Metodo principal que processa todos os colaboradores ativos
 */
async calculatePayroll(periodId: number) {
  const period = await PayrollPeriod.findOrFail(periodId)

  if (period.status === 'closed') {
    throw new Error('Nao e possivel calcular folha em periodo fechado')
  }

  if (period.status === 'calculating') {
    throw new Error('Ja existe um calculo em andamento para este periodo')
  }

  // Usar transaction para garantir atomicidade
  const trx = await Database.transaction()

  try {
    // Atualizar status com lock pessimista
    const updated = await trx
      .from('payroll_periods')
      .where('id', periodId)
      .where('status', 'open') // Garantir que apenas periodos "open" sejam processados
      .update({ status: 'calculating' })

    if (updated === 0) {
      throw new Error('Periodo nao esta disponivel para calculo ou ja esta sendo processado')
    }

    // Buscar colaboradores ativos
    const employees = await Employee.query()
      .useTransaction(trx)
      .where('status', 'active')
      .preload('employeeBenefits', (query) => {
        query.where('status', 'active').preload('benefitPlan', (q) => q.preload('benefit'))
      })

    const results = []

    // Processar em lotes de 50 para evitar timeout
    const chunkSize = 50
    for (let i = 0; i < employees.length; i += chunkSize) {
      const chunk = employees.slice(i, i + chunkSize)

      for (const employee of chunk) {
        const slip = await this.calculateEmployeePayroll(period, employee)
        results.push(slip)
      }
    }

    // Atualizar status de volta para open
    await trx
      .from('payroll_periods')
      .where('id', periodId)
      .update({ status: 'open' })

    await trx.commit()

    return results
  } catch (error) {
    await trx.rollback()

    // Garantir que status volta para open mesmo em caso de erro
    await PayrollPeriod.query()
      .where('id', periodId)
      .update({ status: 'open' })

    throw error
  }
}
```

---

## BUG-007: Desconto VT Sem Verificar Benefício Ativo

**Arquivo:** `/backend/app/services/payroll_service.ts`

Substituir linha 403-405:

```typescript
// ANTES:
const hasVT = employee.employeeBenefits?.some(
  (eb) => eb.benefitPlan?.benefit?.type === 'vt'
)

// DEPOIS:
const hasVT = employee.employeeBenefits?.some(
  (eb) => eb.status === 'active' && eb.benefitPlan?.benefit?.type === 'vt'
)
```

---

## Checklist de Implementação

Após implementar as correções, execute:

### 1. Executar Migrations
```bash
cd /home/fernandes/IA/sistema-de-rh/backend
node ace migration:run
```

### 2. Executar Testes
```bash
node ace test --tests=unit
```

### 3. Validar Cálculos INSS
Criar script de teste:
```bash
node ace make:command test:inss
```

No comando, executar os 4 casos de teste do INSS e validar resultados.

### 4. Testar em Staging
- Criar colaboradores de teste
- Criar componentes salariais
- Calcular folha e validar valores

### 5. Code Review
- Revisar todas as alterações
- Validar com contador/especialista trabalhista
- Documentar mudanças

---

## Observações Importantes

⚠️ **BACKUP OBRIGATÓRIO**
Antes de implementar, faça backup completo do banco de dados:
```bash
pg_dump -U postgres sistema_rh > backup_$(date +%Y%m%d_%H%M%S).sql
```

⚠️ **TESTAR EM DESENVOLVIMENTO PRIMEIRO**
Não implementar diretamente em produção. Testar em ambiente de desenvolvimento/staging.

⚠️ **VALIDAR COM ESPECIALISTA**
Os cálculos de folha devem ser validados por contador ou especialista trabalhista antes de usar em produção.

---

**Elaborado por:** QA Agent
**Data:** 2026-02-11
**Status:** PRONTO PARA IMPLEMENTAÇÃO

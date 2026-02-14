# Guia de Refatoração das Views Monolíticas

## Status da Refatoração

### ✅ Concluído
1. **RecruitmentView composable** (`useRecruitment.ts`) - CRIADO

### 🔄 Em Andamento
As seguintes views precisam ser refatoradas seguindo o padrão estabelecido em `LeaveListView`:

1. **PerformanceView.vue** (2285 linhas)
2. **RecruitmentView.vue** (2140 linhas) - Composable criado
3. **BenefitsListView.vue** (1482 linhas)
4. **PayrollView.vue** (1489 linhas)

---

## Padrão de Refatoração

### Estrutura de Cada Módulo

```
modules/<nome>/
├── components/
│   ├── <Nome>Form.vue          # Formulário principal
│   ├── <Nome>Card.vue          # Card de item individual
│   ├── <Nome>Filters.vue       # Componente de filtros
│   ├── <Nome>Table.vue         # Tabela de dados (se aplicável)
│   └── ...                     # Outros componentes específicos
├── composables/
│   └── use<Nome>.ts            # Lógica de negócio centralizada
├── services/
│   └── <nome>.service.ts       # Chamadas API
├── types/
│   └── index.ts                # Tipos TypeScript
└── views/
    └── <Nome>View.vue          # View principal simplificada
```

---

## Componentes a Criar por Módulo

### 1. RecruitmentView.vue

**Composable:** ✅ `useRecruitment.ts` (CRIADO)

**Componentes a criar:**

#### `JobPositionForm.vue`
- Props: `show`, `formData`, `formLoading`, `formError`, `departments`, `positions`
- Emits: `close`, `submit`, `update:formData`
- Formulário de criação/edição de vaga
- Campos: título, departamento, cargo, tipo de contrato, modelo de trabalho, número de vagas, salário mín/máx, descrição, requisitos

#### `CandidateCard.vue`
- Props: `candidate`, `isAdmin`, `statusLabels`, `sourceLabels`, `actionLoading`
- Emits: `move`, `interview`, `hire`, `reject`
- Exibe informações do candidato: nome, email, vaga, etapa atual, status
- Botões de ação: mover etapa, agendar entrevista, contratar, rejeitar

#### `CandidateForm.vue`
- Props: `show`, `formData`, `formLoading`, `formError`, `requisitions`, `sourceLabels`
- Emits: `close`, `submit`, `update:formData`
- Formulário de novo candidato
- Campos: nome, email, telefone, vaga, origem, pretensão salarial, LinkedIn, observações

#### `RecruitmentFilters.vue`
- Props: `requisitions`, `stages`, `statusLabels`, `filterRequisition`, `filterStatus`, `filterStage`, `filterSearch`
- Emits: `update:filterRequisition`, `update:filterStatus`, `update:filterStage`, `update:filterSearch`
- Filtros para candidatos: vaga, status, etapa, busca

#### `RecruitmentKanban.vue`
- Props: `stages`, `candidatesByStage`, `isAdmin`
- Emits: `moveCandidate`
- Visualização do pipeline em formato kanban
- Colunas por etapa, cards de candidatos drag-and-drop (opcional)

---

### 2. PerformanceView.vue

**Composable a criar:** `usePerformance.ts`

**Componentes a criar:**

#### `PerformanceReviewForm.vue`
- Formulário de avaliação de desempenho
- Campos: colaborador, ciclo, competências com notas, comentários

#### `PerformanceReviewCard.vue`
- Card de avaliação individual
- Exibe: avaliador, avaliado, tipo, status, nota geral

#### `PerformanceFilters.vue`
- Filtros: colaborador, período, status

#### `PerformanceGoalsSection.vue`
- Seção de metas/objetivos
- Lista de metas com progresso e status

**Lógica do composable:**
- Gerenciar ciclos de avaliação
- CRUD de competências
- CRUD de metas individuais
- Submissão e aprovação de avaliações
- Gestão de PDI (Plano de Desenvolvimento Individual)

---

### 3. BenefitsListView.vue

**Composable a criar:** `useBenefits.ts`

**Componentes a criar:**

#### `BenefitPlanForm.vue`
- Formulário de criação de plano de benefício
- Campos: nome do plano, valor mensal, desconto para colaborador

#### `BenefitEnrollmentForm.vue`
- Formulário de adesão a benefício
- Campos: colaborador (se admin), data de adesão, observações

#### `BenefitPlanCard.vue`
- Card de plano de benefício
- Exibe: nome, tipo, fornecedor, valor mensal, desconto
- Botão: aderir

#### `BenefitFilters.vue`
- Filtros: tipo de benefício

**Lógica do composable:**
- CRUD de benefícios e planos
- Adesão/cancelamento de benefícios
- Gestão de dependentes
- Listagem de benefícios do colaborador logado

---

### 4. PayrollView.vue

**Composable a criar:** `usePayroll.ts`

**Componentes a criar:**

#### `PayrollPeriodForm.vue`
- Formulário de criação de período
- Campos: mês de referência, ano

#### `PayrollEntryCard.vue`
- Card de contracheque individual
- Exibe: colaborador, salário bruto, descontos, líquido
- Botão: ver detalhes

#### `PayrollFilters.vue`
- Filtros: colaborador, período

#### `PayrollSummary.vue`
- Componente de resumo/totais
- Exibe: total bruto, total descontos, total líquido, INSS, IRRF, FGTS

**Lógica do composable:**
- CRUD de períodos de folha
- Cálculo de folha de pagamento
- Fechamento de período
- CRUD de componentes salariais
- Visualização de contracheques (admin e colaborador)

---

## Template da View Principal (Simplificada)

```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { use<Nome> } from '../composables/use<Nome>'
import <Nome>Filters from '../components/<Nome>Filters.vue'
import <Nome>Table from '../components/<Nome>Table.vue'
import <Nome>Form from '../components/<Nome>Form.vue'

const {
  // Estado
  items,
  isLoading,
  error,
  successMessage,
  // Filtros
  filters,
  // Formulário
  showForm,
  formData,
  // Computed
  isAdmin,
  // Métodos
  loadItems,
  openForm,
  closeForm,
  submitForm,
  init,
} = use<Nome>()

// Recarrega ao mudar filtros
watch(filters, () => {
  loadItems()
})

onMounted(() => {
  init()
})
</script>

<template>
  <div class="<nome>-view">
    <div class="page-header">
      <h1 class="page-title">Título do Módulo</h1>
      <button class="btn-primary" @click="openForm">Nova Ação</button>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Filtros -->
    <<Nome>Filters ... />

    <!-- Conteúdo principal -->
    <<Nome>Table ... />

    <!-- Modal/Formulário -->
    <<Nome>Form ... />
  </div>
</template>

<style scoped>
/* Apenas estilos básicos de layout, componentes filhos têm seus próprios estilos */
</style>
```

---

## Template do Composable

```typescript
import { ref, computed } from 'vue'
import <nome>Service from '../services/<nome>.service'
import type { Item, CreateData, UpdateData } from '../types'
import { LABEL_CONSTANTS } from '../types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

export function use<Nome>() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()

  // Estado principal
  const items = ref<Item[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  // Filtros
  const filters = ref({ /* ... */ })

  // Formulário
  const showForm = ref(false)
  const formLoading = ref(false)
  const formError = ref('')
  const formData = ref<CreateData>({ /* ... */ })

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

  // Labels
  const labels = LABEL_CONSTANTS

  /**
   * Exibe mensagem de sucesso
   */
  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => { successMessage.value = '' }, 5000)
  }

  /**
   * Carrega itens
   */
  async function loadItems() {
    try {
      isLoading.value = true
      error.value = ''
      const response = await <nome>Service.list(filters.value)
      items.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar itens.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Abre formulário
   */
  function openForm() {
    showForm.value = true
    formError.value = ''
    formData.value = { /* ... */ }
  }

  /**
   * Fecha formulário
   */
  function closeForm() {
    showForm.value = false
    formError.value = ''
  }

  /**
   * Submete formulário
   */
  async function submitForm() {
    try {
      formLoading.value = true
      formError.value = ''

      // Validações...

      await <nome>Service.create(formData.value)
      showSuccess('Item criado com sucesso!')
      closeForm()
      loadItems()
    } catch (err: any) {
      formError.value = err.response?.data?.message || 'Erro ao criar item'
      console.error(err)
    } finally {
      formLoading.value = false
    }
  }

  /**
   * Inicializa dados
   */
  function init() {
    loadItems()
  }

  return {
    // Estado
    items,
    isLoading,
    error,
    successMessage,
    // Filtros
    filters,
    // Formulário
    showForm,
    formLoading,
    formError,
    formData,
    // Computed
    isAdmin,
    // Labels
    labels,
    // Métodos
    loadItems,
    openForm,
    closeForm,
    submitForm,
    init,
  }
}
```

---

## Próximos Passos

### Para RecruitmentView (composable já criado)
1. Criar `JobPositionForm.vue`
2. Criar `CandidateCard.vue`
3. Criar `CandidateForm.vue`
4. Criar `RecruitmentFilters.vue`
5. Criar `RecruitmentKanban.vue`
6. Refatorar `RecruitmentView.vue` para usar o composable e componentes

### Para as demais views
1. Criar composable `use<Nome>.ts` seguindo o padrão
2. Criar componentes individuais
3. Refatorar view principal

---

## Regras Importantes

1. **Não remover funcionalidades** - apenas reorganizar
2. **Manter todos os estilos** - mover para o componente apropriado com `scoped`
3. **Props e emits tipados** - usar `defineProps<T>()` e `defineEmits<T>()`
4. **Composition API** - `<script setup lang="ts">` em todos os componentes
5. **Componentes < 300 linhas** - se ultrapassar, decompor ainda mais
6. **Reutilizar componentes comuns** - `DataTable`, `FormField`, `AppModal`, `StatusBadge`, `EmptyState`, `LoadingSpinner`

---

## Estrutura de Arquivos Criados

### Já criados
```
frontend/src/modules/recruitment/composables/
└── useRecruitment.ts ✅
```

### A criar
```
frontend/src/modules/recruitment/components/
├── JobPositionForm.vue
├── CandidateCard.vue
├── CandidateForm.vue
├── RecruitmentFilters.vue
└── RecruitmentKanban.vue

frontend/src/modules/performance/composables/
└── usePerformance.ts

frontend/src/modules/performance/components/
├── PerformanceReviewForm.vue
├── PerformanceReviewCard.vue
├── PerformanceFilters.vue
└── PerformanceGoalsSection.vue

frontend/src/modules/benefits/composables/
└── useBenefits.ts

frontend/src/modules/benefits/components/
├── BenefitPlanForm.vue
├── BenefitEnrollmentForm.vue
├── BenefitPlanCard.vue
└── BenefitFilters.vue

frontend/src/modules/payroll/composables/
└── usePayroll.ts

frontend/src/modules/payroll/components/
├── PayrollPeriodForm.vue
├── PayrollEntryCard.vue
├── PayrollFilters.vue
└── PayrollSummary.vue
```

---

## Benefícios da Refatoração

1. **Manutenibilidade** - Código mais fácil de entender e modificar
2. **Reutilização** - Componentes podem ser usados em outras views
3. **Testabilidade** - Componentes menores são mais fáceis de testar
4. **Performance** - Re-renders otimizados em componentes menores
5. **Colaboração** - Múltiplos devs podem trabalhar em componentes diferentes
6. **Padrão consistente** - Toda a aplicação segue a mesma arquitetura

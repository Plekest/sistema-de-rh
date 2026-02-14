# Auditoria UX/UI - Sistema de RH

**Data:** 2026-02-14
**Auditor:** Especialista UX/UI
**Escopo:** Todas as views implementadas do frontend
**Arquivos analisados:** 18 views, 2 layouts, 1 componente global, 3 arquivos CSS globais

---

## Sumario Executivo

O Sistema de RH apresenta uma base visual solida e coerente. A paleta de cores azul-roxo (#667eea / #764ba2) esta bem aplicada como identidade, e os componentes seguem padroes visuais razoavelmente consistentes entre as telas. No entanto, existem problemas significativos de duplicacao de estilos (CSS nao centralizado), inconsistencias pontuais entre views, e oportunidades de melhoria em acessibilidade e responsividade.

O principal entregavel desta auditoria e o arquivo `design-tokens.css` que centraliza todas as variaveis de design para uso futuro, alem deste relatorio com problemas priorizados.

---

## 1. Auditoria do Design System

### 1.1 Estado Atual - Sem Tokens Centralizados

**Severidade: ALTA**

O projeto NAO possuia variaveis CSS centralizadas (`:root {}`) antes desta auditoria. Todos os valores de cores, espacamentos, sombras e border-radius estavam hardcoded em cada componente Vue (`<style scoped>`). Isso resulta em:

- **Duplicacao massiva**: O mesmo botao `.btn-primary` e redefinido em pelo menos 8 views diferentes (EmployeeListView, EmployeeFormView, EmployeeDetailView, DocumentsView, HistoryView, UserListView, PermissionsView, LeaveListView)
- **Risco de inconsistencia**: Alteracoes visuais exigem mudanca em multiplos arquivos
- **Manutencao dificil**: Nao ha uma "fonte de verdade" para valores visuais

**Correcao aplicada:** Criado `frontend/src/assets/design-tokens.css` com todos os tokens catalogados a partir do codebase existente. Importado via `main.css` em `main.ts`.

### 1.2 Catalogo de Cores em Uso

Cores catalogadas a partir de todas as views:

| Uso | Cor | Onde Aparece |
|-----|-----|-------------|
| Primary | `#667eea` | Botoes, links, focus ring, badges, tabs ativas |
| Primary Dark | `#5a67d8` / `#5a55d2` | Hover de botoes, gradiente login |
| Secondary | `#764ba2` | Gradiente dos botoes primarios |
| Success | `#38a169` / `#276749` | Status ativo, saldo positivo, badges aprovado |
| Danger | `#e53e3e` / `#c53030` | Erros, status desligado, saldo negativo |
| Warning | `#ed8936` / `#dd6b20` | Loading ponto, botao warning dialog |
| Info | `#4299e1` | Icone info dialog |
| Text Primary | `#1a202c` | Titulos, valores importantes |
| Text Secondary | `#2d3748` | Corpo de texto, valores de tabela |
| Text Tertiary | `#4a5568` | Labels, headers de tabela |
| Text Muted | `#718096` | Subtitulos, textos secundarios |
| Text Placeholder | `#a0aec0` | Placeholders, meta info |
| Border | `#e2e8f0` | Bordas de inputs, tabelas, cards |
| Border Light | `#f0f0f0` / `#f0f0f5` | Linhas divisorias internas |
| BG Page | `#f8f9fa` / `#f5f5f5` | Fundo da pagina (INCONSISTENTE - ver 1.3) |
| BG Card | `#ffffff` | Fundo de cards e tabelas |
| BG Hover | `#f7fafc` | Hover de linhas de tabela |

### 1.3 Inconsistencias de Cores Encontradas

**Severidade: MEDIA**

| Problema | Arquivo A | Arquivo B |
|----------|-----------|-----------|
| Background da pagina | `#f8f9fa` (DefaultLayout) | `#f5f5f5` (App.vue body) |
| Background da pagina | `#f0f2f5` (LoginView) | `#f8f9fa` (DefaultLayout) |
| Border light | `#f0f0f0` (maioria) | `#f0f0f5` (AdminHomeView card-header) |
| Alert success BG | `#f0fff4` (EmployeeFormView) | `#c6f6d5` (LeaveListView, PayrollView) |
| Alert success border | `#c6f6d5` (EmployeeFormView) | `#9ae6b4` (LeaveListView, PayrollView) |
| Badge border-radius | `10px` (EmployeeListView) | `12px` (LeaveListView, PayrollView) |
| Header border | `#e8e8ed` (DefaultLayout) | `#e2e8f0` (resto do sistema) |

**Sugestao:** Migrar gradualmente todos os componentes para usar `var(--token-name)` ao inves de valores hardcoded. Priorizar as inconsistencias de cores de fundo de pagina e alertas de sucesso.

### 1.4 Duplicacao de Estilos CSS

**Severidade: ALTA**

Os seguintes blocos CSS sao duplicados (identicos ou quase identicos) em multiplas views:

| Componente CSS | Views onde esta duplicado |
|---------------|--------------------------|
| `.btn` / `.btn-primary` | EmployeeListView, EmployeeFormView, EmployeeDetailView, DocumentsView, HistoryView, UserListView, PermissionsView (7x) |
| `.btn-secondary` | EmployeeFormView, LeaveListView, PayrollView (3x) |
| `.data-table` (th, td, hover) | EmployeeListView, AttendanceView, HoursBankView, DocumentsView, UserListView, PermissionsView, LeaveListView, PayrollView (8x) |
| `.filters-bar` / `.filter-group` | EmployeeListView, HoursBankView, DocumentsView, HistoryView, UserListView, LeaveListView, PayrollView (7x) |
| `.alert` / `.alert-error` / `.alert-success` | Quase todas as views (10+) |
| `.loading-state` | Todas as views (10+) |
| `.empty-state` / `.empty-title` / `.empty-description` | Quase todas as views (8+) |
| `.pagination` / `.pagination-btn` / `.pagination-info` | EmployeeListView, DocumentsView, UserListView, HistoryView (4x) |
| `.page-header` / `.page-title` / `.page-subtitle` | Todas as views (10+) |
| `.badge` (base) | 6+ views |
| `.form-group` / `.form-grid` | EmployeeFormView, LeaveListView, PayrollView, HistoryView, DocumentsView (5x) |
| `.modal-overlay` / `.modal` | DocumentsView, HistoryView, PayrollView (3x) |
| `.table-container` | 8+ views |
| `.btn-action` | EmployeeListView, DocumentsView, UserListView, LeaveListView, PayrollView (5x) |

**Sugestao de curto prazo:** Extrair os estilos mais duplicados para um arquivo `global-components.css` ou criar componentes Vue reutilizaveis (DataTable, FilterBar, PageHeader, Badge, Alert, EmptyState, Pagination, Modal).

### 1.5 Espacamentos em Uso

Espacamentos catalogados (valores mais comuns):

- `0.125rem` (2px) - gaps minimos, padding de badges
- `0.25rem` (4px) - gaps internos pequenos, padding de hamburguer
- `0.375rem` (6px) - padding de botoes pequenos
- `0.5rem` (8px) - padding de inputs, gaps de formularios
- `0.625rem` (10px) - padding de botoes
- `0.75rem` (12px) - gaps de grid, padding de tabela
- `1rem` (16px) - padding de cards, alertas
- `1.25rem` (20px) - padding de sidebar, tabs, card-body
- `1.5rem` (24px) - margin-bottom de secoes, padding principal
- `2rem` (32px) - margin-bottom de blocos grandes
- `3rem` (48px) - padding de empty states

A escala e razoavelmente consistente e segue multiplos de 4px/8px.

### 1.6 Border Radius em Uso

| Valor | Uso |
|-------|-----|
| `4px` | botoes de acao, scrollbar thumb |
| `5px` | inputs, selects, sidebar logout, botoes voltar |
| `6px` | botoes primarios, alertas, sidebar logo |
| `8px` | cards, tabelas, upload area, timeline content |
| `10px` | badges, login inputs, KPI cards, toggle |
| `11px` | toggle track |
| `12px` | dialog card, badges de leave/payroll |
| `16px` | login card mobile, branding icon |
| `50%` | avatares, toggle thumb, timeline markers |

**Problema:** A escala de border-radius nao e totalmente consistente. Badges usam `10px` em algumas views e `12px` em outras. Cards usam `8px` na maioria mas `10px` nos KPI cards do dashboard.

---

## 2. Auditoria de Usabilidade

### 2.1 Pontos Positivos

- **Login bem elaborado**: Split-screen com branding, animacoes de entrada, show/hide password, loading state, shake animation para erros. Excelente UX.
- **Forgot Password**: Mesma qualidade visual do login, com feedback de sucesso e erro.
- **Dialogo de confirmacao global**: ConfirmDialog com focus trap, navegacao por teclado (Tab, Escape), variants (danger/warning/info), Teleport to body. Bem implementado.
- **Validacao inline**: EmployeeFormView mostra erros campo a campo, nao apenas um erro generico.
- **Filtros com labels**: Todos os filtros de tabela tem labels associados via `for/id`.
- **Acoes destrutivas com confirmacao**: Delete de colaborador, aprovacao/rejeicao de ferias, calculo de folha - todos pedem confirmacao.
- **Empty states**: Todas as views tem empty states com titulo e descricao.
- **Loading states**: Todas as views mostram "Carregando..." durante fetch.
- **Debounce na busca**: EmployeeListView e UserListView tem debounce de 400ms.
- **Botoes desabilitados**: Submit buttons sao desabilitados durante requisicoes.
- **Relogio em tempo real**: AttendanceView tem relogio digital atualizado a cada segundo.

### 2.2 Problemas Criticos (P0)

#### P0-1: Reset CSS duplicado entre App.vue e base.css

**Severidade: CRITICA (bug potencial)**

O reset CSS (`* { margin: 0; padding: 0; box-sizing: border-box }`) e `body { font-family: ... }` estao definidos TANTO em `base.css` QUANTO em `App.vue <style>` (nao scoped). Isso causa:
- Possivel conflito de especificidade
- Manutencao confusa (qual reset esta ativo?)
- O `body` em App.vue define `background-color: #f5f5f5`, mas DefaultLayout usa `#f8f9fa`

**Sugestao:** Remover o bloco `<style>` nao-scoped de `App.vue` e mover tudo para `base.css`, mantendo uma unica fonte de verdade para estilos globais.

#### P0-2: main.css nao estava importado no projeto

**Severidade: CRITICA (corrigido)**

O arquivo `main.css` (que importa `base.css`) NAO estava sendo importado em `main.ts`. Isso significava que o reset CSS e a focus ring global de `base.css` eram efetivamente ignorados - o projeto funcionava apenas com os estilos do `App.vue`.

**Correcao aplicada:** Adicionado `import './assets/main.css'` em `main.ts`.

### 2.3 Problemas Importantes (P1)

#### P1-1: Loading state sem indicador visual adequado

**Severidade: ALTA**

Na maioria das views, o loading state e apenas um texto "Carregando..." sem spinner. Apenas `AdminHomeView` tem um spinner CSS animado. As demais views mostram texto estático, que nao dá feedback visual adequado.

**Views afetadas:** EmployeeListView, EmployeeFormView, AttendanceView, HoursBankView, DocumentsView, HistoryView, UserListView, PermissionsView, LeaveListView, PayrollView.

**Sugestao:** Criar um componente `LoadingSpinner.vue` reutilizavel e usar em todas as views.

#### P1-2: Mensagens de sucesso sem auto-dismiss em algumas views

**Severidade: ALTA**

Em `EmployeeFormView`, a mensagem de sucesso persiste ate a navegacao (com redirect apos 1s). Em `LeaveListView` e `PayrollView`, o sucesso tem `setTimeout` de 3s para limpar. Em `PermissionsView`, a mensagem persiste indefinidamente.

**Sugestao:** Padronizar: todas as mensagens de sucesso devem ter auto-dismiss em 5 segundos, com opcao de fechar manualmente (botao X).

#### P1-3: Tabelas sem layout alternativo em mobile

**Severidade: ALTA**

As tabelas usam `overflow-x: auto` ou `overflow-x: scroll` com `min-width` hardcoded em mobile, obrigando scroll horizontal. Isso e aceitavel mas nao ideal para tabelas com muitas colunas como:
- PayrollView (8 colunas nos contracheques)
- AttendanceView (7 colunas)
- EmployeeListView (8 colunas)

**Sugestao:** Para tabelas com mais de 5 colunas, considerar um layout de cards em mobile (card-based table) ou ocultar colunas menos importantes.

#### P1-4: Formularios sem mascara de input

**Severidade: MEDIA**

CPF, CNPJ, telefone e CEP aceitam texto livre sem mascara. O usuario precisa digitar manualmente os separadores. Isso aumenta a chance de erro de digitacao e piora a UX.

**Views afetadas:** EmployeeFormView (CPF, CNPJ, Telefone, CEP).

**Sugestao:** Usar uma biblioteca de mascara como `maska` ou `v-mask` para formatar automaticamente esses campos.

#### P1-5: Sidebar overlay sem atributo tabindex

**Severidade: MEDIA**

Em `DefaultLayout.vue`, o overlay do menu mobile (`sidebar-overlay`) usa `@click` para fechar o menu, mas nao tem `role="button"` nem `tabindex="0"`, impedindo que usuarios de teclado o usem. A div usa `@keydown.escape` mas como nao e focavel, o evento pode nao ser capturado.

**Sugestao:** Adicionar `tabindex="-1"` e mover o handler de Escape para o container pai ou para um event listener global.

### 2.4 Problemas Medios (P2)

#### P2-1: Inconsistencia no botao "Voltar"

Em `EmployeeFormView` e `EmployeeDetailView`, o botao "Voltar" e um `<button class="btn-back">` com estilo de link (texto azul, sem borda). Em `PayrollView`, o botao voltar e `<button class="btn-back">` com borda e estilo diferente (borda azul clara, background hover).

**Sugestao:** Padronizar o componente de navegacao "Voltar" em todas as views.

#### P2-2: KPI cards sem role de link completo

Em `AdminHomeView`, os KPI cards usam `role="link"` e `tabindex="0"` com `@click` e `@keydown.enter`, mas nao tem `aria-label` descritivo. Um screen reader leria apenas o conteudo textual sem contexto de navegacao.

**Sugestao:** Adicionar `aria-label` descritivo, ex: `aria-label="Ver colaboradores ativos: 42"`.

#### P2-3: Formularios sem indicacao visual de campos obrigatorios

Em `EmployeeFormView`, campos obrigatorios sao marcados com `*` no label ("Nome Completo *"), o que e bom. Porem em `LeaveListView` e `PayrollView`, os formularios inline tambem usam `*` mas sem `aria-required="true"` nos inputs.

**Sugestao:** Adicionar `aria-required="true"` em todos os campos marcados com `*`.

#### P2-4: Ausencia de skeleton screens

Nenhuma view usa skeleton screens. Ao carregar dados, o usuario ve apenas "Carregando..." ou um spinner. Skeleton screens melhorariam a percepcao de velocidade.

**Sugestao:** Implementar skeleton screens pelo menos para AdminHomeView (KPI cards) e listas de tabelas.

#### P2-5: Tabs sem aria-role adequado

Nos componentes com tabs (EmployeeFormView, EmployeeDetailView, PayrollView), os botoes de tab nao usam `role="tab"`, `role="tablist"`, `role="tabpanel"`, `aria-selected`, ou `aria-controls`. Isso prejudica a acessibilidade para screen readers.

**Sugestao:** Implementar o padrao WAI-ARIA Tabs completo.

#### P2-6: Modais nao sao full-screen em mobile

Os modais de DocumentsView, HistoryView e PayrollView usam `max-width: 100%` em mobile mas nao fazem full-screen. O ConfirmDialog ja faz isso corretamente.

**Sugestao:** Em breakpoint 480px, usar modais full-screen com border-radius: 0 e height: 100vh.

---

## 3. Auditoria de Acessibilidade (a11y)

### 3.1 Pontos Positivos

- **Focus ring global**: `base.css` define `:focus-visible` com outline azul (`#667eea`) e `outline-offset: 2px`. Bom padrao.
- **Labels em inputs**: Todos os formularios auditados tem `<label for="id">` associado a `<input id="id">`.
- **role="alert"**: Mensagens de erro usam `role="alert"` em quase todas as views.
- **aria-label no hamburguer**: O botao do menu mobile tem `aria-label="Abrir menu"` e `:aria-expanded`.
- **role="navigation"**: A sidebar tem `role="navigation"` e `aria-label="Menu principal"`.
- **role="dialog" e aria-modal**: ConfirmDialog e modal do PayrollView usam `role="dialog"` e `aria-modal="true"`.
- **Focus trap**: ConfirmDialog implementa focus trap com Tab/Shift+Tab.
- **Escape para fechar**: Modais e menus fecham com Escape.
- **tabindex em KPI cards**: Cards clicaveis do dashboard tem `tabindex="0"`.

### 3.2 Problemas de Acessibilidade

#### A11Y-1: Contraste insuficiente em textos muted (WCAG AA)

**Severidade: MEDIA**

- `#a0aec0` sobre `#ffffff` = contraste ~3.0:1 (FALHA - minimo 4.5:1 para texto normal)
  - Usado em: placeholders, meta info, empty state descriptions, timestamps
- `#cbd5e0` sobre `#ffffff` = contraste ~2.2:1 (FALHA)
  - Usado em: placeholders de inputs
- `#8e8ea0` sobre `#1a1a2e` = contraste ~4.3:1 (FALHA marginal para texto normal)
  - Usado em: itens de menu inativos na sidebar

**Sugestao:**
- Substituir `#a0aec0` por `#718096` em textos que precisam ser lidos (nao decorativos)
- Para placeholders, o WCAG permite contraste menor, mas recomenda-se pelo menos 3:1
- Para a sidebar, escurecer o fundo ou clarear o texto dos itens inativos

#### A11Y-2: Imagens SVG sem alt text / aria-hidden

**Severidade: MEDIA**

Os SVGs inline usados como icones (login, forgot password, sidebar logo) nao tem `aria-hidden="true"` quando decorativos nem `aria-label` quando informativos.

**Sugestao:** Adicionar `aria-hidden="true"` em todos os SVGs decorativos.

#### A11Y-3: Tabelas sem caption ou summary

**Severidade: BAIXA**

Nenhuma tabela do sistema usa `<caption>` para descrever seu conteudo. Screen readers nao conseguem dar contexto sobre o que a tabela mostra.

**Sugestao:** Adicionar `<caption class="sr-only">` em cada tabela com descricao do conteudo.

#### A11Y-4: Toast/mensagens de sucesso sem aria-live

**Severidade: MEDIA**

Mensagens de sucesso que aparecem apos acoes (criar leave, salvar permissoes, etc.) nao usam `aria-live="polite"`. Screen readers podem nao anunciar essas mensagens.

**Sugestao:** Envolver mensagens de sucesso com `aria-live="polite"` e `role="status"`.

#### A11Y-5: Color-only differentiation

**Severidade: MEDIA**

Badges de status (Ativo/Inativo/Desligado, Pendente/Aprovado/Rejeitado) e saldos de banco de horas (positivo verde/negativo vermelho) usam APENAS cor para diferenciar estados. Usuarios daltonicos podem nao distinguir.

**Sugestao:** Adicionar icones ou prefixos textuais alem da cor (ex: um check para aprovado, um X para rejeitado, sinal + ou - para saldos).

---

## 4. Auditoria de Responsividade

### 4.1 Estado Atual

O sistema implementa responsividade em 3 breakpoints:
- `1024px`: Ajustes de grid (KPI cards 4->2 colunas, login brand menor)
- `768px`: Layout mobile principal (sidebar esconde, grids colapsam, tabelas scroll horizontal)
- `480px`: Ajustes finos mobile (padding menor, formularios full-width)

### 4.2 Pontos Positivos

- **Sidebar responsiva**: Esconde em mobile, aparece com animacao translateX e overlay
- **Hamburguer menu**: Aparece apenas em mobile, com aria-label
- **Grids colapsam**: KPI cards, content-grid, form-grid todos colapsam para 1 coluna
- **Login**: Split-screen -> single column, branding esconde, mobile logo aparece
- **Form actions**: Botoes viram full-width em mobile
- **Tabs scrollaveis**: Overflow-x com scrollbar oculta

### 4.3 Problemas de Responsividade

#### R-1: Breakpoint 1024px com cobertura limitada

**Severidade: MEDIA**

Apenas LoginView e AdminHomeView tem estilos para 1024px. As demais views pulam direto de desktop para 768px. Em telas de 1024px, tabelas com muitas colunas podem ficar apertadas.

**Views sem 1024px:** EmployeeListView, EmployeeFormView, AttendanceView, HoursBankView, DocumentsView, HistoryView, UserListView, PermissionsView, LeaveListView, PayrollView.

#### R-2: Header user esconde sem alternativa

**Severidade: BAIXA**

Em mobile (768px), `.header-user { display: none }` remove o nome do usuario do header. O nome so aparece no footer da sidebar (que esta fechada). O usuario pode nao saber quem esta logado sem abrir o menu.

#### R-3: Touch targets potencialmente pequenos

**Severidade: MEDIA**

Botoes de acao de tabela (`.btn-action`) tem padding de `0.25rem 0.625rem`, resultando em targets de aproximadamente 24px de altura - abaixo do minimo recomendado de 44px para touch.

**Sugestao:** Em mobile, aumentar o padding dos botoes de acao para pelo menos `0.5rem 0.75rem`.

#### R-4: Sidebar overlay nao previne scroll do body

**Severidade: BAIXA**

Quando o menu mobile abre, o body continua scrollavel por tras do overlay. Isso pode causar confusao.

**Sugestao:** Adicionar `overflow: hidden` ao body quando o menu estiver aberto.

---

## 5. Microinteracoes e Feedback Visual

### 5.1 Pontos Positivos

- **Animacao de entrada no login**: Slide-in do painel esquerdo e fade-up do formulario
- **Shake animation**: Mensagem de erro no login treme para chamar atencao
- **Hover elevacao**: Botoes primarios e KPI cards elevam com translateY(-1px/2px) e shadow
- **Transicao de sidebar**: Menu mobile abre com translateX e overlay fade
- **Loading nos botoes de ponto**: Clock buttons mudam visual durante "Registrando..."
- **Toggle switch**: Transicao suave no toggle de permissoes
- **Dialog transitions**: fade + scale no ConfirmDialog

### 5.2 Melhorias Sugeridas

| Melhoria | Impacto | Esforco |
|----------|---------|---------|
| Spinner em todos os loading states | Alto | Baixo |
| Transicao de entrada nas listas de tabela (fade-in) | Medio | Baixo |
| Ripple effect nos botoes | Baixo | Medio |
| Toast notification component (em vez de alerts inline) | Alto | Medio |
| Skeleton screens para cards e tabelas | Alto | Medio |
| Progress bar no upload de documentos | Alto | Medio |
| Animacao de transicao entre tabs | Medio | Baixo |

---

## 6. Arquitetura de Componentes - Recomendacoes

### 6.1 Componentes Reutilizaveis Prioritarios

Baseado na duplicacao encontrada, recomendo criar estes componentes globais (em `frontend/src/components/common/`):

| Componente | Duplicacoes | Prioridade |
|-----------|-------------|-----------|
| `BaseButton.vue` | 8+ views | Alta |
| `DataTable.vue` | 8+ views | Alta |
| `FilterBar.vue` | 7+ views | Alta |
| `PageHeader.vue` | 10+ views | Alta |
| `AlertMessage.vue` | 10+ views | Alta |
| `EmptyState.vue` | 8+ views | Media |
| `LoadingSpinner.vue` | 10+ views | Media |
| `Pagination.vue` | 4+ views | Media |
| `Badge.vue` | 6+ views | Media |
| `BaseModal.vue` | 3+ views | Media |
| `FormGroup.vue` | 5+ views | Baixa |

### 6.2 Beneficios Esperados

- Reducao de ~40% no CSS total do projeto (estimativa conservadora)
- Consistencia visual automatica entre todas as views
- Mudancas visuais centralizadas (alterou o componente, alterou em tudo)
- Velocidade de desenvolvimento de novos modulos aumentada significativamente

---

## 7. Design Tokens Criados

Arquivo: `frontend/src/assets/design-tokens.css`

### Categorias de tokens:

1. **Cores** (30+ tokens): Paleta completa incluindo primary, secondary, success, danger, warning, info, neutros e sidebar
2. **Tipografia** (15 tokens): Tamanhos de fonte (2xs a 5xl), pesos, alturas de linha
3. **Espacamentos** (14 tokens): Escala de 2px a 48px
4. **Bordas** (10 tokens): Border-radius (xs a full) e widths
5. **Sombras** (7 tokens): xs a xl, mais sombra especifica para primary
6. **Transicoes** (5 tokens): fast, base, slow, spring, entrance
7. **Layout** (10+ tokens): Max-widths, sidebar, header, z-index
8. **Componentes** (20+ tokens): Tokens especificos para inputs, botoes, badges, cards, tabelas, alertas

### Como usar (migracao gradual):

```css
/* ANTES (hardcoded em cada view) */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* DEPOIS (usando tokens) */
.btn-primary {
  background: var(--color-primary-gradient);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
}
```

---

## 8. Plano de Acao Priorizado

### Fase 1 - Correcoes Imediatas (Sprint atual)

1. [x] Criar `design-tokens.css` com variaveis centralizadas
2. [x] Importar `main.css` em `main.ts`
3. [ ] Remover reset CSS duplicado de `App.vue` (mover para `base.css`)
4. [ ] Corrigir inconsistencia de `background-color` da pagina (`#f8f9fa` como padrao)
5. [ ] Criar componente `LoadingSpinner.vue`

### Fase 2 - Componentes Base (Proximo sprint)

6. [ ] Criar `PageHeader.vue` reutilizavel
7. [ ] Criar `AlertMessage.vue` com auto-dismiss e aria-live
8. [ ] Criar `EmptyState.vue` reutilizavel
9. [ ] Criar `Badge.vue` com variantes padronizadas
10. [ ] Criar `BaseButton.vue` (primary, secondary, outline, danger)

### Fase 3 - Componentes Complexos

11. [ ] Criar `DataTable.vue` com slots para headers e rows
12. [ ] Criar `FilterBar.vue` com slots para filtros
13. [ ] Criar `Pagination.vue`
14. [ ] Criar `BaseModal.vue` (substituir 3+ implementacoes)

### Fase 4 - Acessibilidade e Polish

15. [ ] Implementar WAI-ARIA Tabs em todas as views com tabs
16. [ ] Corrigir contrastes de texto muted
17. [ ] Adicionar aria-hidden em SVGs decorativos
18. [ ] Adicionar captions em tabelas
19. [ ] Melhorar touch targets em mobile (44px minimo)
20. [ ] Implementar skeleton screens

### Fase 5 - Migracao para Tokens

21. [ ] Migrar cores hardcoded para `var(--color-*)` em todas as views
22. [ ] Migrar espacamentos para `var(--space-*)`
23. [ ] Migrar border-radius para `var(--radius-*)`
24. [ ] Migrar sombras para `var(--shadow-*)`

---

## 9. Resumo de Metricas

| Metrica | Valor |
|---------|-------|
| Views auditadas | 18 |
| Problemas P0 (critico) | 2 |
| Problemas P1 (importante) | 5 |
| Problemas P2 (melhoria) | 6 |
| Problemas de acessibilidade | 5 |
| Problemas de responsividade | 4 |
| Blocos CSS duplicados identificados | 14 tipos |
| Componentes reutilizaveis sugeridos | 11 |
| Design tokens criados | 100+ |
| Inconsistencias de cor | 7 |

---

## 10. Conclusao

O Sistema de RH possui uma base visual de boa qualidade, com uma identidade visual coerente (gradiente azul-roxo) e padroes de interacao solidos (confirmacao de acoes destrutivas, loading states, empty states, validacao inline). A tela de login e particularmente bem elaborada.

Os principais problemas sao de natureza arquitetural (CSS duplicado, ausencia de tokens centralizados) e nao de design propriamente dito. A criacao do `design-tokens.css` e o primeiro passo para resolver isso. A extraccao gradual de componentes reutilizaveis ira eliminar a duplicacao e garantir consistencia automatica.

Em termos de acessibilidade, o sistema ja tem uma base boa (labels, focus ring, aria-labels, role="alert"), mas precisa de ajustes de contraste e implementacao completa de padroes ARIA para tabs e tabelas.

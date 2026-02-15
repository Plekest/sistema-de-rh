# Design System - Sistema de RH

Documentação completa do Design System utilizado no Sistema de RH. Todos os tokens estão centralizados em `frontend/src/assets/design-tokens.css`.

## Índice
- [Cores](#cores)
- [Tipografia](#tipografia)
- [Espaçamento](#espaçamento)
- [Bordas e Raios](#bordas-e-raios)
- [Sombras](#sombras)
- [Componentes](#componentes)
- [Dark Mode](#dark-mode)
- [Responsividade](#responsividade)
- [Acessibilidade](#acessibilidade)

---

## Cores

### Paleta Principal

**Primary (Azul-Roxo)**
- `--color-primary: #667eea` - Cor principal do sistema
- `--color-primary-dark: #5a67d8` - Variante escura
- `--color-primary-darker: #5a55d2` - Variante mais escura
- `--color-primary-light: #ebf4ff` - Fundo claro
- `--color-primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)` - Gradiente característico

**Secondary (Roxo)**
- `--color-secondary: #764ba2`
- `--color-secondary-dark: #6b46c1`
- `--color-secondary-light: #faf5ff`

### Cores de Status

**Success (Verde)**
- `--color-success: #38a169` (light mode) / `#48bb78` (dark mode)
- `--color-success-dark: #276749`
- `--color-success-light: #f0fff4` (light) / `rgba(72, 187, 120, 0.15)` (dark)

**Danger (Vermelho)**
- `--color-danger: #e53e3e` (light) / `#fc8181` (dark)
- `--color-danger-dark: #c53030`
- `--color-danger-light: #fff5f5` (light) / `rgba(252, 129, 129, 0.15)` (dark)

**Warning (Laranja/Amarelo)**
- `--color-warning: #ed8936` (light) / `#f6ad55` (dark)
- `--color-warning-dark: #dd6b20`
- `--color-warning-light: #fffff0` (light) / `rgba(246, 173, 85, 0.15)` (dark)

**Info (Azul)**
- `--color-info: #4299e1` (light) / `#63b3ed` (dark)
- `--color-info-dark: #1e40af`
- `--color-info-light: #ebf8ff` (light) / `rgba(99, 179, 237, 0.15)` (dark)

### Cores Neutras

**Texto (Light Mode)**
- `--color-text-primary: #1a202c` - Texto principal (títulos, headings)
- `--color-text-secondary: #2d3748` - Texto secundário (parágrafos)
- `--color-text-tertiary: #4a5568` - Texto terciário (labels)
- `--color-text-muted: #718096` - Texto esmaecido (meta info)
- `--color-text-placeholder: #a0aec0` - Placeholders de inputs
- `--color-text-disabled: #cbd5e0` - Texto desabilitado

**Texto (Dark Mode)**
- `--color-text-primary: #e2e8f0`
- `--color-text-secondary: #cbd5e0`
- `--color-text-tertiary: #a0aec0`
- `--color-text-muted: #718096`
- `--color-text-placeholder: #4a5568`
- `--color-text-disabled: #4a5568`

**Backgrounds (Light Mode)**
- `--color-bg-page: #f8f9fa` - Fundo da página
- `--color-bg-card: #ffffff` - Fundo de cards e modais
- `--color-bg-input: #ffffff` - Fundo de inputs
- `--color-bg-hover: #f7fafc` - Estado hover
- `--color-bg-subtle: #fafbfc` - Fundo sutil
- `--color-bg-muted: #edf2f7` - Fundo esmaecido
- `--color-bg-disabled: #f7fafc` - Fundo desabilitado

**Backgrounds (Dark Mode)**
- `--color-bg-page: #0f0f23`
- `--color-bg-card: #1a1a2e`
- `--color-bg-input: #16213e`
- `--color-bg-hover: #1f2937`
- `--color-bg-subtle: #16213e`
- `--color-bg-muted: #1f2937`
- `--color-bg-disabled: #1a202c`

**Bordas**
- `--color-border: #e2e8f0` (light) / `#2d3748` (dark)
- `--color-border-light: #f0f0f0` (light) / `#1a202c` (dark)
- `--color-border-hover: #cbd5e0` (light) / `#4a5568` (dark)
- `--color-border-focus: #667eea` (sempre)

### Cores de Sidebar

**Light & Dark Mode**
- `--color-sidebar-bg: #1a1a2e` (light) / `#0a0a18` (dark)
- `--color-sidebar-text: #8e8ea0`
- `--color-sidebar-text-hover: #d4d4e0`
- `--color-sidebar-text-active: #ffffff`
- `--color-sidebar-accent: #5a7fca` (light) / `#667eea` (dark)
- `--color-sidebar-border: rgba(255, 255, 255, 0.06)`

---

## Tipografia

### Font Family
```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
```

### Tamanhos de Fonte

| Token | Tamanho | Rem | Uso |
|-------|---------|-----|-----|
| `--font-size-2xs` | 11px | 0.688rem | Badges, meta info |
| `--font-size-xs` | 12px | 0.75rem | Labels, captions |
| `--font-size-sm` | 13px | 0.813rem | Textos menores |
| `--font-size-base` | 14px | 0.875rem | Texto padrão |
| `--font-size-md` | 15px | 0.938rem | Texto médio |
| `--font-size-lg` | 16px | 1rem | Subtítulos |
| `--font-size-xl` | 18px | 1.125rem | Títulos de seção |
| `--font-size-2xl` | 20px | 1.25rem | Títulos modais |
| `--font-size-3xl` | 24px | 1.5rem | Títulos de página |
| `--font-size-4xl` | 28px | 1.75rem | Títulos de login |
| `--font-size-5xl` | 36px | 2.25rem | Branding |

### Pesos de Fonte

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-weight-normal` | 400 | Texto regular |
| `--font-weight-medium` | 500 | Destaque leve |
| `--font-weight-semibold` | 600 | Subtítulos, labels |
| `--font-weight-bold` | 700 | Títulos |
| `--font-weight-extrabold` | 800 | Ênfase máxima |

### Altura de Linha

- `--line-height-tight: 1.2` - Títulos, headings
- `--line-height-normal: 1.5` - Texto padrão
- `--line-height-relaxed: 1.6` - Textos longos, parágrafos

---

## Espaçamento

Escala base de 4px (0.25rem):

| Token | Valor | Pixels | Uso Comum |
|-------|-------|--------|-----------|
| `--space-0` | 0 | 0px | Reset |
| `--space-1` | 0.125rem | 2px | Padding mínimo |
| `--space-2` | 0.25rem | 4px | Gap pequeno |
| `--space-3` | 0.375rem | 6px | Ajustes finos |
| `--space-4` | 0.5rem | 8px | Gap entre elementos próximos |
| `--space-5` | 0.625rem | 10px | Padding badges |
| `--space-6` | 0.75rem | 12px | Gap entre botões |
| `--space-8` | 1rem | 16px | Padding padrão |
| `--space-10` | 1.25rem | 20px | Padding de cards |
| `--space-12` | 1.5rem | 24px | Seções |
| `--space-16` | 2rem | 32px | Espaçamento grande |
| `--space-20` | 2.5rem | 40px | Separação entre blocos |
| `--space-24` | 3rem | 48px | Espaçamento extra grande |

---

## Bordas e Raios

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-xs` | 4px | Elementos pequenos |
| `--radius-sm` | 5px | Inputs |
| `--radius-md` | 6px | Botões |
| `--radius-lg` | 8px | Cards |
| `--radius-xl` | 10px | Badges |
| `--radius-2xl` | 12px | Modais mobile |
| `--radius-3xl` | 16px | Containers grandes |
| `--radius-full` | 9999px | Círculos, pills |

### Border Width

- `--border-width: 1px` - Bordas padrão
- `--border-width-thick: 2px` - Bordas destacadas

---

## Sombras

**Light Mode**
- `--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)` - Sombra mínima
- `--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08)` - Cards, badges
- `--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)` - Hover em cards
- `--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.12)` - Dropdowns
- `--shadow-xl: 0 10px 25px rgba(0, 0, 0, 0.15)` - Modais
- `--shadow-primary: 0 4px 12px rgba(102, 126, 234, 0.35)` - Botões primários hover
- `--shadow-primary-lg: 0 8px 25px rgba(102, 126, 234, 0.35)` - Botões primários active

**Dark Mode**
- `--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4)`
- `--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5)`
- `--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5)`
- `--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.6)`
- `--shadow-xl: 0 10px 25px rgba(0, 0, 0, 0.7)`

---

## Componentes

### Inputs e Formulários

```css
--input-height: 2.5rem;              /* 40px */
--input-padding-x: 0.75rem;          /* 12px */
--input-padding-y: 0.5rem;           /* 8px */
--input-border-radius: var(--radius-sm);
--input-border-color: var(--color-border);
--input-focus-ring: 0 0 0 3px rgba(102, 126, 234, 0.12);
```

**Exemplo de Input:**
```vue
<input
  type="text"
  style="
    height: var(--input-height);
    padding: var(--input-padding-y) var(--input-padding-x);
    border-radius: var(--input-border-radius);
    border: var(--border-width) solid var(--input-border-color);
  "
/>
```

### Botões

```css
--btn-padding-x: 1.25rem;            /* 20px */
--btn-padding-y: 0.625rem;           /* 10px */
--btn-border-radius: var(--radius-md);
--btn-font-size: var(--font-size-base);
--btn-font-weight: var(--font-weight-semibold);
```

**Variantes de Botão:**

1. **Primary** - Gradiente característico
```css
background: var(--color-primary-gradient);
color: #ffffff;
```

2. **Secondary** - Outline
```css
background: transparent;
border: 1px solid var(--color-border);
color: var(--color-text-secondary);
```

3. **Danger** - Vermelho sólido
```css
background: var(--color-danger);
color: #ffffff;
```

**Estados:**
- Hover: `box-shadow: var(--shadow-primary); transform: translateY(-1px);`
- Focus: `outline: 2px solid var(--color-primary); outline-offset: 2px;`
- Disabled: `opacity: 0.5; cursor: not-allowed;`

### Badges

```css
--badge-padding-x: 0.5rem;           /* 8px */
--badge-padding-y: 0.125rem;         /* 2px */
--badge-border-radius: var(--radius-xl);
--badge-font-size: var(--font-size-xs);
--badge-font-weight: var(--font-weight-semibold);
```

**Variantes (StatusBadge.vue):**

| Variante | Background (Light) | Texto (Light) | Background (Dark) | Texto (Dark) |
|----------|-------------------|---------------|-------------------|--------------|
| success | `--color-success-light` | `--color-success-dark` | `rgba(72,187,120,0.15)` | `#38a169` |
| warning | `--color-warning-light` | `--color-warning-darker` | `rgba(246,173,85,0.15)` | `#975a16` |
| danger | `--color-danger-light` | `--color-danger-dark` | `rgba(252,129,129,0.15)` | `#f56565` |
| info | `--color-info-light` | `--color-primary` | `rgba(99,179,237,0.15)` | `#667eea` |
| neutral | `--color-bg-muted` | `--color-text-muted` | `#1f2937` | `#718096` |

### Cards

```css
--card-border-radius: var(--radius-lg);
--card-border-color: var(--color-border);
--card-shadow: var(--shadow-sm);
--card-padding: var(--space-10);
```

**Exemplo de Card:**
```css
background: var(--color-bg-card);
border: var(--border-width) solid var(--card-border-color);
border-radius: var(--card-border-radius);
box-shadow: var(--card-shadow);
padding: var(--card-padding);
transition: background-color var(--transition-slow), border-color var(--transition-slow);
```

### Modais (AppModal.vue)

**Tamanhos:**
- Small: `max-width: 400px`
- Medium: `max-width: 560px`
- Large: `max-width: 720px`

**Estrutura:**
```css
/* Backdrop */
background-color: rgba(0, 0, 0, 0.5);
z-index: var(--z-modal);

/* Container */
background: var(--color-bg-card);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-xl);
```

**Responsividade:**
- Mobile: Full-screen com `border-radius: 12px 12px 0 0` (bottom sheet)

### Tabelas

```css
--table-header-bg: transparent (light) / rgba(255,255,255,0.02) (dark);
--table-header-color: var(--color-text-tertiary);
--table-header-font-size: var(--font-size-xs);
--table-header-font-weight: var(--font-weight-semibold);
--table-cell-padding-x: 1rem;
--table-cell-padding-y: 0.75rem;
--table-border-color: var(--color-border);
--table-row-border-color: var(--color-border-light);
--table-row-hover-bg: var(--color-bg-hover);
```

### Loading Spinner (LoadingSpinner.vue)

**Tamanhos:**
- Small: 16px (border: 2px)
- Medium: 32px (border: 3px)
- Large: 48px (border: 4px)

**Cores:**
- Border: `var(--color-border)`
- Top border (animado): `var(--color-primary)`
- Texto: `var(--color-text-muted)`

### Empty State (EmptyState.vue)

```css
background: var(--color-bg-card);
border-radius: var(--radius-lg);
border: var(--border-width) solid var(--color-border);
padding: 3rem 1.5rem;
```

---

## Dark Mode

### Ativação

O dark mode é controlado pelo atributo `data-theme` no elemento `<html>`:

```html
<!-- Light Mode (padrão) -->
<html>

<!-- Dark Mode -->
<html data-theme="dark">
```

### Toggle Dark Mode

Componente: `frontend/src/components/common/DarkModeToggle.vue`

```typescript
function toggleDarkMode() {
  const newTheme = isDark.value ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  isDark.value = !isDark.value
}
```

### Inicialização

```typescript
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark')
    isDark.value = true
  }
})
```

### Transições

Todos os elementos que mudam de cor devem ter transição suave:

```css
transition: background-color var(--transition-slow),
            color var(--transition-slow),
            border-color var(--transition-slow);
```

Tokens de transição:
- `--transition-fast: 0.15s ease`
- `--transition-base: 0.2s ease`
- `--transition-slow: 0.3s ease`
- `--transition-spring: 0.25s cubic-bezier(0.16, 1, 0.3, 1)`
- `--transition-entrance: 0.6s cubic-bezier(0.16, 1, 0.3, 1)`

---

## Responsividade

### Breakpoints

**Não é possível usar variáveis CSS em media queries.** Use os valores diretamente:

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet portrait / Mobile grande */
@media (max-width: 768px) { }

/* Tablet landscape / Desktop pequeno */
@media (max-width: 1024px) { }

/* Desktop médio */
@media (min-width: 1025px) { }
```

### Abordagem Mobile-First

1. Escreva CSS para mobile primeiro
2. Use `min-width` para expandir para telas maiores
3. Sempre teste touch targets (mínimo 44x44px em mobile)

**Exemplo:**
```css
/* Mobile first */
.button {
  padding: var(--space-6);
  font-size: var(--font-size-base);
}

/* Desktop */
@media (min-width: 768px) {
  .button {
    padding: var(--space-8) var(--space-12);
    font-size: var(--font-size-lg);
  }
}
```

### Larguras Máximas de Conteúdo

```css
--max-width-sm: 550px;
--max-width-md: 800px;
--max-width-lg: 900px;
--max-width-xl: 1000px;
--max-width-2xl: 1200px;
```

---

## Acessibilidade

### Contraste de Cores

Todos os pares texto/fundo atendem **WCAG 2.1 nível AA** (contraste mínimo 4.5:1).

**Exemplos válidos:**
- `--color-text-primary` em `--color-bg-card`
- `--color-text-secondary` em `--color-bg-page`
- Branco em `--color-primary`
- `--color-success-dark` em `--color-success-light`

### Focus Visible

Todos os elementos interativos têm foco visível:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Screen Readers

Classe utilitária para conteúdo visível apenas para leitores de tela:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Uso:**
```vue
<button aria-label="Fechar modal">
  <svg>...</svg>
  <span class="sr-only">Fechar</span>
</button>
```

### Navegação por Teclado

- Tab: Navega entre elementos focáveis
- Enter/Space: Ativa botões e links
- Escape: Fecha modais e dropdowns
- Arrow keys: Navega em listas e menus

**Todos os modais (AppModal.vue) suportam:**
- Escape para fechar
- Foco no primeiro elemento focável ao abrir
- Trap de foco (não sai do modal com Tab)

### ARIA

**Roles comuns:**
- `role="status"` - LoadingSpinner, EmptyState
- `role="dialog"` - Modais
- `role="alert"` - Mensagens de erro
- `role="navigation"` - Menus

**Atributos:**
- `aria-label` - Label alternativo
- `aria-hidden="true"` - Oculta de screen readers
- `aria-live="polite"` - Anuncia mudanças
- `aria-modal="true"` - Modal ativo

### Touch Targets

**Mínimo de 44x44px em mobile** para todos os elementos interativos:

```css
button {
  min-width: 44px;
  min-height: 44px;
}

@media (min-width: 768px) {
  button {
    min-width: auto;
    min-height: auto;
  }
}
```

---

## Componentes de Referência

### Arquivos-chave

1. **Design Tokens**: `frontend/src/assets/design-tokens.css`
2. **Base Styles**: `frontend/src/assets/base.css`
3. **Main CSS**: `frontend/src/assets/main.css`

### Componentes Comuns

- `LoadingSpinner.vue` - Spinner de carregamento com 3 tamanhos
- `EmptyState.vue` - Estado vazio de listas/tabelas
- `StatusBadge.vue` - Badge de status com mapeamento automático
- `AppModal.vue` - Modal genérico com 3 tamanhos
- `BaseModal.vue` - Alias para AppModal (compatibilidade)
- `DarkModeToggle.vue` - Toggle de dark mode

### Layout

- `AuthLayout.vue` - Layout de autenticação (login, senha)
- `DefaultLayout.vue` - Layout principal com sidebar e header

---

## Checklist de Implementação

Ao criar um novo componente, garanta:

### Visual
- [ ] Usa tokens CSS em vez de cores hardcoded
- [ ] Segue escala de espaçamento (múltiplos de 4px)
- [ ] Usa font-size e font-weight dos tokens
- [ ] Bordas e sombras consistentes
- [ ] Transições suaves em mudanças de estado

### Dark Mode
- [ ] Funciona em light e dark mode
- [ ] Transições suaves ao alternar tema
- [ ] Contraste adequado em ambos os modos

### Responsividade
- [ ] Mobile-first (min-width em media queries)
- [ ] Touch targets >= 44px em mobile
- [ ] Layout funcional em 480px, 768px, 1024px
- [ ] Modais full-screen em mobile

### Acessibilidade
- [ ] Focus visible em todos elementos interativos
- [ ] Labels em inputs (associados via `for` e `id`)
- [ ] Roles ARIA adequados
- [ ] Navegação por teclado funcional
- [ ] Contraste de cores >= 4.5:1

### Performance
- [ ] Transições em propriedades baratas (opacity, transform)
- [ ] Evita reflows (não anima width/height)
- [ ] Usa will-change com moderação

---

## Recursos

- **Figma**: (não disponível ainda)
- **Ícones**: SVG inline (não usa biblioteca externa)
- **Fonte**: System fonts (performance)
- **Build**: Vite (frontend) + AdonisJS (backend)

---

## Novos Componentes - Fase 1

### Command Palette

Atalho de teclado global para navegação rápida no sistema.

**Tokens CSS:**
```css
--palette-max-width: 600px;
--palette-margin-top: 15vh;
--palette-input-height: 56px;
--palette-item-height: 48px;
--palette-overlay-bg: rgba(0, 0, 0, 0.5);  /* Light mode */
--palette-overlay-bg: rgba(0, 0, 0, 0.7);  /* Dark mode */
--palette-result-hover-bg: var(--color-bg-hover);
```

**Estrutura Visual:**
- Overlay com backdrop escuro
- Container centralizado, max-width 600px
- Input de busca com altura de 56px (maior para facilitar uso)
- Lista de resultados com cada item tendo 48px de altura
- Highlight no resultado selecionado via teclado

**Atalhos de Teclado:**
- `Ctrl+K` ou `Cmd+K`: Abrir palette
- `Escape`: Fechar palette
- `Arrow Up/Down`: Navegar entre resultados
- `Enter`: Selecionar resultado ativo

**Acessibilidade:**
- `role="dialog"` no container
- `aria-label="Command Palette"` ou similar
- `aria-activedescendant` apontando para item ativo
- Focus trap: Tab não deve sair do palette enquanto aberto
- Navegação por teclado funcional sem mouse

**Responsividade:**
- Desktop: centralizado com margin-top de 15vh
- Mobile: full-width com padding lateral mínimo, margin-top reduzido para 10vh

---

### Team Calendar

Calendário visual para visualizar eventos da equipe (férias, aniversários, feriados).

**Tokens CSS:**
```css
--calendar-cell-size: 120px;              /* Desktop */
--calendar-cell-size-mobile: 40px;        /* Mobile */
--calendar-today-bg: var(--color-primary);
--calendar-today-color: #ffffff;
--calendar-event-leave: var(--color-info);
--calendar-event-birthday: var(--color-secondary);
--calendar-event-holiday: var(--color-success);
--calendar-other-month-opacity: 0.4;
```

**Cores por Tipo de Evento:**
- Férias/Licenças: `var(--calendar-event-leave)` (azul info)
- Aniversários: `var(--calendar-event-birthday)` (roxo secundário)
- Feriados: `var(--calendar-event-holiday)` (verde sucesso)

**Layout do Grid:**
- Desktop: grid 7 colunas (dias da semana), células de 120x120px
- Tablet (768px): células de 80x80px
- Mobile (480px): células de 40x40px, layout compacto

**Comportamento:**
- Dia atual: destaque com background primário e texto branco
- Dias de outro mês: opacity de 0.4
- Dias clicáveis: cursor pointer + hover state
- Eventos: pequenos indicadores coloridos (dots ou badges) abaixo da data

**Acessibilidade:**
- `role="grid"` no container do calendário
- `aria-label` com mês/ano atual
- Dias navegáveis por teclado (Tab + Enter para abrir detalhes)
- Contraste adequado em todos os estados

---

### Audit Log

Tabela de registro de ações do sistema (criar, editar, deletar, login, etc.).

**Tokens CSS:**
```css
--audit-action-create: var(--color-success);
--audit-action-update: var(--color-info);
--audit-action-delete: var(--color-danger);
--audit-action-login: var(--color-secondary);
--audit-action-approve: var(--color-success);
--audit-action-reject: var(--color-danger);
--audit-action-process: var(--color-warning);
--audit-action-export: var(--color-primary);
```

**Cores por Tipo de Ação:**
| Ação | Cor | Token |
|------|-----|-------|
| Create | Verde | `--audit-action-create` |
| Update | Azul | `--audit-action-update` |
| Delete | Vermelho | `--audit-action-delete` |
| Login | Roxo | `--audit-action-login` |
| Approve | Verde | `--audit-action-approve` |
| Reject | Vermelho | `--audit-action-reject` |
| Process | Laranja | `--audit-action-process` |
| Export | Primário | `--audit-action-export` |

**Layout da Tabela:**
- Colunas: Data/Hora | Usuário | Ação | Detalhes
- Linha expansível para mostrar JSON de mudanças (opcional)
- Badge colorido para tipo de ação

**Responsividade:**
- Desktop: tabela completa com todas as colunas
- Tablet (768px): esconder coluna "Detalhes", mostrar em linha expansível
- Mobile (480px): layout card-based em vez de tabela, overflow-x: auto como fallback

**Acessibilidade:**
- Tabela semântica (`<table>`, `<thead>`, `<tbody>`)
- Headers de coluna com `scope="col"`
- Badges com texto acessível (não apenas cor)

---

### Birthday Widget

Widget compacto mostrando próximos aniversários da equipe.

**Tokens CSS:**
```css
--birthday-avatar-size: 40px;
--birthday-avatar-bg: var(--color-primary-light);      /* Light mode */
--birthday-avatar-bg: rgba(102, 126, 234, 0.15);       /* Dark mode */
--birthday-avatar-color: var(--color-primary);
--birthday-today-bg: var(--color-warning-light);       /* Light mode */
--birthday-today-bg: rgba(246, 173, 85, 0.12);         /* Dark mode */
--birthday-today-border: var(--color-warning);
```

**Layout do Avatar com Iniciais:**
```html
<div class="birthday-avatar">JD</div>
```
```css
.birthday-avatar {
  width: var(--birthday-avatar-size);
  height: var(--birthday-avatar-size);
  border-radius: var(--radius-full);
  background: var(--birthday-avatar-bg);
  color: var(--birthday-avatar-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
```

**Destaque de "Hoje":**
- Card com background `--birthday-today-bg`
- Borda esquerda com `--birthday-today-border` (3px)
- Badge "Hoje!" em destaque

**Lista de Aniversários:**
- Ordenados por data mais próxima
- Máximo de 5 itens visíveis
- Avatar + Nome + Data
- Aniversário de hoje aparece primeiro com destaque

**Responsividade:**
- Desktop: card lateral no dashboard
- Mobile: full-width, scroll horizontal se necessário

---

### Recruitment Module - Specific Patterns

Os componentes de recrutamento seguem padrões específicos documentados abaixo.

**Status Badges (Vagas):**
- `pending_approval`: Amarelo/warning
- `approved`: Verde/success
- `open`: Azul/info
- `filled`: Verde escuro/success-dark
- `cancelled`: Vermelho/danger

**Status Badges (Candidatos):**
- `active`: Azul/info
- `hired`: Verde/success
- `rejected`: Vermelho/danger
- `withdrawn`: Cinza/neutral

**Pipeline (Kanban Board):**
- Grid responsivo: `repeat(auto-fit, minmax(250px, 1fr))`
- Mobile: 1 coluna por vez
- Drag & drop visual (futuro): usar `cursor: grab` e feedback de drop zone

**Filtros Múltiplos:**
- Layout horizontal em desktop
- Layout vertical (stack) em mobile (768px)
- Todos os selects com mesmo height (40px)
- Labels uppercase, font-size 12px, letter-spacing 0.025em

---

## Novos Componentes - Fase 2

### Onboarding Digital

Sistema de checklist para onboarding de novos colaboradores.

**Tokens CSS:**
```css
--onboarding-progress-bg: var(--color-bg-muted);
--onboarding-progress-fill: var(--color-primary);
--onboarding-progress-height: 8px;
--onboarding-item-pending: var(--color-text-muted);
--onboarding-item-complete: var(--color-success);
--onboarding-item-overdue: var(--color-danger);
--onboarding-item-skipped: var(--color-warning);
```

**Progress Bar:**
- Container: background `--onboarding-progress-bg`, altura de 8px
- Fill: background `--onboarding-progress-fill`, largura baseada em porcentagem
- Border radius: `var(--radius-full)` para efeito pill

**Checklist Items:**
```css
.checklist-item {
  padding: var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
}

.checklist-item.pending {
  color: var(--onboarding-item-pending);
}

.checklist-item.complete {
  border-left: 3px solid var(--onboarding-item-complete);
  background: var(--color-success-light);
}

.checklist-item.overdue {
  border-left: 3px solid var(--onboarding-item-overdue);
  background: var(--color-danger-light);
}

.checklist-item.skipped {
  border-left: 3px solid var(--onboarding-item-skipped);
  opacity: 0.7;
}
```

**Checkbox customizado:**
```css
.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xs);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: var(--transition-base);
}

.custom-checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
```

**Responsividade:**
- Desktop: layout grid com 2 colunas
- Mobile (768px): 1 coluna, stack vertical

**Acessibilidade:**
- Checkboxes com labels associados
- Status anunciado por screen readers (aria-live)
- Navegação por teclado funcional

---

### Pesquisas de Clima (Surveys)

Sistema de pesquisas de satisfação e eNPS.

**Tokens CSS:**
```css
--survey-scale-btn-size: 40px;
--survey-enps-promoter: var(--color-success);   /* 9-10 */
--survey-enps-passive: var(--color-warning);    /* 7-8 */
--survey-enps-detractor: var(--color-danger);   /* 0-6 */
--survey-enps-score-size: 80px;
--survey-bar-height: 24px;
--survey-bar-bg: var(--color-bg-muted);         /* Light mode */
--survey-bar-bg: rgba(255, 255, 255, 0.08);     /* Dark mode */
```

**Escala 1-5 (Likert):**
```css
.scale-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.scale-btn {
  width: var(--survey-scale-btn-size);
  height: var(--survey-scale-btn-size);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: var(--transition-base);
}

.scale-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.scale-btn.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg-card);
}
```

**eNPS Scale (0-10):**
- Grid de 11 botões (0-10)
- Cores por categoria:
  - 0-6: `--survey-enps-detractor` (vermelho)
  - 7-8: `--survey-enps-passive` (amarelo)
  - 9-10: `--survey-enps-promoter` (verde)

**Gráficos de Resultados (CSS puro):**
```css
.survey-bar {
  height: var(--survey-bar-height);
  background: var(--survey-bar-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.survey-bar-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width var(--transition-slow);
}

.enps-score {
  width: var(--survey-enps-score-size);
  height: var(--survey-enps-score-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.enps-score.promoter {
  background: var(--survey-enps-promoter);
  color: var(--color-bg-card);
}

.enps-score.passive {
  background: var(--survey-enps-passive);
  color: var(--color-text-primary);
}

.enps-score.detractor {
  background: var(--survey-enps-detractor);
  color: var(--color-bg-card);
}
```

**Responsividade:**
- Desktop: escala horizontal
- Mobile (480px): escala wrap com botões menores (36px)

**Acessibilidade:**
- `aria-label` em cada botão da escala (ex: "Nota 5 de 5")
- `role="radiogroup"` no container
- `aria-checked` no botão selecionado

---

### Organograma

Visualização hierárquica da estrutura organizacional.

**Tokens CSS:**
```css
--orgchart-card-width: 280px;
--orgchart-manager-border: var(--color-primary);
--orgchart-connector-color: var(--color-border);
--orgchart-avatar-size: 36px;
```

**Department Card:**
```css
.orgchart-card {
  width: var(--orgchart-card-width);
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  position: relative;
}

.orgchart-card.manager {
  border-left: 3px solid var(--orgchart-manager-border);
  background: var(--color-primary-light);
}
```

**Avatar com Iniciais:**
Reutilizar padrão do Birthday Widget:
```css
.orgchart-avatar {
  width: var(--orgchart-avatar-size);
  height: var(--orgchart-avatar-size);
  border-radius: var(--radius-full);
  background: var(--birthday-avatar-bg);
  color: var(--birthday-avatar-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
```

**Linhas de Conexão (Opcional):**
```css
.orgchart-connector {
  position: absolute;
  border: 1px solid var(--orgchart-connector-color);
}

.orgchart-connector-vertical {
  width: 1px;
  height: 40px;
  top: 100%;
  left: 50%;
}

.orgchart-connector-horizontal {
  height: 1px;
  width: 100px;
  top: 20px;
  left: 100%;
}
```

**Layout:**
- Desktop: grid com colunas flexíveis
- Tablet (768px): 2 colunas
- Mobile (480px): 1 coluna (stack vertical)

**Responsividade:**
```css
.orgchart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-12);
}

@media (max-width: 768px) {
  .orgchart-card {
    width: 100%;
  }
}
```

**Acessibilidade:**
- Estrutura semântica com headings (h2, h3)
- `role="tree"` ou `role="list"` conforme layout
- Navegação por teclado entre cards

---

### Templates de Documentos

Editor de templates com variáveis dinâmicas.

**Tokens CSS:**
```css
--template-editor-min-height: 400px;
--template-variable-bg: var(--color-primary-light);       /* Light mode */
--template-variable-bg: rgba(102, 126, 234, 0.15);        /* Dark mode */
--template-variable-color: var(--color-primary);
--template-preview-bg: var(--color-bg-card);              /* Light mode */
--template-preview-bg: var(--color-bg-subtle);            /* Dark mode */
```

**Editor de Template:**
```css
.template-editor {
  min-height: var(--template-editor-min-height);
  padding: var(--space-8);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  font-family: 'Courier New', monospace;
  background: var(--color-bg-input);
  color: var(--color-text-secondary);
  resize: vertical;
}

.template-editor:focus {
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}
```

**Variáveis Clicáveis:**
```css
.template-variable {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--template-variable-bg);
  color: var(--template-variable-color);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.template-variable:hover {
  background: var(--color-primary);
  color: var(--color-bg-card);
}
```

**Preview:**
```css
.template-preview {
  min-height: var(--template-editor-min-height);
  padding: var(--space-8);
  background: var(--template-preview-bg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}
```

**Lista de Variáveis Disponíveis:**
```css
.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}
```

**Layout:**
- Desktop: 2 colunas (editor | preview)
- Mobile (768px): stack vertical

**Acessibilidade:**
- Labels em todos inputs
- Preview com `role="region"` e `aria-label="Pré-visualização do template"`
- Variáveis com `aria-label` descritivo (ex: "Inserir variável Nome do Colaborador")

---

## Novos Componentes - Fase 3 (CRM Features)

### Kanban Board (Recrutamento)

Sistema de quadro kanban para visualização de pipeline de candidatos.

**Tokens CSS:**
```css
--kanban-column-width: 280px;
--kanban-column-bg: var(--color-bg-card);              /* Light mode */
--kanban-column-bg: var(--color-bg-subtle);            /* Dark mode */
--kanban-column-header-bg: var(--color-bg-hover);      /* Light mode */
--kanban-column-header-bg: rgba(255, 255, 255, 0.03);  /* Dark mode */
--kanban-card-bg: var(--color-bg-card);
--kanban-card-border: var(--color-border);
--kanban-card-shadow: var(--shadow-sm);                /* Light mode */
--kanban-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);    /* Dark mode */
--kanban-card-hover-shadow: var(--shadow-md);          /* Light mode */
--kanban-card-hover-shadow: 0 4px 6px rgba(0, 0, 0, 0.6); /* Dark mode */
--kanban-badge-bg: var(--color-border);                /* Light mode */
--kanban-badge-bg: rgba(255, 255, 255, 0.08);          /* Dark mode */
--kanban-badge-color: var(--color-text-muted);
```

**Estrutura da Coluna:**
```css
.kanban-column {
  width: var(--kanban-column-width);
  background: var(--kanban-column-bg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.kanban-column-header {
  background: var(--kanban-column-header-bg);
  padding: var(--space-6) var(--space-8);
  border-bottom: var(--border-width) solid var(--color-border);
}

.kanban-badge {
  background: var(--kanban-badge-bg);
  color: var(--kanban-badge-color);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
```

**Cards dentro da Coluna:**
```css
.kanban-card {
  background: var(--kanban-card-bg);
  border: var(--border-width) solid var(--kanban-card-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--kanban-card-shadow);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
  cursor: grab;
}

.kanban-card:hover {
  box-shadow: var(--kanban-card-hover-shadow);
  transform: translateY(-2px);
}

.kanban-card:active {
  cursor: grabbing;
}
```

**Responsividade:**
- Desktop: grid com múltiplas colunas
- Tablet (768px): scroll horizontal
- Mobile (480px): 1 coluna por vez, swipe horizontal

**Acessibilidade:**
- `aria-label` em cada coluna com nome do estágio
- Drag & drop acessível via teclado (futuro)
- Contadores anunciados por screen readers

---

### Talent Pool

Sistema de banco de talentos com tags e status.

**Tokens CSS:**
```css
--talent-tag-padding: 0.25rem 0.5rem;
--talent-tag-border-radius: var(--radius-xs);
--talent-tag-font-size: var(--font-size-2xs);
--talent-status-active: #22c55e;                       /* Light mode */
--talent-status-active: rgba(34, 197, 94, 0.9);        /* Dark mode */
--talent-status-contacted: #3b82f6;                    /* Light mode */
--talent-status-contacted: rgba(59, 130, 246, 0.9);    /* Dark mode */
--talent-status-interviewing: #f59e0b;                 /* Light mode */
--talent-status-interviewing: rgba(245, 158, 11, 0.9); /* Dark mode */
--talent-status-hired: #8b5cf6;                        /* Light mode */
--talent-status-hired: rgba(139, 92, 246, 0.9);        /* Dark mode */
--talent-status-archived: #6b7280;                     /* Light mode */
--talent-status-archived: rgba(107, 114, 128, 0.9);    /* Dark mode */
```

**Cores por Status:**
| Status | Light Mode | Dark Mode | Uso |
|--------|-----------|-----------|-----|
| Active | #22c55e | rgba(34, 197, 94, 0.9) | Candidato ativo no pool |
| Contacted | #3b82f6 | rgba(59, 130, 246, 0.9) | Já foi contatado |
| Interviewing | #f59e0b | rgba(245, 158, 11, 0.9) | Em processo de entrevista |
| Hired | #8b5cf6 | rgba(139, 92, 246, 0.9) | Contratado |
| Archived | #6b7280 | rgba(107, 114, 128, 0.9) | Arquivado/inativo |

**Tags de Habilidades:**
```css
.talent-tag {
  display: inline-block;
  padding: var(--talent-tag-padding);
  border-radius: var(--talent-tag-border-radius);
  font-size: var(--talent-tag-font-size);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-light);
  color: var(--color-primary);
  white-space: nowrap;
}

/* Dark mode */
[data-theme="dark"] .talent-tag {
  background: rgba(102, 126, 234, 0.15);
}
```

**Status Badge com Dot:**
```css
.talent-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.talent-status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.talent-status.active .talent-status-dot {
  background: var(--talent-status-active);
}

.talent-status.contacted .talent-status-dot {
  background: var(--talent-status-contacted);
}

.talent-status.interviewing .talent-status-dot {
  background: var(--talent-status-interviewing);
}

.talent-status.hired .talent-status-dot {
  background: var(--talent-status-hired);
}

.talent-status.archived .talent-status-dot {
  background: var(--talent-status-archived);
}
```

---

### Engagement Score (Índice de Engajamento)

Visualização de score de engajamento de colaboradores.

**Tokens CSS:**
```css
--engagement-gauge-bg: var(--color-bg-muted);          /* Light mode */
--engagement-gauge-bg: rgba(255, 255, 255, 0.08);      /* Dark mode */
--engagement-gauge-fill: var(--color-primary);
--engagement-score-high: #22c55e;                      /* Light mode */
--engagement-score-high: rgba(34, 197, 94, 0.9);       /* Dark mode */
--engagement-score-medium: #f59e0b;                    /* Light mode */
--engagement-score-medium: rgba(245, 158, 11, 0.9);    /* Dark mode */
--engagement-score-low: #ef4444;                       /* Light mode */
--engagement-score-low: rgba(239, 68, 68, 0.9);        /* Dark mode */
--engagement-bar-bg: var(--color-bg-muted);            /* Light mode */
--engagement-bar-bg: rgba(255, 255, 255, 0.08);        /* Dark mode */
--engagement-bar-height: 8px;
```

**Faixas de Score:**
- **Alto** (>75): `--engagement-score-high` (verde)
- **Médio** (50-75): `--engagement-score-medium` (amarelo)
- **Baixo** (<50): `--engagement-score-low` (vermelho)

**Gauge Circular:**
```css
.engagement-gauge {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  background: conic-gradient(
    var(--engagement-gauge-fill) 0deg 270deg,
    var(--engagement-gauge-bg) 270deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.engagement-gauge-inner {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-full);
  background: var(--color-bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.engagement-score-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.engagement-score-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
```

**Barra de Progresso:**
```css
.engagement-bar {
  height: var(--engagement-bar-height);
  background: var(--engagement-bar-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.engagement-bar-fill {
  height: 100%;
  transition: width var(--transition-slow);
  border-radius: var(--radius-full);
}

.engagement-bar-fill.high {
  background: var(--engagement-score-high);
}

.engagement-bar-fill.medium {
  background: var(--engagement-score-medium);
}

.engagement-bar-fill.low {
  background: var(--engagement-score-low);
}
```

---

### Turnover Dashboard

Dashboard de taxa de rotatividade (turnover).

**Tokens CSS:**
```css
--turnover-rate-good: #22c55e;                         /* Light mode */
--turnover-rate-good: rgba(34, 197, 94, 0.9);          /* Dark mode */
--turnover-rate-warning: #f59e0b;                      /* Light mode */
--turnover-rate-warning: rgba(245, 158, 11, 0.9);      /* Dark mode */
--turnover-rate-danger: #ef4444;                       /* Light mode */
--turnover-rate-danger: rgba(239, 68, 68, 0.9);        /* Dark mode */
--turnover-bar-height: 32px;
--turnover-bar-bg: var(--color-bg-muted);              /* Light mode */
--turnover-bar-bg: rgba(255, 255, 255, 0.08);          /* Dark mode */
```

**Faixas de Taxa de Turnover:**
- **Bom** (<3%): `--turnover-rate-good` (verde)
- **Atenção** (3-5%): `--turnover-rate-warning` (amarelo)
- **Crítico** (>5%): `--turnover-rate-danger` (vermelho)

**Card de Taxa:**
```css
.turnover-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  text-align: center;
}

.turnover-rate {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-4);
}

.turnover-rate.good {
  color: var(--turnover-rate-good);
}

.turnover-rate.warning {
  color: var(--turnover-rate-warning);
}

.turnover-rate.danger {
  color: var(--turnover-rate-danger);
}

.turnover-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
```

**Gráfico de Barras de Distribuição:**
```css
.turnover-bar {
  height: var(--turnover-bar-height);
  background: var(--turnover-bar-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  margin-bottom: var(--space-6);
}

.turnover-bar-segment {
  height: 100%;
  transition: width var(--transition-slow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-bg-card);
}

.turnover-bar-segment.voluntary {
  background: var(--turnover-rate-danger);
}

.turnover-bar-segment.involuntary {
  background: var(--turnover-rate-warning);
}
```

---

### Employee Lifecycle Timeline

Timeline visual do ciclo de vida do colaborador.

**Tokens CSS:**
```css
--timeline-line-color: var(--color-border);            /* Light mode */
--timeline-line-color: rgba(255, 255, 255, 0.12);      /* Dark mode */
--timeline-line-width: 2px;
--timeline-dot-size: 12px;
--timeline-card-bg: var(--color-bg-card);
--timeline-type-history: #3b82f6;                      /* Light mode */
--timeline-type-history: rgba(59, 130, 246, 0.9);      /* Dark mode */
--timeline-type-leave: #22c55e;                        /* Light mode */
--timeline-type-leave: rgba(34, 197, 94, 0.9);         /* Dark mode */
--timeline-type-training: #8b5cf6;                     /* Light mode */
--timeline-type-training: rgba(139, 92, 246, 0.9);     /* Dark mode */
--timeline-type-evaluation: #f59e0b;                   /* Light mode */
--timeline-type-evaluation: rgba(245, 158, 11, 0.9);   /* Dark mode */
--timeline-type-onboarding: #06b6d4;                   /* Light mode */
--timeline-type-onboarding: rgba(6, 182, 212, 0.9);    /* Dark mode */
--timeline-type-turnover: #ef4444;                     /* Light mode */
--timeline-type-turnover: rgba(239, 68, 68, 0.9);      /* Dark mode */
```

**Cores por Tipo de Evento:**
| Tipo | Light Mode | Dark Mode | Uso |
|------|-----------|-----------|-----|
| History | #3b82f6 | rgba(59, 130, 246, 0.9) | Histórico geral |
| Leave | #22c55e | rgba(34, 197, 94, 0.9) | Férias e licenças |
| Training | #8b5cf6 | rgba(139, 92, 246, 0.9) | Treinamentos |
| Evaluation | #f59e0b | rgba(245, 158, 11, 0.9) | Avaliações |
| Onboarding | #06b6d4 | rgba(6, 182, 212, 0.9) | Onboarding |
| Turnover | #ef4444 | rgba(239, 68, 68, 0.9) | Desligamento |

**Estrutura da Timeline:**
```css
.timeline {
  position: relative;
  padding-left: var(--space-16);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--timeline-line-width);
  background: var(--timeline-line-color);
}

.timeline-item {
  position: relative;
  margin-bottom: var(--space-10);
}

.timeline-dot {
  position: absolute;
  left: calc(-1 * var(--space-16) - var(--timeline-dot-size) / 2 + var(--timeline-line-width) / 2);
  top: var(--space-4);
  width: var(--timeline-dot-size);
  height: var(--timeline-dot-size);
  border-radius: var(--radius-full);
  border: var(--border-width-thick) solid var(--color-bg-card);
}

.timeline-dot.history {
  background: var(--timeline-type-history);
}

.timeline-dot.leave {
  background: var(--timeline-type-leave);
}

.timeline-dot.training {
  background: var(--timeline-type-training);
}

.timeline-dot.evaluation {
  background: var(--timeline-type-evaluation);
}

.timeline-dot.onboarding {
  background: var(--timeline-type-onboarding);
}

.timeline-dot.turnover {
  background: var(--timeline-type-turnover);
}

.timeline-card {
  background: var(--timeline-card-bg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}

.timeline-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.timeline-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.timeline-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}
```

**Responsividade:**
- Desktop: timeline vertical com linha à esquerda
- Mobile (480px): padding reduzido, dot menor (8px)

---

### Communications (Notificações Automatizadas)

Sistema de templates de comunicação automatizada.

**Tokens CSS:**
```css
--comm-trigger-badge-bg: var(--color-primary-light);   /* Light mode */
--comm-trigger-badge-bg: rgba(102, 126, 234, 0.15);    /* Dark mode */
--comm-trigger-badge-color: var(--color-primary);
--comm-template-bg: var(--color-bg-subtle);            /* Light mode */
--comm-template-bg: rgba(255, 255, 255, 0.03);         /* Dark mode */
--comm-variable-color: var(--color-primary);
--comm-active-color: var(--color-success);             /* Light mode */
--comm-active-color: rgba(72, 187, 120, 0.9);          /* Dark mode */
--comm-inactive-color: var(--color-text-muted);
```

**Badge de Trigger:**
```css
.comm-trigger-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  background: var(--comm-trigger-badge-bg);
  color: var(--comm-trigger-badge-color);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
```

**Preview de Template:**
```css
.comm-template-preview {
  background: var(--comm-template-bg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-8);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.comm-variable {
  color: var(--comm-variable-color);
  font-weight: var(--font-weight-semibold);
  background: rgba(102, 126, 234, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
}
```

**Indicador de Status (Ativo/Inativo):**
```css
.comm-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.comm-status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.comm-status-indicator.active .comm-status-dot {
  background: var(--comm-active-color);
}

.comm-status-indicator.inactive .comm-status-dot {
  background: var(--comm-inactive-color);
}
```

---

## Fase 4 - Advanced Features

### Skills Matrix (Matriz de Competencias)

Sistema de avaliacao e visualizacao de competencias por nivel de proficiencia.

**Tokens CSS:**
```css
--skills-level-1: #ef4444;              /* Iniciante - vermelho */
--skills-level-2: #f97316;              /* Basico - laranja */
--skills-level-3: #eab308;              /* Intermediario - amarelo */
--skills-level-4: #22c55e;              /* Avancado - verde claro */
--skills-level-5: #16a34a;              /* Expert - verde */
--skills-level-1-bg: #fef2f2;           /* Light mode */
--skills-level-1-bg: #451a1a;           /* Dark mode */
--skills-level-2-bg: #fff7ed;           /* Light mode */
--skills-level-2-bg: #451a00;           /* Dark mode */
--skills-level-3-bg: #fefce8;           /* Light mode */
--skills-level-3-bg: #3d3500;           /* Dark mode */
--skills-level-4-bg: #f0fdf4;           /* Light mode */
--skills-level-4-bg: #052e16;           /* Dark mode */
--skills-level-5-bg: #f0fdf4;           /* Light mode */
--skills-level-5-bg: #052e16;           /* Dark mode */
--skills-gap-negative: #dc2626;         /* Gap negativo (abaixo do target) */
--skills-gap-positive: #16a34a;         /* Atingiu ou superou target */
--skills-gap-neutral: #9ca3af;          /* Sem target definido */
--skills-matrix-cell-size: 48px;
--skills-matrix-header-bg: var(--color-bg-secondary);
--skills-matrix-border: var(--color-border);
--skills-category-bg: var(--color-bg-tertiary);
--skills-category-text: var(--color-text-primary);
```

**Niveis de Proficiencia:**

| Nivel | Cor | Background (Light) | Background (Dark) | Descricao |
|-------|-----|-------------------|-------------------|-----------|
| 1 | #ef4444 (vermelho) | #fef2f2 | #451a1a | Iniciante |
| 2 | #f97316 (laranja) | #fff7ed | #451a00 | Basico |
| 3 | #eab308 (amarelo) | #fefce8 | #3d3500 | Intermediario |
| 4 | #22c55e (verde claro) | #f0fdf4 | #052e16 | Avancado |
| 5 | #16a34a (verde) | #f0fdf4 | #052e16 | Expert |

**Gap Analysis (Analise de Gap de Competencias):**
- **Negativo** (`--skills-gap-negative`): Colaborador abaixo do nivel esperado para o cargo
- **Positivo** (`--skills-gap-positive`): Colaborador atingiu ou superou o nivel esperado
- **Neutro** (`--skills-gap-neutral`): Sem target definido para a competencia

**Grid de Matriz:**
```css
.skills-matrix {
  display: grid;
  grid-template-columns: auto repeat(5, var(--skills-matrix-cell-size));
  gap: var(--space-2);
  border: var(--border-width) solid var(--skills-matrix-border);
  border-radius: var(--radius-lg);
}

.skills-matrix-cell {
  width: var(--skills-matrix-cell-size);
  height: var(--skills-matrix-cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border-width) solid var(--skills-matrix-border);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.skills-matrix-cell.level-1 {
  background: var(--skills-level-1-bg);
  color: var(--skills-level-1);
}

.skills-matrix-cell.level-2 {
  background: var(--skills-level-2-bg);
  color: var(--skills-level-2);
}

.skills-matrix-cell.level-3 {
  background: var(--skills-level-3-bg);
  color: var(--skills-level-3);
}

.skills-matrix-cell.level-4 {
  background: var(--skills-level-4-bg);
  color: var(--skills-level-4);
}

.skills-matrix-cell.level-5 {
  background: var(--skills-level-5-bg);
  color: var(--skills-level-5);
}
```

**Responsividade:**
- Desktop: grid completo com todas as colunas visiveis
- Tablet (768px): scroll horizontal com sombras laterais
- Mobile (480px): cell-size reduzido para 36px

---

### Career Planning (Planejamento de Carreira)

Sistema de trilhas de carreira e planejamento de sucessao.

**Tokens CSS:**
```css
--career-path-line: var(--color-primary);
--career-path-node-active: var(--color-primary);
--career-path-node-completed: #16a34a;
--career-path-node-future: #9ca3af;
--career-path-node-size: 40px;
--career-level-bg: var(--color-bg-secondary);
--career-level-border: var(--color-border);
--career-level-active-border: var(--color-primary);
--career-succession-ready-now: #16a34a;
--career-succession-ready-1y: #3b82f6;
--career-succession-ready-2y: #f59e0b;
--career-succession-needs-dev: #ef4444;
--career-priority-critical: #dc2626;
--career-priority-high: #f97316;
--career-priority-medium: #eab308;
--career-priority-low: #6b7280;
```

**Career Path Nodes (Nos da Trilha de Carreira):**

| Estado | Cor | Uso |
|--------|-----|-----|
| Active | var(--color-primary) | Cargo atual do colaborador |
| Completed | #16a34a (verde) | Cargos ja ocupados |
| Future | #9ca3af (cinza) | Proximo(s) cargo(s) na trilha |

**Succession Readiness (Prontidao para Sucessao):**

| Nivel | Cor | Descricao |
|-------|-----|-----------|
| Ready Now | #16a34a (verde) | Pronto para assumir imediatamente |
| Ready 1 Year | #3b82f6 (azul) | Pronto em ate 1 ano |
| Ready 2 Years | #f59e0b (amarelo) | Pronto em 1-2 anos |
| Needs Development | #ef4444 (vermelho) | Precisa de mais desenvolvimento |

**Prioridade de Posicao (Criticidade):**

| Nivel | Cor | Uso |
|-------|-----|-----|
| Critical | #dc2626 (vermelho escuro) | Posicao critica sem sucessor |
| High | #f97316 (laranja) | Alta prioridade |
| Medium | #eab308 (amarelo) | Media prioridade |
| Low | #6b7280 (cinza) | Baixa prioridade |

**Career Path Visual:**
```css
.career-path {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  position: relative;
}

.career-path::before {
  content: '';
  position: absolute;
  left: calc(var(--career-path-node-size) / 2 - 1px);
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--career-path-line);
}

.career-node {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.career-node-icon {
  width: var(--career-path-node-size);
  height: var(--career-path-node-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  border: 2px solid var(--color-bg-card);
  z-index: 1;
}

.career-node-icon.active {
  background: var(--career-path-node-active);
  color: #ffffff;
}

.career-node-icon.completed {
  background: var(--career-path-node-completed);
  color: #ffffff;
}

.career-node-icon.future {
  background: var(--career-path-node-future);
  color: #ffffff;
}
```

---

### Occupational Health (Saude Ocupacional)

Sistema de gestao de exames medicos, ASO e restricoes de saude.

**Tokens CSS:**
```css
--health-fit: #16a34a;
--health-unfit: #dc2626;
--health-restrictions: #f59e0b;
--health-scheduled: #3b82f6;
--health-completed: #16a34a;
--health-expired: #dc2626;
--health-cancelled: #9ca3af;
--health-cert-pending: #f59e0b;
--health-cert-approved: #16a34a;
--health-cert-rejected: #dc2626;
--health-alert-bg: #fef2f2;           /* Light mode */
--health-alert-bg: #451a1a;           /* Dark mode */
--health-alert-border: #fecaca;       /* Light mode */
--health-alert-border: #7f1d1d;       /* Dark mode */
--health-alert-text: #991b1b;         /* Light mode */
--health-alert-text: #fca5a5;         /* Dark mode */
--health-warning-bg: #fffbeb;         /* Light mode */
--health-warning-bg: #451a00;         /* Dark mode */
--health-warning-border: #fde68a;     /* Light mode */
--health-warning-border: #78350f;     /* Dark mode */
--health-warning-text: #92400e;       /* Light mode */
--health-warning-text: #fcd34d;       /* Dark mode */
--health-exam-card-bg: var(--color-bg-card);
```

**Status de Aptidao (ASO):**

| Status | Cor | Descricao |
|--------|-----|-----------|
| Fit | #16a34a (verde) | Apto para funcao |
| Unfit | #dc2626 (vermelho) | Inapto para funcao |
| Restrictions | #f59e0b (amarelo) | Apto com restricoes |

**Status de Exame:**

| Status | Cor | Descricao |
|--------|-----|-----------|
| Scheduled | #3b82f6 (azul) | Agendado |
| Completed | #16a34a (verde) | Realizado |
| Expired | #dc2626 (vermelho) | Vencido/atrasado |
| Cancelled | #9ca3af (cinza) | Cancelado |

**Status de Certificado:**

| Status | Cor | Descricao |
|--------|-----|-----------|
| Pending | #f59e0b (amarelo) | Aguardando aprovacao |
| Approved | #16a34a (verde) | Aprovado |
| Rejected | #dc2626 (vermelho) | Rejeitado |

**Alerts de Saude:**
```css
.health-alert {
  background: var(--health-alert-bg);
  border: var(--border-width) solid var(--health-alert-border);
  border-radius: var(--radius-md);
  padding: var(--space-6) var(--space-8);
  color: var(--health-alert-text);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.health-warning {
  background: var(--health-warning-bg);
  border: var(--border-width) solid var(--health-warning-border);
  border-radius: var(--radius-md);
  padding: var(--space-6) var(--space-8);
  color: var(--health-warning-text);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}
```

**Exam Card:**
```css
.health-exam-card {
  background: var(--health-exam-card-bg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  transition: var(--transition-base);
}

.health-exam-card:hover {
  box-shadow: var(--shadow-md);
}
```

---

### People Analytics (Analytics de Pessoas)

Dashboard de metricas e insights de RH com visualizacoes de dados.

**Tokens CSS:**
```css
--analytics-kpi-bg: var(--color-bg-secondary);
--analytics-kpi-border: var(--color-border);
--analytics-kpi-value-size: 2rem;
--analytics-kpi-label-size: 0.875rem;
--analytics-chart-primary: var(--color-primary);
--analytics-chart-secondary: #8b5cf6;
--analytics-chart-tertiary: #ec4899;
--analytics-chart-quaternary: #14b8a6;
--analytics-risk-high: #dc2626;
--analytics-risk-high-bg: #fef2f2;       /* Light mode */
--analytics-risk-high-bg: #451a1a;       /* Dark mode */
--analytics-risk-medium: #f59e0b;
--analytics-risk-medium-bg: #fffbeb;     /* Light mode */
--analytics-risk-medium-bg: #451a00;     /* Dark mode */
--analytics-risk-low: #16a34a;
--analytics-risk-low-bg: #f0fdf4;        /* Light mode */
--analytics-risk-low-bg: #052e16;        /* Dark mode */
--analytics-trend-up: #16a34a;
--analytics-trend-down: #dc2626;
--analytics-trend-stable: #6b7280;
--analytics-insight-bg: #eff6ff;         /* Light mode */
--analytics-insight-bg: #1e3a5f;         /* Dark mode */
--analytics-insight-border: #bfdbfe;     /* Light mode */
--analytics-insight-border: #1e40af;     /* Dark mode */
--analytics-insight-text: #1e40af;       /* Light mode */
--analytics-insight-text: #93c5fd;       /* Dark mode */
--analytics-section-gap: 2rem;
```

**Paleta de Cores para Graficos:**

| Variavel | Cor | Uso |
|----------|-----|-----|
| Primary | var(--color-primary) | Primeira serie/categoria |
| Secondary | #8b5cf6 (roxo) | Segunda serie/categoria |
| Tertiary | #ec4899 (rosa) | Terceira serie/categoria |
| Quaternary | #14b8a6 (teal) | Quarta serie/categoria |

**Risk Levels (Niveis de Risco):**

| Nivel | Cor | Background (Light) | Background (Dark) | Uso |
|-------|-----|-------------------|-------------------|-----|
| High | #dc2626 (vermelho) | #fef2f2 | #451a1a | Risco alto |
| Medium | #f59e0b (amarelo) | #fffbeb | #451a00 | Risco medio |
| Low | #16a34a (verde) | #f0fdf4 | #052e16 | Risco baixo |

**Trend Indicators (Indicadores de Tendencia):**

| Tipo | Cor | Icone | Uso |
|------|-----|-------|-----|
| Up | #16a34a (verde) | ↑ | Tendencia de alta/melhoria |
| Down | #dc2626 (vermelho) | ↓ | Tendencia de queda/piora |
| Stable | #6b7280 (cinza) | → | Estavel/sem mudancas |

**KPI Card:**
```css
.analytics-kpi {
  background: var(--analytics-kpi-bg);
  border: var(--border-width) solid var(--analytics-kpi-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  text-align: center;
}

.analytics-kpi-value {
  font-size: var(--analytics-kpi-value-size);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-2);
}

.analytics-kpi-label {
  font-size: var(--analytics-kpi-label-size);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.analytics-kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--space-3);
}

.analytics-kpi-trend.up {
  color: var(--analytics-trend-up);
}

.analytics-kpi-trend.down {
  color: var(--analytics-trend-down);
}

.analytics-kpi-trend.stable {
  color: var(--analytics-trend-stable);
}
```

**Insight Card:**
```css
.analytics-insight {
  background: var(--analytics-insight-bg);
  border: var(--border-width) solid var(--analytics-insight-border);
  border-radius: var(--radius-md);
  padding: var(--space-6) var(--space-8);
  color: var(--analytics-insight-text);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.analytics-insight-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
}
```

**Responsividade:**
- Desktop: grid de 2-4 colunas para KPIs
- Tablet (768px): 2 colunas
- Mobile (480px): 1 coluna (stack vertical)

**Acessibilidade:**
- Labels claras em todos os graficos
- Contraste adequado em todos os risk levels
- `aria-label` descritivo em KPIs
- Trends com texto alem de icone/cor

---

Atualizado em: 2026-02-14

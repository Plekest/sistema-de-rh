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

Atualizado em: 2026-02-14

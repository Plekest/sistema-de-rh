# Módulo de Autenticação

Este módulo gerencia toda a autenticação de usuários no sistema.

## Estrutura

```
auth/
├── components/         # Componentes específicos de autenticação (vazio por enquanto)
├── composables/        # Composables de autenticação (vazio por enquanto)
├── services/           # Serviços de API
│   └── auth.service.ts # Serviço de chamadas à API de autenticação
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces de User, LoginCredentials, etc.
└── views/              # Páginas
    └── LoginView.vue   # Página de login
```

## Funcionalidades Implementadas

### 1. Login
- Formulário de login com validação client-side
- Integração com API backend
- Armazenamento seguro do token no localStorage
- Tratamento de erros com feedback visual
- Redirect automático para dashboard após login

### 2. Logout
- Chamada à API de logout
- Limpeza do token e estado do usuário
- Redirect para página de login

### 3. Persistência de Sessão
- Verificação automática de token ao carregar a aplicação
- Restauração do estado do usuário se token for válido
- Redirect automático se token expirado/inválido

### 4. Proteção de Rotas
- Navigation guards no Vue Router
- Rotas protegidas por autenticação
- Rotas guest-only (apenas para não autenticados)

## Store (Pinia)

O store de autenticação (`/stores/auth.ts`) gerencia:

### State
- `user`: dados do usuário logado
- `token`: token de autenticação
- `isLoading`: estado de carregamento

### Getters
- `isAuthenticated`: verifica se usuário está autenticado
- `isAdmin`: verifica se usuário é admin
- `isManager`: verifica se usuário é gerente
- `userRole`: retorna o papel do usuário

### Actions
- `login(credentials)`: realiza login
- `logout()`: realiza logout
- `fetchUser()`: busca dados do usuário
- `initialize()`: inicializa o store (verifica token salvo)

## Serviços

### AuthService (`services/auth.service.ts`)

Métodos disponíveis:
- `login(credentials)`: POST /auth/login
- `logout()`: POST /auth/logout
- `me()`: GET /auth/me
- `register(data)`: POST /auth/register (admin only)

## Tipos

### User
```typescript
interface User {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  isActive: boolean
}
```

### LoginCredentials
```typescript
interface LoginCredentials {
  email: string
  password: string
}
```

### LoginResponse
```typescript
interface LoginResponse {
  token: string
  user: User
}
```

## Uso

### Em componentes

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Verificar autenticação
if (authStore.isAuthenticated) {
  // usuário logado
}

// Acessar dados do usuário
console.log(authStore.user?.fullName)

// Fazer logout
await authStore.logout()
</script>
```

### Proteger rotas

```typescript
{
  path: '/admin',
  component: AdminView,
  meta: { requiresAuth: true } // Requer autenticação
}
```

## Segurança

- Token armazenado no localStorage
- Token enviado automaticamente em todas as requisições (via interceptor Axios)
- Logout automático em caso de erro 401
- Validação client-side de campos de formulário
- Proteção contra acesso não autorizado via navigation guards

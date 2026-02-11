# Rotas Adicionadas ao Backend

## Tarefa 1: Rotas Faltantes

### 1a. Attendance - GET /api/v1/attendance/recent
Retorna os registros de ponto dos últimos 7 dias do usuário logado.

**Requisição:**
```http
GET /api/v1/attendance/recent
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "employeeId": 1,
      "date": "2026-02-10",
      "clockIn": "2026-02-10T08:00:00.000-03:00",
      "clockOut": "2026-02-10T17:00:00.000-03:00",
      "lunchStart": "2026-02-10T12:00:00.000-03:00",
      "lunchEnd": "2026-02-10T13:00:00.000-03:00",
      "totalWorkedMinutes": 480,
      "type": "regular",
      "notes": null
    }
  ]
}
```

### 1b. Documents - GET /api/v1/documents/:id/view
Retorna o arquivo para visualização inline no navegador.

**Requisição:**
```http
GET /api/v1/documents/1/view
Authorization: Bearer {token}
```

**Resposta:**
- Content-Disposition: inline
- Content-Type: application/pdf (ou o tipo do arquivo)
- Arquivo binário para visualização

---

## Tarefa 2: CRUD de Usuários (apenas admin)

### 2a. Listar Usuários - GET /api/v1/users

**Requisição:**
```http
GET /api/v1/users?page=1&limit=20&search=admin&role=admin&isActive=true
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- page (opcional): número da página
- limit (opcional): itens por página (max 100)
- search (opcional): busca por nome ou email
- role (opcional): admin | manager | employee
- isActive (opcional): true | false

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "fullName": "Admin",
      "email": "admin@sistema-rh.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000-03:00",
      "updatedAt": "2026-01-01T00:00:00.000-03:00"
    }
  ],
  "meta": {
    "total": 10,
    "perPage": 20,
    "currentPage": 1,
    "lastPage": 1,
    "firstPage": 1,
    "firstPageUrl": "...",
    "lastPageUrl": "...",
    "nextPageUrl": null,
    "previousPageUrl": null
  }
}
```

### 2b. Buscar Usuário - GET /api/v1/users/:id

**Requisição:**
```http
GET /api/v1/users/1
Authorization: Bearer {admin_token}
```

**Resposta:**
```json
{
  "data": {
    "id": 1,
    "fullName": "Admin",
    "email": "admin@sistema-rh.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000-03:00",
    "updatedAt": "2026-01-01T00:00:00.000-03:00",
    "employee": {
      "id": 1,
      "fullName": "Admin",
      "email": "admin@sistema-rh.com",
      "status": "active"
    }
  }
}
```

### 2c. Criar Usuário - POST /api/v1/users

**Requisição:**
```http
POST /api/v1/users
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "fullName": "João Silva",
  "email": "joao@sistema-rh.com",
  "password": "senha123456",
  "role": "employee"
}
```

**Validações:**
- fullName: obrigatório, mínimo 2 caracteres
- email: obrigatório, formato válido, único
- password: obrigatório, mínimo 8 caracteres
- role: obrigatório, valores: admin | manager | employee

**Resposta:**
```json
{
  "data": {
    "id": 2,
    "fullName": "João Silva",
    "email": "joao@sistema-rh.com",
    "role": "employee",
    "isActive": true,
    "createdAt": "2026-02-11T00:00:00.000-03:00",
    "updatedAt": "2026-02-11T00:00:00.000-03:00"
  }
}
```

### 2d. Atualizar Usuário - PUT /api/v1/users/:id

**Requisição:**
```http
PUT /api/v1/users/2
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "fullName": "João Silva Santos",
  "email": "joao.santos@sistema-rh.com",
  "password": "novasenha123",
  "role": "manager",
  "isActive": true
}
```

**Validações:**
- fullName (opcional): mínimo 2 caracteres
- email (opcional): formato válido, único (excluindo o próprio usuário)
- password (opcional): mínimo 8 caracteres
- role (opcional): admin | manager | employee
- isActive (opcional): boolean

**Resposta:**
```json
{
  "data": {
    "id": 2,
    "fullName": "João Silva Santos",
    "email": "joao.santos@sistema-rh.com",
    "role": "manager",
    "isActive": true,
    "createdAt": "2026-02-11T00:00:00.000-03:00",
    "updatedAt": "2026-02-11T14:30:00.000-03:00"
  }
}
```

### 2e. Desativar Usuário - DELETE /api/v1/users/:id

**Requisição:**
```http
DELETE /api/v1/users/2
Authorization: Bearer {admin_token}
```

**Resposta:**
```
204 No Content
```

**Nota:** Esta operação realiza um soft delete, apenas marcando o usuário como inativo (isActive = false). O usuário não é removido do banco de dados.

---

## Arquivos Criados/Modificados

### Criados:
1. `/home/fernandes/IA/sistema-de-rh/backend/app/services/user_service.ts`
2. `/home/fernandes/IA/sistema-de-rh/backend/app/validators/user_validator.ts`
3. `/home/fernandes/IA/sistema-de-rh/backend/app/controllers/users_controller.ts`

### Modificados:
1. `/home/fernandes/IA/sistema-de-rh/backend/app/services/time_entry_service.ts` - Adicionado método `getRecent()`
2. `/home/fernandes/IA/sistema-de-rh/backend/app/controllers/time_entries_controller.ts` - Adicionado método `recent()`
3. `/home/fernandes/IA/sistema-de-rh/backend/app/controllers/documents_controller.ts` - Adicionado método `view()`
4. `/home/fernandes/IA/sistema-de-rh/backend/start/routes.ts` - Adicionadas todas as novas rotas

---

## Segurança

1. **Autenticação**: Todas as rotas estão protegidas por autenticação JWT
2. **Autorização**: As rotas de usuários só podem ser acessadas por administradores
3. **Password**: A senha nunca é retornada nas respostas (serializeAs: null no model)
4. **Validação**: Todos os inputs são validados com VineJS
5. **Soft Delete**: Usuários não são removidos do banco, apenas desativados

---

## Testes Realizados

✅ Verificação de tipos TypeScript (npx tsc --noEmit)
✅ Servidor AdonisJS inicia sem erros (node ace serve)

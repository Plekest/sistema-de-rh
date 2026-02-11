# Testes da Funcionalidade "Esqueceu a Senha"

## Endpoints Implementados

### 1. POST /api/v1/auth/forgot-password
Solicita recuperação de senha enviando um email com link de redefinição.

**Request:**
```bash
curl -X POST http://localhost:3333/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com"
  }'
```

**Response (Sucesso - 200):**
```json
{
  "message": "Se o email existir, um link de recuperação será enviado"
}
```

**Observações:**
- Sempre retorna 200 mesmo se o email não existir (segurança)
- Se o email existir, envia um email com link válido por 1 hora
- Invalida todos os tokens anteriores do usuário
- Token é hasheado com SHA-256 antes de ser armazenado

---

### 2. POST /api/v1/auth/reset-password
Redefine a senha usando o token recebido por email.

**Request:**
```bash
curl -X POST http://localhost:3333/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "password": "novaSenha123",
    "password_confirmation": "novaSenha123"
  }'
```

**Response (Sucesso - 200):**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

**Response (Erro - 400):**
```json
{
  "message": "Token inválido ou expirado"
}
```

**Observações:**
- Token deve ser válido e não expirado (1 hora)
- Senha deve ter no mínimo 8 caracteres
- password_confirmation deve ser igual a password
- Marca o token como usado após redefinição
- Revoga todos os access tokens do usuário (logout forçado)

---

## Fluxo Completo de Teste

### 1. Verificar se há um usuário no banco
```bash
# Conectar ao PostgreSQL
psql -h 127.0.0.1 -U postgres -d sistema_rh_dev

# Listar usuários
SELECT id, email, full_name FROM users;
```

### 2. Solicitar recuperação de senha
```bash
curl -X POST http://localhost:3333/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }'
```

### 3. Verificar token no banco (simulando recebimento do email)
```sql
-- No PostgreSQL
SELECT
  id,
  user_id,
  token,
  expires_at,
  used_at,
  created_at
FROM password_reset_tokens
WHERE used_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
```

**IMPORTANTE:** O token no banco está hasheado. Para testar, você precisa:
- Pegar o token RAW do log do servidor (se configurado para logar)
- OU configurar SMTP para receber o email real
- OU modificar temporariamente o código para retornar o token raw

### 4. Redefinir senha (usando token do email)
```bash
curl -X POST http://localhost:3333/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_RECEBIDO_POR_EMAIL",
    "password": "NovaSenha@123",
    "password_confirmation": "NovaSenha@123"
  }'
```

### 5. Testar login com nova senha
```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "NovaSenha@123"
  }'
```

---

## Configuração de Email (SMTP)

### Opção 1: MailHog (Desenvolvimento)
Instale e rode MailHog localmente:
```bash
# Linux/Mac
brew install mailhog
mailhog

# Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Acesse http://localhost:8025 para ver os emails enviados.

No `.env`:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### Opção 2: Gmail (Produção)
No `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu.email@gmail.com
SMTP_PASS=sua_senha_de_app
```

**IMPORTANTE:** Use "Senhas de App" do Gmail, não sua senha real.

### Opção 3: Mailtrap (Desenvolvimento)
No `.env`:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu_usuario_mailtrap
SMTP_PASS=sua_senha_mailtrap
```

---

## Validações Implementadas

### forgotPasswordValidator
- `email`: string, formato válido de email, normalizado

### resetPasswordValidator
- `token`: string, obrigatório
- `password`: string, mínimo 8 caracteres
- `password_confirmation`: deve ser igual a `password`

---

## Segurança

1. **Token hasheado**: Tokens são hasheados com SHA-256 antes de serem salvos no banco
2. **Expiração**: Tokens expiram em 1 hora
3. **Uso único**: Tokens são marcados como usados após redefinição
4. **Invalidação de tokens antigos**: Ao solicitar nova recuperação, tokens anteriores são invalidados
5. **Logout forçado**: Após redefinição, todos os access tokens são revogados
6. **Sem vazamento de informação**: Endpoint forgot-password sempre retorna sucesso, não revelando se email existe

---

## Estrutura do Email Enviado

O email contém:
- Logo/Título do sistema
- Saudação personalizada com nome do usuário
- Botão "Redefinir Senha" com link
- Informação sobre expiração (1 hora)
- Footer com copyright
- Design responsivo com gradiente roxo/azul

Link gerado: `http://localhost:5173/reset-password?token=TOKEN_RAW`

---

## Arquivos Modificados/Criados

### Novos Arquivos:
- `/app/models/password_reset_token.ts` - Model do token de recuperação
- `/database/migrations/1770840000008_create_password_reset_tokens_table.ts` - Migration

### Arquivos Modificados:
- `/app/validators/auth_validator.ts` - Adicionados forgotPasswordValidator e resetPasswordValidator
- `/app/services/auth_service.ts` - Adicionados métodos forgotPassword, resetPassword e sendResetEmail
- `/app/controllers/auth_controller.ts` - Adicionados métodos forgotPassword e resetPassword
- `/start/routes.ts` - Adicionadas rotas públicas forgot-password e reset-password
- `/.env` - Adicionadas variáveis de SMTP

---

## Troubleshooting

### Erro: "Token inválido ou expirado"
- Verifique se o token não foi usado (`used_at IS NULL`)
- Verifique se não expirou (`expires_at > NOW()`)
- Certifique-se de usar o token RAW, não o hasheado

### Email não enviado
- Verifique configurações de SMTP no `.env`
- Verifique logs do servidor
- Teste conexão SMTP manualmente
- Para desenvolvimento, use MailHog ou Mailtrap

### Erro de validação
- Senha deve ter no mínimo 8 caracteres
- `password_confirmation` deve ser exatamente igual a `password`
- Email deve ser válido

---

## Próximos Passos (Frontend)

No frontend, você precisará implementar:

1. **Página de Solicitar Recuperação** (`/forgot-password`)
   - Formulário com campo email
   - POST para `/api/v1/auth/forgot-password`
   - Mensagem de sucesso informando que email foi enviado

2. **Página de Redefinir Senha** (`/reset-password`)
   - Pegar token da query string (`?token=...`)
   - Formulário com campos password e password_confirmation
   - POST para `/api/v1/auth/reset-password`
   - Redirecionar para login após sucesso

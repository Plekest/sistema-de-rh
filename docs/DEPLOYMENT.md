# Deployment - Sistema de RH

Este documento descreve o processo de instalacao, configuracao, backup e deploy do Sistema de RH em ambientes de desenvolvimento e producao.

## Pre-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** 20+ (recomendado: 20.11.0 LTS ou superior)
- **PostgreSQL** 15+ (banco de dados relacional)
- **Redis** (opcional, para cache e sessoes)
- **Git** (para clonar o repositorio)
- **Docker** e **Docker Compose** (opcional, para ambiente local com containers)

### Verificando versoes

```bash
node -v       # Deve retornar v20.x.x ou superior
npm -v        # Deve retornar 10.x.x ou superior
psql --version  # Deve retornar 15.x ou superior
git --version
```

## Instalacao

### 1. Clone o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd sistema-de-rh
```

### 2. Instale as dependencias

O projeto usa npm workspaces. Um unico comando instala todas as dependencias do backend e frontend:

```bash
npm install
```

### 3. Configure o banco de dados

#### Opcao A: Usando Docker (recomendado para desenvolvimento)

O projeto inclui um `docker-compose.yml` configurado com PostgreSQL, Redis e pgAdmin:

```bash
docker-compose up -d
```

Isso ira iniciar:
- PostgreSQL na porta 5432
- Redis na porta 6379
- pgAdmin na porta 5050 (http://localhost:5050)

#### Opcao B: PostgreSQL local

Se preferir usar PostgreSQL instalado localmente:

1. Crie o banco de dados:

```bash
psql -U postgres
CREATE DATABASE sistema_rh_dev;
\q
```

2. Configure as credenciais no arquivo `.env` (passo 4).

### 4. Configure as variaveis de ambiente

#### Backend

Copie o arquivo de exemplo e configure:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configuracoes:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3333

# Gerar com: node ace generate:key
APP_KEY=<SERA_GERADO_NO_PROXIMO_PASSO>

# Banco de dados
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=sistema_rh_dev

# Redis (opcional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Gere a chave de criptografia da aplicacao:

```bash
node ace generate:key
```

Copie a chave gerada e cole no campo `APP_KEY` do arquivo `.env`.

#### Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3333/api/v1
```

### 5. Execute as migrations

As migrations criam todas as tabelas necessarias no banco de dados:

```bash
cd backend
node ace migration:run
```

### 6. Popule o banco com dados iniciais

#### Criar usuario administrador

Obrigatorio para acessar o sistema:

```bash
node ace db:seed --files=admin_seeder.ts
```

Isso cria um usuario admin padrao:
- Email: `admin@sistema-rh.com`
- Senha: `Admin@123`

**IMPORTANTE**: Altere a senha apos o primeiro login em producao.

#### (Opcional) Dados de demonstracao

Para ambiente de desenvolvimento, voce pode popular o banco com dados de exemplo:

```bash
node ace db:seed --files=demo_seeder.ts
```

Isso cria:
- Departamentos e cargos
- Colaboradores de exemplo
- Usuarios de teste
- Registros de ponto
- Documentos

### 7. Inicie o servidor de desenvolvimento

#### Backend

```bash
cd backend
node ace serve --watch
```

O backend estara disponivel em: http://localhost:3333

#### Frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

O frontend estara disponivel em: http://localhost:5173

### 8. Acesse o sistema

Abra o navegador em http://localhost:5173 e faca login com:
- Email: `admin@sistema-rh.com`
- Senha: `Admin@123`

## Backup e Restore

### Estrategia de Backup

O sistema armazena dados criticos de RH (colaboradores, ponto, folha, documentos). Por isso, e fundamental manter backups regulares do banco PostgreSQL.

### Backup Manual

#### Backup completo do banco

```bash
pg_dump -U postgres -d sistema_rh_prod -F c -f backup_$(date +%Y%m%d).dump
```

Parametros:
- `-U postgres`: Usuario do PostgreSQL
- `-d sistema_rh_prod`: Nome do banco de dados
- `-F c`: Formato custom (comprimido e flexivel)
- `-f backup_YYYYMMDD.dump`: Arquivo de saida com data

#### Backup de tabelas especificas

```bash
pg_dump -U postgres -d sistema_rh_prod -t employees -t users -F c -f backup_critical_$(date +%Y%m%d).dump
```

#### Backup em SQL (texto legivel)

```bash
pg_dump -U postgres -d sistema_rh_prod -F p -f backup_$(date +%Y%m%d).sql
```

### Restore (Restauracao)

#### Restore completo

```bash
# Opcao 1: Usando pg_restore (para formato custom)
pg_restore -U postgres -d sistema_rh_prod -c backup_20260214.dump

# Opcao 2: Usando psql (para formato SQL)
psql -U postgres -d sistema_rh_prod < backup_20260214.sql
```

Parametros:
- `-c`: Limpa (DROP) objetos antes de criar (cuidado!)
- Para evitar perda de dados, considere criar um banco novo antes:

```bash
# Criar banco temporario para testar restore
createdb -U postgres sistema_rh_restore_test
pg_restore -U postgres -d sistema_rh_restore_test backup_20260214.dump
```

#### Restore parcial (apenas dados, sem estrutura)

```bash
pg_restore -U postgres -d sistema_rh_prod --data-only backup_20260214.dump
```

#### Restore de tabelas especificas

```bash
pg_restore -U postgres -d sistema_rh_prod -t employees -t users backup_20260214.dump
```

### Backup Automatizado (Producao)

#### Usando Cron (Linux/macOS)

Edite o crontab:

```bash
crontab -e
```

Adicione as seguintes linhas:

```cron
# Backup diario as 2h da manha
0 2 * * * pg_dump -U postgres -d sistema_rh_prod -F c -f /backups/sistema_rh_$(date +\%Y\%m\%d).dump

# Backup semanal aos domingos as 3h (com retencao de 30 dias)
0 3 * * 0 pg_dump -U postgres -d sistema_rh_prod -F c -f /backups/weekly/sistema_rh_$(date +\%Y\%m\%d).dump

# Limpeza: remove backups com mais de 30 dias
0 4 * * * find /backups -name "*.dump" -mtime +30 -delete
```

**Observacoes**:
- Certifique-se de que o usuario do cron tem permissao para acessar o PostgreSQL (configure `.pgpass` ou variaveis de ambiente)
- O diretorio `/backups` deve existir e ter permissoes adequadas
- Considere armazenar backups em disco separado ou na nuvem (AWS S3, Google Cloud Storage)

#### Script de backup automatizado

Crie um script `backup.sh`:

```bash
#!/bin/bash

# Configuracoes
DB_NAME="sistema_rh_prod"
DB_USER="postgres"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar diretorio se nao existir
mkdir -p $BACKUP_DIR

# Executar backup
echo "Iniciando backup em $DATE..."
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/backup_$DATE.dump

# Verificar sucesso
if [ $? -eq 0 ]; then
    echo "Backup concluido com sucesso: $BACKUP_DIR/backup_$DATE.dump"

    # Limpar backups antigos
    echo "Removendo backups com mais de $RETENTION_DAYS dias..."
    find $BACKUP_DIR -name "backup_*.dump" -mtime +$RETENTION_DAYS -delete
else
    echo "ERRO: Backup falhou!"
    exit 1
fi
```

Torne o script executavel e agende no cron:

```bash
chmod +x backup.sh
crontab -e
# Adicione: 0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### Backup de Arquivos (Documentos)

O sistema armazena documentos de colaboradores em `backend/storage/uploads`. Faca backup deste diretorio regularmente:

```bash
# Compactar e fazer backup dos uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/storage/uploads/

# Sincronizar com storage remoto (exemplo com rsync)
rsync -avz backend/storage/uploads/ user@backup-server:/backups/uploads/
```

## Deploy em Producao

### 1. Preparacao do ambiente

#### Instale Node.js 20+

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifique
node -v
npm -v
```

#### Instale PostgreSQL 15+

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Inicie o servico
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Clone e configure o projeto

```bash
cd /var/www
git clone <URL_DO_REPOSITORIO> sistema-de-rh
cd sistema-de-rh
npm install
```

### 3. Configure variaveis de ambiente (producao)

#### Backend

```bash
cd backend
cp .env.example .env
nano .env
```

Configure para producao:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3333

# IMPORTANTE: Gere uma chave forte
APP_KEY=<GERAR_COM_node_ace_generate:key>

# Banco de dados (credenciais de producao)
DB_CONNECTION=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=sistema_rh_user
DB_PASSWORD=<SENHA_FORTE_AQUI>
DB_DATABASE=sistema_rh_prod

# Redis (producao)
REDIS_HOST=localhost
REDIS_PORT=6379
```

Gere a chave:

```bash
node ace generate:key
```

#### Frontend

```bash
cd ../frontend
cp .env.example .env
nano .env
```

Configure a URL da API de producao:

```env
VITE_API_URL=https://api.seudominio.com/api/v1
```

### 4. Prepare o banco de dados

```bash
# Criar usuario e banco
sudo -u postgres psql

CREATE USER sistema_rh_user WITH PASSWORD 'senha_forte_aqui';
CREATE DATABASE sistema_rh_prod OWNER sistema_rh_user;
GRANT ALL PRIVILEGES ON DATABASE sistema_rh_prod TO sistema_rh_user;
\q

# Executar migrations
cd /var/www/sistema-de-rh/backend
node ace migration:run

# Criar admin inicial
node ace db:seed --files=admin_seeder.ts
```

### 5. Build do frontend

```bash
cd /var/www/sistema-de-rh/frontend
npm run build
```

Isso gera os arquivos estaticos em `frontend/dist/`.

### 6. Build do backend

```bash
cd /var/www/sistema-de-rh/backend
node ace build
```

Isso gera a versao compilada em `backend/build/`.

### 7. Iniciar em producao

#### Usando PM2 (recomendado)

Instale o PM2:

```bash
sudo npm install -g pm2
```

Inicie o backend:

```bash
cd /var/www/sistema-de-rh/backend
pm2 start build/bin/server.js --name sistema-rh-api
pm2 save
pm2 startup
```

#### Usando systemd

Crie um arquivo de servico:

```bash
sudo nano /etc/systemd/system/sistema-rh.service
```

Conteudo:

```ini
[Unit]
Description=Sistema RH API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sistema-de-rh/backend
ExecStart=/usr/bin/node build/bin/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Inicie o servico:

```bash
sudo systemctl daemon-reload
sudo systemctl start sistema-rh
sudo systemctl enable sistema-rh
sudo systemctl status sistema-rh
```

### 8. Configure Nginx (Reverse Proxy)

Instale o Nginx:

```bash
sudo apt install nginx
```

Crie a configuracao:

```bash
sudo nano /etc/nginx/sites-available/sistema-rh
```

Conteudo:

```nginx
server {
    listen 80;
    server_name seudominio.com;

    # Frontend (arquivos estaticos)
    location / {
        root /var/www/sistema-de-rh/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API (reverse proxy para backend)
    location /api/ {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/sistema-rh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Configure SSL/HTTPS (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### 10. Verificacao final

Acesse:
- Frontend: https://seudominio.com
- API: https://seudominio.com/api/v1/health (se houver endpoint de health check)

## Monitoramento e Logs

### Logs do Backend

#### PM2

```bash
pm2 logs sistema-rh-api
pm2 logs sistema-rh-api --lines 100
```

#### Systemd

```bash
sudo journalctl -u sistema-rh -f
```

### Logs do Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitoramento de Recursos

```bash
# PM2
pm2 monit

# Status do PostgreSQL
sudo systemctl status postgresql
```

## Atualizacoes

### Deploy de nova versao

```bash
cd /var/www/sistema-de-rh

# Backup do banco antes de atualizar
pg_dump -U sistema_rh_user -d sistema_rh_prod -F c -f backup_pre_update_$(date +%Y%m%d).dump

# Puxar mudancas
git pull origin main

# Instalar dependencias
npm install

# Executar migrations (se houver novas)
cd backend
node ace migration:run

# Build backend
node ace build

# Build frontend
cd ../frontend
npm run build

# Reiniciar servico
pm2 restart sistema-rh-api
# OU
sudo systemctl restart sistema-rh
```

## Troubleshooting

### Backend nao inicia

1. Verifique logs: `pm2 logs` ou `journalctl -u sistema-rh`
2. Verifique variaveis de ambiente no `.env`
3. Verifique conectividade com o banco: `psql -U sistema_rh_user -d sistema_rh_prod`

### Erro ao conectar no banco

1. Verifique se o PostgreSQL esta rodando: `sudo systemctl status postgresql`
2. Verifique credenciais no `.env`
3. Verifique `pg_hba.conf` (autenticacao do PostgreSQL)

### Frontend nao carrega

1. Verifique se o Nginx esta rodando: `sudo systemctl status nginx`
2. Verifique logs: `sudo tail -f /var/log/nginx/error.log`
3. Verifique se o build foi gerado: `ls frontend/dist`

### Migrations falham

1. Verifique se o usuario tem permissoes: `GRANT ALL PRIVILEGES ON DATABASE sistema_rh_prod TO sistema_rh_user;`
2. Reverta a ultima migration: `node ace migration:rollback`
3. Execute novamente: `node ace migration:run`

## Seguranca

### Checklist de Seguranca

- [ ] Alterar senha do admin padrao apos primeiro login
- [ ] Usar senhas fortes para banco de dados
- [ ] Configurar firewall (UFW) permitindo apenas portas necessarias (80, 443, 22)
- [ ] Configurar SSL/HTTPS com certificado valido
- [ ] Manter sistema operacional atualizado: `sudo apt update && sudo apt upgrade`
- [ ] Restringir acesso SSH (chaves publicas, desabilitar root login)
- [ ] Configurar backups automatizados e testados
- [ ] Monitorar logs regularmente

## Suporte

Para duvidas ou problemas:
- Consulte `docs/ARCHITECTURE.md` para detalhes de arquitetura
- Consulte `CLAUDE.md` para convencoes de codigo
- Abra uma issue no repositorio

---

**Ultima atualizacao**: 2026-02-14

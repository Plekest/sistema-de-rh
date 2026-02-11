# Plano de Ação - Correções e Melhorias

## Sistema de RH - Roadmap de Qualidade

---

## FASE 1: CORREÇÕES CRÍTICAS (Semana 1)

### Objetivo
Corrigir os 5 bugs críticos que impedem produção.

### Tarefas

#### Dia 1-2: Cálculos Financeiros
- [ ] **Implementar correção BUG-001**: Cálculo INSS fallback
  - Arquivo: `/backend/app/services/payroll_service.ts`
  - Tempo estimado: 2h
  - Responsável: Backend Dev
  - Validação: Executar testes unitários criados

- [ ] **Implementar correção BUG-002**: Cálculo INSS tabela dinâmica
  - Arquivo: `/backend/app/services/payroll_service.ts`
  - Tempo estimado: 2h
  - Responsável: Backend Dev
  - Validação: Executar testes unitários criados

- [ ] **Criar script de validação de cálculos**
  - Arquivo: Novo comando `node ace test:payroll`
  - Tempo estimado: 2h
  - Responsável: Backend Dev
  - Validação: Rodar 20+ casos de teste

#### Dia 3: Segurança
- [ ] **Implementar correção BUG-003**: Remover senha hardcoded
  - Criar: `/backend/app/utils/password_generator.ts`
  - Atualizar: `/backend/app/services/employee_service.ts`
  - Criar migration: `add_must_change_password_to_users`
  - Tempo estimado: 3h
  - Responsável: Backend Dev
  - Validação: Testar criação de colaborador

- [ ] **Implementar sistema de envio de email** (opcional)
  - Configurar mailer
  - Criar template de senha
  - Tempo estimado: 4h
  - Responsável: Backend Dev

#### Dia 4: Conversão de Dados
- [ ] **Implementar correção BUG-004**: Helper de conversão decimal
  - Criar: `/backend/app/utils/number_helper.ts`
  - Atualizar: Todos os services com conversão `Number()`
  - Tempo estimado: 3h
  - Responsável: Backend Dev
  - Validação: Rodar testes e verificar logs

#### Dia 5: Concorrência
- [ ] **Implementar correção BUG-005**: Lock no cálculo de folha
  - Arquivo: `/backend/app/services/payroll_service.ts`
  - Tempo estimado: 3h
  - Responsável: Backend Dev
  - Validação: Testar cálculo simultâneo (2 browsers)

- [ ] **Implementar correção BUG-007**: Validar benefício VT ativo
  - Arquivo: `/backend/app/services/payroll_service.ts`
  - Tempo estimado: 30min
  - Responsável: Backend Dev
  - Validação: Testar desconto VT com benefício cancelado

### Entregáveis Semana 1
- ✅ 5 bugs críticos corrigidos
- ✅ Testes unitários passando 100%
- ✅ Script de validação de cálculos
- ✅ Documentação de alterações

### Critérios de Aceitação
- Todos os testes unitários passando
- Cálculos validados manualmente com calculadora
- Code review aprovado
- Sem regressão em funcionalidades existentes

---

## FASE 2: BUGS DE ALTA PRIORIDADE (Semana 2)

### Objetivo
Corrigir bugs que afetam operação e dados.

### Tarefas

#### Dia 6-7: Validações de Dados
- [ ] **Implementar BUG-008**: Validação CPF/CNPJ duplicado
  - Arquivo: `/backend/app/services/employee_service.ts`
  - Tempo estimado: 2h
  - Validação: Testar criação de colaborador com CPF duplicado

- [ ] **Implementar BUG-012**: Validação email duplicado em employees
  - Arquivo: `/backend/app/services/employee_service.ts`
  - Tempo estimado: 1h
  - Validação: Testar criação de colaborador com email duplicado

#### Dia 8-9: Validações de Férias
- [ ] **Implementar BUG-006**: Validação de datas de férias
  - Arquivo: `/backend/app/services/leave_service.ts`
  - Tempo estimado: 2h
  - Validação: Testar datas inválidas

- [ ] **Implementar BUG-009**: Validar saldo antes de aprovar férias
  - Arquivo: `/backend/app/services/leave_service.ts`
  - Tempo estimado: 2h
  - Validação: Testar aprovação sem saldo

#### Dia 10: Tratamento de Erros
- [ ] **Implementar BUG-011**: Melhorar tratamento de erro ao registrar histórico
  - Arquivos: Múltiplos services
  - Tempo estimado: 3h
  - Validação: Verificar logs quando histórico falha

- [ ] **Implementar logging estruturado**
  - Configurar Winston/Pino
  - Substituir console.log
  - Tempo estimado: 4h

### Entregáveis Semana 2
- ✅ 6 bugs de alta prioridade corrigidos
- ✅ Sistema de logging estruturado
- ✅ Validações de dados completas
- ✅ Testes de integração básicos

---

## FASE 3: BUGS DE MÉDIA PRIORIDADE (Semana 3)

### Objetivo
Melhorar qualidade e performance.

### Tarefas

#### Dia 11-12: Performance
- [ ] **Implementar BUG-023**: Processar folha em lotes
  - Já implementado no BUG-005, validar funcionamento
  - Tempo estimado: 1h

- [ ] **Implementar BUG-017**: Adicionar índices no banco
  - Criar migrations para índices
  - Tempo estimado: 2h
  - Validação: Rodar EXPLAIN nas queries

- [ ] **Implementar MELHORIA-002**: Cache de tabelas fiscais
  - Implementar cache em memória
  - Tempo estimado: 3h

#### Dia 13-14: Validações
- [ ] **Implementar BUG-015**: Validação ano/mês
  - Arquivo: `/backend/app/validators/payroll_validator.ts`
  - Tempo estimado: 1h

- [ ] **Implementar BUG-018**: Validação de formato de data
  - Criar regra customizada VineJS
  - Aplicar em todos os validators
  - Tempo estimado: 3h

- [ ] **Implementar BUG-020**: Validação de transições de status
  - Arquivo: `/backend/app/services/employee_service.ts`
  - Tempo estimado: 2h

#### Dia 15: Limpeza de Código
- [ ] **Implementar BUG-028**: Extrair magic numbers para constantes
  - Criar arquivo de constantes
  - Substituir valores hardcoded
  - Tempo estimado: 2h

- [ ] **Implementar BUG-027**: Adicionar comentários
  - Documentar lógica complexa
  - Adicionar JSDoc
  - Tempo estimado: 3h

### Entregáveis Semana 3
- ✅ Performance otimizada
- ✅ Validações completas
- ✅ Código documentado
- ✅ Cache implementado

---

## FASE 4: TESTES E VALIDAÇÃO (Semana 4)

### Objetivo
Garantir qualidade através de testes.

### Tarefas

#### Dia 16-17: Testes de Integração
- [ ] **Criar testes de integração**
  - Fluxo completo: Criar colaborador → Componente → Folha
  - Fluxo férias: Solicitar → Aprovar → Verificar saldo
  - Fluxo benefícios: Criar → Adesão → Calcular desconto
  - Tempo estimado: 8h

#### Dia 18-19: Testes em Staging
- [ ] **Setup ambiente de staging**
  - Clonar banco de produção (sanitizado)
  - Deploy da aplicação
  - Tempo estimado: 4h

- [ ] **Executar testes manuais**
  - Criar 10+ colaboradores
  - Processar folha
  - Gerar contracheques
  - Solicitar férias
  - Tempo estimado: 8h

#### Dia 20: Validação com Especialista
- [ ] **Revisão com contador**
  - Validar cálculos INSS
  - Validar cálculos IRRF
  - Validar regras de férias
  - Tempo estimado: 4h

- [ ] **Correções pós-validação**
  - Ajustes finos
  - Tempo estimado: 4h

### Entregáveis Semana 4
- ✅ Suite de testes completa
- ✅ Validação em staging
- ✅ Aprovação de especialista
- ✅ Documentação final

---

## FASE 5: MELHORIAS (Backlog)

### Prioridade Média
- [ ] Implementar auditoria completa
- [ ] Implementar rate limiting
- [ ] Implementar healthcheck
- [ ] Documentação Swagger
- [ ] Relatórios em PDF

### Prioridade Baixa
- [ ] Refatoração de nomenclatura
- [ ] Feature flags
- [ ] Sistema de notificações
- [ ] Backup automático

---

## RECURSOS NECESSÁRIOS

### Equipe
- **1 Backend Developer** (full-time, 4 semanas)
- **1 QA Analyst** (part-time, semanas 2-4)
- **1 Contador/Especialista** (consultor, 4-8h semana 4)

### Infraestrutura
- Ambiente de desenvolvimento
- Ambiente de staging
- Servidor de testes
- Banco de dados de testes

### Ferramentas
- Sistema de versionamento (Git)
- CI/CD pipeline
- Sistema de logs (Winston/Pino)
- Sistema de monitoramento (opcional)

---

## MÉTRICAS DE SUCESSO

### Qualidade de Código
- [ ] Cobertura de testes > 80%
- [ ] 0 bugs críticos
- [ ] 0 bugs de alta prioridade
- [ ] < 5 bugs de média prioridade

### Performance
- [ ] Cálculo de folha < 30s para 100 colaboradores
- [ ] APIs respondendo < 500ms
- [ ] Sem race conditions
- [ ] Sem N+1 queries

### Segurança
- [ ] 0 senhas hardcoded
- [ ] Todas as senhas hashadas
- [ ] Rate limiting implementado
- [ ] Auditoria de alterações

### Validação
- [ ] Cálculos validados por contador
- [ ] Testes em staging 100% bem-sucedidos
- [ ] Feedback positivo de usuários beta
- [ ] 0 regressões em funcionalidades existentes

---

## RISCOS E MITIGAÇÃO

### Risco 1: Cálculos Incorretos Passarem Despercebidos
**Probabilidade:** Média
**Impacto:** Alto
**Mitigação:**
- Criar suite extensa de testes
- Validar com contador/especialista
- Testar com dados reais em staging por 2 semanas

### Risco 2: Regressão em Funcionalidades Existentes
**Probabilidade:** Média
**Impacto:** Médio
**Mitigação:**
- Testes de regressão antes de deploy
- Code review rigoroso
- Deploy incremental

### Risco 3: Performance Degradada com Grande Volume
**Probabilidade:** Baixa
**Impacto:** Alto
**Mitigação:**
- Testes de carga com 1000+ colaboradores
- Implementar cache
- Processar em background

### Risco 4: Atraso no Cronograma
**Probabilidade:** Média
**Impacto:** Médio
**Mitigação:**
- Buffer de 1 semana no cronograma
- Priorizar bugs críticos e altos
- Backlog para melhorias de baixa prioridade

---

## CRONOGRAMA RESUMIDO

| Semana | Fase | Foco | Entregáveis |
|--------|------|------|-------------|
| 1 | Crítica | Bugs críticos | 5 bugs corrigidos |
| 2 | Alta | Validações | 6 bugs corrigidos |
| 3 | Média | Performance | Otimizações |
| 4 | Testes | Validação | Aprovação final |

**Total:** 4 semanas (20 dias úteis)

---

## PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana
1. ✅ Ler relatório de QA completo (`QA_REPORT.md`)
2. ✅ Revisar correções críticas (`CRITICAL_FIXES.md`)
3. ✅ Priorizar tarefas com equipe
4. ✅ Setup ambiente de desenvolvimento
5. ✅ Começar implementação BUG-001 e BUG-002

### Próxima Semana
1. Finalizar bugs críticos
2. Executar testes unitários
3. Iniciar bugs de alta prioridade
4. Setup ambiente de staging

---

## DOCUMENTAÇÃO CRIADA

✅ **QA_REPORT.md** - Relatório completo de bugs (600+ linhas)
✅ **QA_SUMMARY.md** - Resumo executivo
✅ **CRITICAL_FIXES.md** - Correções prontas para implementar
✅ **ACTION_PLAN.md** - Este plano de ação
✅ **Testes unitários** - 3 arquivos com 130+ test cases

---

## CONTATO E SUPORTE

### Arquivos Importantes
```
/docs/
├── QA_REPORT.md          # Relatório completo
├── QA_SUMMARY.md         # Resumo executivo
├── CRITICAL_FIXES.md     # Correções prontas
└── ACTION_PLAN.md        # Este arquivo

/backend/tests/unit/services/
├── payroll_service.spec.ts    # 60+ testes
├── leave_service.spec.ts      # 40+ testes
└── employee_service.spec.ts   # 30+ testes
```

### Comandos Úteis
```bash
# Executar testes
node ace test

# Executar apenas testes unitários
node ace test --tests=unit

# Executar com cobertura
node ace test --coverage

# Executar migrations
node ace migration:run

# Criar backup do banco
pg_dump -U postgres sistema_rh > backup.sql
```

---

**Elaborado por:** QA Agent
**Data:** 2026-02-11
**Versão:** 1.0
**Status:** PRONTO PARA EXECUÇÃO

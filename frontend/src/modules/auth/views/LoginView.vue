<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const mounted = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(): boolean {
  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha todos os campos'
    return false
  }
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Email inválido'
    return false
  }
  if (password.value.length < 6) {
    errorMessage.value = 'Senha deve ter no mínimo 6 caracteres'
    return false
  }
  return true
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    await authStore.login({
      email: email.value,
      password: password.value
    })
  } catch (error: any) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Erro ao fazer login. Tente novamente.'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  setTimeout(() => { mounted.value = true }, 50)
})
</script>

<template>
  <div class="login-page">
    <!-- Painel esquerdo - Branding -->
    <div class="login-brand" :class="{ 'animate-in': mounted }">
      <div class="brand-content">
        <div class="brand-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
            <circle cx="32" cy="22" r="9" stroke="white" stroke-width="2.5" fill="none" />
            <path d="M16 50c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <circle cx="48" cy="18" r="5" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none" />
            <path d="M40 38c0-4.418 3.582-8 8-8s8 3.582 8 38" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="brand-title">Sistema de RH</h1>
        <p class="brand-subtitle">Gestão de Recursos Humanos</p>

        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span>Gestão de Colaboradores</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span>Férias e Ausências</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span>Folha de Pagamento</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span>Avaliação de Desempenho</span>
          </div>
        </div>
      </div>

      <!-- Elementos decorativos -->
      <div class="brand-decoration">
        <div class="deco-circle deco-1"></div>
        <div class="deco-circle deco-2"></div>
        <div class="deco-circle deco-3"></div>
      </div>
    </div>

    <!-- Painel direito - Formulário -->
    <div class="login-form-panel">
      <div class="login-card" :class="{ 'animate-in': mounted }">
        <div class="login-header">
          <!-- Logo mobile -->
          <div class="mobile-logo">
            <div class="mobile-logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="40" height="40" rx="10" fill="#667eea" />
                <circle cx="20" cy="14" r="5.5" stroke="white" stroke-width="2" fill="none" />
                <path d="M10 32c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" />
              </svg>
            </div>
            <span class="mobile-logo-text">Sistema de RH</span>
          </div>

          <h2>Bem-vindo de volta</h2>
          <p>Faça login para acessar o sistema</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form" novalidate>
          <!-- Erro -->
          <Transition name="shake">
            <div v-if="errorMessage" class="error-alert" role="alert">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{{ errorMessage }}</span>
              <button type="button" class="error-close" @click="errorMessage = ''" aria-label="Fechar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </Transition>

          <!-- Email -->
          <div class="field">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                :disabled="isSubmitting"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <!-- Senha -->
          <div class="field">
            <div class="field-header">
              <label for="password">Senha</label>
              <RouterLink to="/forgot-password" class="forgot-link">Esqueceu a senha?</RouterLink>
            </div>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua senha"
                :disabled="isSubmitting"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                tabindex="-1"
              >
                <!-- Olho aberto -->
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <!-- Olho fechado -->
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-login" :disabled="isSubmitting">
            <svg v-if="isSubmitting" class="spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span v-if="!isSubmitting">Entrar</span>
            <span v-else>Entrando...</span>
            <svg v-if="!isSubmitting" class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <div class="login-footer">
          <p>&copy; {{ new Date().getFullYear() }} Sistema de RH &mdash; Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== Layout ========== */
.login-page {
  min-height: 100vh;
  display: flex;
  background: #f0f2f5;
}

/* ========== Painel Esquerdo - Branding ========== */
.login-brand {
  flex: 0 0 45%;
  background: linear-gradient(135deg, #667eea 0%, #5a55d2 50%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 3rem;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-brand.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.brand-content {
  position: relative;
  z-index: 2;
  color: white;
  max-width: 400px;
}

.brand-icon {
  width: 72px;
  height: 72px;
  margin-bottom: 2rem;
}

.brand-icon svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 3rem;
  font-weight: 400;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  font-size: 0.95rem;
  opacity: 0.9;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 20px;
  height: 20px;
}

/* Decoracao */
.brand-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.deco-1 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -60px;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
}

.deco-2 {
  width: 200px;
  height: 200px;
  bottom: -40px;
  left: -40px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}

.deco-3 {
  width: 120px;
  height: 120px;
  top: 50%;
  right: 10%;
  border: 2px solid rgba(255, 255, 255, 0.06);
}

/* ========== Painel Direito - Formulário ========== */
.login-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 440px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
}

.login-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* ========== Header ========== */
.login-header {
  margin-bottom: 2rem;
}

.mobile-logo {
  display: none;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.mobile-logo-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.mobile-logo-icon svg {
  width: 100%;
  height: 100%;
}

.mobile-logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
}

.login-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.375rem;
  letter-spacing: -0.01em;
}

.login-header p {
  font-size: 0.95rem;
  color: #718096;
}

/* ========== Form ========== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
}

/* Erro */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #c53030;
  font-size: 0.875rem;
  animation: shake 0.4s ease;
}

.error-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: #e53e3e;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  transition: background 0.15s;
}

.error-close:hover {
  background: rgba(197, 48, 48, 0.1);
}

.error-close svg {
  width: 16px;
  height: 16px;
  stroke: #c53030;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
}

.forgot-link {
  font-size: 0.813rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.forgot-link:hover {
  color: #5a55d2;
  text-decoration: underline;
}

/* Input wrapper */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  width: 18px;
  height: 18px;
  stroke: #a0aec0;
  pointer-events: none;
  transition: stroke 0.2s;
}

.input-wrapper:focus-within .input-icon {
  stroke: #667eea;
}

.input-wrapper input {
  width: 100%;
  padding: 0.8125rem 1rem 0.8125rem 2.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #1a202c;
  background: white;
  outline: none;
  transition: all 0.2s;
}

.input-wrapper input::placeholder {
  color: #cbd5e0;
}

.input-wrapper input:hover:not(:disabled) {
  border-color: #cbd5e0;
}

.input-wrapper input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

.input-wrapper input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Toggle password */
.toggle-password {
  position: absolute;
  right: 0.625rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.toggle-password:hover {
  background: #f7fafc;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
  stroke: #a0aec0;
}

/* ========== Submit Button ========== */
.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.25s;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
}

.btn-login:hover:not(:disabled)::before {
  opacity: 1;
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.arrow-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s;
}

.btn-login:hover:not(:disabled) .arrow-icon {
  transform: translateX(3px);
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== Footer ========== */
.login-footer {
  text-align: center;
  margin-top: 2.5rem;
}

.login-footer p {
  font-size: 0.75rem;
  color: var(--color-text-muted, #718096);
}

/* ========== Transitions ========== */
.shake-enter-active {
  animation: shake 0.4s ease;
}

.shake-leave-active {
  transition: all 0.2s ease;
}

.shake-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== Responsividade ========== */
@media (max-width: 1024px) {
  .login-brand {
    flex: 0 0 40%;
    padding: 2rem;
  }

  .brand-title {
    font-size: 1.875rem;
  }

  .brand-subtitle {
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .login-brand {
    display: none;
  }

  .login-form-panel {
    min-height: 100vh;
    background: linear-gradient(180deg, #f0f2f5 0%, #e8ecf4 100%);
    padding: 1.5rem;
  }

  .mobile-logo {
    display: flex;
  }

  .login-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    max-width: 420px;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }

  .login-footer {
    margin-top: 2rem;
  }
}

@media (max-width: 480px) {
  .login-form-panel {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .login-card {
    padding: 1.5rem;
  }

  .login-header h2 {
    font-size: 1.375rem;
  }

  .field-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .btn-login {
    padding: 0.75rem 1.25rem;
    font-size: 0.9375rem;
  }
}
</style>

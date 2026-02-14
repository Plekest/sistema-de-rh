<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import authService from '@/modules/auth/services/auth.service'

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const mounted = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(): boolean {
  if (!email.value) {
    errorMessage.value = 'Por favor, informe seu email'
    return false
  }
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Email inválido'
    return false
  }
  return true
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  try {
    isSubmitting.value = true
    await authService.forgotPassword({ email: email.value })

    successMessage.value = 'Se o email existir no sistema, um link de recuperação será enviado.'
    email.value = ''
  } catch (error: any) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Erro ao solicitar recuperação. Tente novamente.'
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
  <div class="forgot-password-page">
    <!-- Painel esquerdo - Branding -->
    <div class="forgot-brand" :class="{ 'animate-in': mounted }">
      <div class="brand-content">
        <div class="brand-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)" />
            <rect x="18" y="26" width="28" height="20" rx="2" stroke="white" stroke-width="2.5" fill="none" />
            <path d="M24 26V20c0-4.418 3.582-8 8-8s8 3.582 8 8v6" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <circle cx="32" cy="36" r="2.5" fill="white" />
            <line x1="32" y1="38.5" x2="32" y2="42" stroke="white" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="brand-title">Recuperação de Senha</h1>
        <p class="brand-subtitle">Vamos ajudá-lo a recuperar o acesso</p>

        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <span>Link enviado por email</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span>Processo seguro</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span>Link válido por 1 hora</span>
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
    <div class="forgot-form-panel">
      <div class="forgot-card" :class="{ 'animate-in': mounted }">
        <div class="forgot-header">
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

          <h2>Esqueceu sua senha?</h2>
          <p>Informe seu email para receber o link de recuperação</p>
        </div>

        <form @submit.prevent="handleSubmit" class="forgot-form" novalidate>
          <!-- Sucesso -->
          <Transition name="fade">
            <div v-if="successMessage" class="success-alert" role="alert">
              <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>{{ successMessage }}</span>
            </div>
          </Transition>

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

          <!-- Submit -->
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <svg v-if="isSubmitting" class="spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span v-if="!isSubmitting">Enviar link de recuperação</span>
            <span v-else>Enviando...</span>
          </button>

          <!-- Back to login -->
          <div class="back-link">
            <RouterLink to="/login">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Voltar para o login</span>
            </RouterLink>
          </div>
        </form>

        <div class="forgot-footer">
          <p>&copy; {{ new Date().getFullYear() }} Sistema de RH &mdash; Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== Layout ========== */
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  background: var(--color-bg-page);
}

/* ========== Painel Esquerdo - Branding ========== */
.forgot-brand {
  flex: 0 0 45%;
  background: var(--color-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: var(--space-24);
  opacity: 0;
  transform: translateX(-30px);
  transition: var(--transition-entrance);
}

.forgot-brand.animate-in {
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
  margin-bottom: var(--space-16);
}

.brand-icon svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-4);
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.8;
  margin-bottom: var(--space-24);
  font-weight: var(--font-weight-normal);
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  font-size: var(--font-size-md);
  opacity: 0.9;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl);
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
  border: var(--border-width) solid rgba(255, 255, 255, 0.1);
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
  border: var(--border-width-thick) solid rgba(255, 255, 255, 0.06);
}

/* ========== Painel Direito - Formulário ========== */
.forgot-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
}

.forgot-card {
  width: 100%;
  max-width: 440px;
  opacity: 0;
  transform: translateY(20px);
  transition: var(--transition-entrance) 0.15s;
}

.forgot-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* ========== Header ========== */
.forgot-header {
  margin-bottom: var(--space-16);
}

.mobile-logo {
  display: none;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-16);
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
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.forgot-header h2 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  letter-spacing: -0.01em;
}

.forgot-header p {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}

/* ========== Form ========== */
.forgot-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

/* Sucesso */
.success-alert {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  background: var(--color-success-light);
  border: var(--border-width) solid var(--color-success-lighter);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-8);
  color: var(--color-success-darker);
  font-size: var(--font-size-base);
}

.success-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: var(--color-success);
}

.fade-enter-active,
.fade-leave-active {
  transition: var(--transition-slow);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Erro */
.error-alert {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  background: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger-lighter);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-8);
  color: var(--color-danger-dark);
  font-size: var(--font-size-base);
  animation: shake 0.4s ease;
}

.error-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: var(--color-danger);
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-xs);
  display: flex;
  transition: var(--transition-fast);
}

.error-close:hover {
  background: rgba(197, 48, 48, 0.1);
}

.error-close svg {
  width: 16px;
  height: 16px;
  stroke: var(--color-danger-dark);
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
  gap: var(--space-4);
}

.field label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

/* Input wrapper */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-6);
  width: 18px;
  height: 18px;
  stroke: var(--color-text-placeholder);
  pointer-events: none;
  transition: var(--transition-base);
}

.input-wrapper:focus-within .input-icon {
  stroke: var(--color-primary);
}

.input-wrapper input {
  width: 100%;
  padding: var(--input-padding-y) var(--space-8) var(--input-padding-y) 2.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  background: var(--color-bg-input);
  outline: none;
  transition: var(--transition-base);
}

.input-wrapper input::placeholder {
  color: var(--color-text-disabled);
}

.input-wrapper input:hover:not(:disabled) {
  border-color: var(--color-border-hover);
}

.input-wrapper input:focus {
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.input-wrapper input:disabled {
  background: var(--color-bg-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

/* ========== Submit Button ========== */
.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-6) var(--space-12);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-spring);
  margin-top: var(--space-4);
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: var(--transition-spring);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-lg);
}

.btn-submit:hover:not(:disabled)::before {
  opacity: 1;
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-primary);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

/* ========== Back Link ========== */
.back-link {
  text-align: center;
  margin-top: var(--space-4);
}

.back-link a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-base);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.back-link a:hover {
  color: var(--color-primary-darker);
  background: rgba(102, 126, 234, 0.06);
}

.back-link svg {
  width: 16px;
  height: 16px;
  transition: var(--transition-fast);
}

.back-link a:hover svg {
  transform: translateX(-2px);
}

/* ========== Footer ========== */
.forgot-footer {
  text-align: center;
  margin-top: var(--space-20);
}

.forgot-footer p {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* ========== Transitions ========== */
.shake-enter-active {
  animation: shake 0.4s ease;
}

.shake-leave-active {
  transition: var(--transition-base);
}

.shake-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== Responsividade ========== */
@media (max-width: 1024px) {
  .forgot-brand {
    flex: 0 0 40%;
    padding: var(--space-16);
  }

  .brand-title {
    font-size: 1.875rem;
  }

  .brand-subtitle {
    margin-bottom: var(--space-16);
  }
}

@media (max-width: 768px) {
  .forgot-password-page {
    flex-direction: column;
  }

  .forgot-brand {
    display: none;
  }

  .forgot-form-panel {
    min-height: 100vh;
    background: linear-gradient(180deg, var(--color-bg-page) 0%, #e8ecf4 100%);
    padding: var(--space-12);
  }

  .mobile-logo {
    display: flex;
  }

  .forgot-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-3xl);
    padding: var(--space-16);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    max-width: 420px;
  }

  .forgot-header h2 {
    font-size: var(--font-size-3xl);
  }

  .forgot-footer {
    margin-top: var(--space-16);
  }
}

@media (max-width: 480px) {
  .forgot-form-panel {
    padding: var(--space-8);
    align-items: flex-start;
    padding-top: var(--space-16);
  }

  .forgot-card {
    padding: var(--space-12);
  }

  .forgot-header h2 {
    font-size: var(--font-size-2xl);
  }

  .btn-submit {
    padding: var(--space-6) var(--space-10);
    font-size: var(--font-size-md);
  }
}
</style>

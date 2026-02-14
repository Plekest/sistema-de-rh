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
  background: #f0f2f5;
}

/* ========== Painel Esquerdo - Branding ========== */
.forgot-brand {
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
.forgot-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.forgot-card {
  width: 100%;
  max-width: 440px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
}

.forgot-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* ========== Header ========== */
.forgot-header {
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

.forgot-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.375rem;
  letter-spacing: -0.01em;
}

.forgot-header p {
  font-size: 0.95rem;
  color: #718096;
}

/* ========== Form ========== */
.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
}

/* Sucesso */
.success-alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #166534;
  font-size: 0.875rem;
}

.success-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: #16a34a;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
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

.field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
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

/* ========== Submit Button ========== */
.btn-submit {
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

.btn-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.25s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
}

.btn-submit:hover:not(:disabled)::before {
  opacity: 1;
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
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
  margin-top: 0.5rem;
}

.back-link a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.15s;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
}

.back-link a:hover {
  color: #5a55d2;
  background: rgba(102, 126, 234, 0.06);
}

.back-link svg {
  width: 16px;
  height: 16px;
  transition: transform 0.15s;
}

.back-link a:hover svg {
  transform: translateX(-2px);
}

/* ========== Footer ========== */
.forgot-footer {
  text-align: center;
  margin-top: 2.5rem;
}

.forgot-footer p {
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
  .forgot-brand {
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
  .forgot-password-page {
    flex-direction: column;
  }

  .forgot-brand {
    display: none;
  }

  .forgot-form-panel {
    min-height: 100vh;
    background: linear-gradient(180deg, #f0f2f5 0%, #e8ecf4 100%);
    padding: 1.5rem;
  }

  .mobile-logo {
    display: flex;
  }

  .forgot-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    max-width: 420px;
  }

  .forgot-header h2 {
    font-size: 1.5rem;
  }

  .forgot-footer {
    margin-top: 2rem;
  }
}

@media (max-width: 480px) {
  .forgot-form-panel {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .forgot-card {
    padding: 1.5rem;
  }

  .forgot-header h2 {
    font-size: 1.375rem;
  }

  .btn-submit {
    padding: 0.75rem 1.25rem;
    font-size: 0.9375rem;
  }
}
</style>

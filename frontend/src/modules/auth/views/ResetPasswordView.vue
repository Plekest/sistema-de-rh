<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import authService from '@/modules/auth/services/auth.service'

const route = useRoute()

const token = computed(() => route.query.token as string | undefined)

const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const mounted = ref(false)

const hasToken = computed(() => !!token.value)

function validateForm(): boolean {
  if (!password.value || !passwordConfirmation.value) {
    errorMessage.value = 'Preencha todos os campos'
    return false
  }
  if (password.value.length < 8) {
    errorMessage.value = 'Senha deve ter no mínimo 8 caracteres'
    return false
  }
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As senhas não coincidem'
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
    await authService.resetPassword({
      token: token.value!,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })

    successMessage.value = 'Senha redefinida com sucesso!'
    password.value = ''
    passwordConfirmation.value = ''
  } catch (error: any) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Erro ao redefinir senha. Tente novamente.'
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
  <div class="reset-password-page">
    <!-- Painel esquerdo - Branding -->
    <div class="reset-brand" :class="{ 'animate-in': mounted }">
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
        <h1 class="brand-title">Nova Senha</h1>
        <p class="brand-subtitle">Defina uma nova senha segura</p>

        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span>Mínimo de 8 caracteres</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Senha criptografada</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span>Acesso imediato após redefinir</span>
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
    <div class="reset-form-panel">
      <div class="reset-card" :class="{ 'animate-in': mounted }">
        <div class="reset-header">
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

          <h2>Redefinir senha</h2>
          <p>Digite sua nova senha abaixo</p>
        </div>

        <!-- Se não tiver token -->
        <div v-if="!hasToken" class="error-state">
          <svg class="error-state-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="32" cy="32" r="28" />
            <line x1="40" y1="24" x2="24" y2="40" />
            <line x1="24" y1="24" x2="40" y2="40" />
          </svg>
          <h3>Link inválido</h3>
          <p>O link de recuperação de senha é inválido ou expirou.</p>
          <div class="error-actions">
            <RouterLink to="/forgot-password" class="btn-primary">
              Solicitar novo link
            </RouterLink>
            <RouterLink to="/login" class="btn-secondary">
              Voltar para o login
            </RouterLink>
          </div>
        </div>

        <!-- Se tiver token: formulário -->
        <form v-else @submit.prevent="handleSubmit" class="reset-form" novalidate>
          <!-- Sucesso -->
          <Transition name="fade">
            <div v-if="successMessage" class="success-alert" role="alert">
              <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>{{ successMessage }}</span>
            </div>
          </Transition>

          <!-- Erro -->
          <Transition name="shake">
            <div v-if="errorMessage" class="error-alert" role="alert">
              <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

          <!-- Nova Senha -->
          <div class="field">
            <label for="password">Nova Senha</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua nova senha"
                :disabled="isSubmitting"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                tabindex="-1"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <span class="field-hint">Mínimo de 8 caracteres</span>
          </div>

          <!-- Confirmar Senha -->
          <div class="field">
            <label for="password-confirmation">Confirmar Nova Senha</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password-confirmation"
                v-model="passwordConfirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                placeholder="Digite novamente sua senha"
                :disabled="isSubmitting"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
                :aria-label="showPasswordConfirmation ? 'Ocultar senha' : 'Mostrar senha'"
                tabindex="-1"
              >
                <svg v-if="!showPasswordConfirmation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit ou Link para login se sucesso -->
          <button v-if="!successMessage" type="submit" class="btn-submit" :disabled="isSubmitting">
            <svg v-if="isSubmitting" class="spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span v-if="!isSubmitting">Redefinir senha</span>
            <span v-else>Redefinindo...</span>
          </button>

          <RouterLink v-else to="/login" class="btn-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>Ir para o Login</span>
          </RouterLink>

          <!-- Back to login -->
          <div v-if="!successMessage" class="back-link">
            <RouterLink to="/login">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Voltar para o login</span>
            </RouterLink>
          </div>
        </form>

        <div class="reset-footer">
          <p>&copy; {{ new Date().getFullYear() }} Sistema de RH &mdash; Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== Layout ========== */
.reset-password-page {
  min-height: 100vh;
  display: flex;
  background: var(--color-bg-page);
}

/* ========== Painel Esquerdo - Branding ========== */
.reset-brand {
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

.reset-brand.animate-in {
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
.reset-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
}

.reset-card {
  width: 100%;
  max-width: 440px;
  opacity: 0;
  transform: translateY(20px);
  transition: var(--transition-entrance) 0.15s;
}

.reset-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* ========== Header ========== */
.reset-header {
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

.reset-header h2 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  letter-spacing: -0.01em;
}

.reset-header p {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}

/* ========== Error State ========== */
.error-state {
  text-align: center;
  padding: var(--space-16) var(--space-8);
}

.error-state-icon {
  width: 80px;
  height: 80px;
  stroke: var(--color-danger);
  margin: 0 auto var(--space-12);
}

.error-state h3 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.error-state p {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
  margin-bottom: var(--space-16);
  line-height: var(--line-height-normal);
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-12);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-spring);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-lg);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-12);
  background: var(--color-bg-card);
  color: var(--color-primary);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-primary);
  background: rgba(102, 126, 234, 0.04);
}

/* ========== Form ========== */
.reset-form {
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

.field-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: calc(-1 * var(--space-2));
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
  padding: var(--input-padding-y) 2.75rem var(--input-padding-y) 2.75rem;
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

/* Toggle password */
.toggle-password {
  position: absolute;
  right: var(--space-5);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.toggle-password:hover {
  background: var(--color-bg-hover);
}

.toggle-password svg {
  width: 18px;
  height: 18px;
  stroke: var(--color-text-placeholder);
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

/* Success button */
.btn-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-6) var(--space-12);
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-spring);
  margin-top: var(--space-4);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.35);
}

.btn-success svg {
  width: 20px;
  height: 20px;
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
.reset-footer {
  text-align: center;
  margin-top: var(--space-20);
}

.reset-footer p {
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
  .reset-brand {
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
  .reset-password-page {
    flex-direction: column;
  }

  .reset-brand {
    display: none;
  }

  .reset-form-panel {
    min-height: 100vh;
    background: linear-gradient(180deg, var(--color-bg-page) 0%, #e8ecf4 100%);
    padding: var(--space-12);
  }

  .mobile-logo {
    display: flex;
  }

  .reset-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-3xl);
    padding: var(--space-16);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    max-width: 420px;
  }

  .reset-header h2 {
    font-size: var(--font-size-3xl);
  }

  .reset-footer {
    margin-top: var(--space-16);
  }
}

@media (max-width: 480px) {
  .reset-form-panel {
    padding: var(--space-8);
    align-items: flex-start;
    padding-top: var(--space-16);
  }

  .reset-card {
    padding: var(--space-12);
  }

  .reset-header h2 {
    font-size: var(--font-size-2xl);
  }

  .btn-submit,
  .btn-success {
    padding: var(--space-6) var(--space-10);
    font-size: var(--font-size-md);
  }
}
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-code">404</div>
      <h1 class="error-title">Página não encontrada</h1>
      <p class="error-description">
        A página que você está procurando não existe ou foi movida.
      </p>
      <button class="btn-home" @click="goHome">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Voltar ao Dashboard</span>
      </button>
    </div>

    <!-- Decoração -->
    <div class="decoration" aria-hidden="true">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-page);
  padding: var(--space-16);
  position: relative;
  overflow: hidden;
}

.not-found-container {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--space-8);
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.error-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
  letter-spacing: -0.01em;
}

.error-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  margin-bottom: var(--space-20);
  line-height: var(--line-height-relaxed);
}

.btn-home {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-12);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-spring);
  box-shadow: var(--shadow-md);
  min-height: 44px;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-lg);
}

.btn-home:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.btn-home:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Decoração de fundo */
.decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  top: -200px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: var(--color-secondary);
  bottom: -150px;
  left: -100px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: var(--color-primary);
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
}

/* Responsividade */
@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  .error-title {
    font-size: var(--font-size-2xl);
  }

  .error-description {
    font-size: var(--font-size-base);
  }

  .circle-1,
  .circle-2,
  .circle-3 {
    opacity: 0.03;
  }
}

@media (max-width: 480px) {
  .not-found-page {
    padding: var(--space-12);
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: var(--font-size-xl);
  }

  .btn-home {
    padding: var(--space-5) var(--space-10);
    font-size: var(--font-size-sm);
  }
}
</style>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard">
    <div class="welcome-card">
      <h1>Bem-vindo ao Sistema de RH</h1>
      <p class="welcome-message">
        Olá, <strong>{{ authStore.user?.fullName }}</strong>!
      </p>
      <p class="user-details">
        Você está logado como
        <span class="role-badge" :class="authStore.user?.role">
          {{ authStore.user?.role }}
        </span>
      </p>
    </div>

    <div class="info-message">
      <p>
        Este é o painel principal do sistema. Use o menu lateral para navegar entre os módulos.
      </p>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-card h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.welcome-message {
  font-size: 1.125rem;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
}

.welcome-message strong {
  color: #667eea;
}

.user-details {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-left: 0.5rem;
}

.role-badge.admin {
  background-color: #fed7d7;
  color: #c53030;
}

.role-badge.manager {
  background-color: #bee3f8;
  color: #2c5282;
}

.role-badge.employee {
  background-color: #c6f6d5;
  color: #22543d;
}

.info-message {
  background: #edf2f7;
  border-left: 4px solid #667eea;
  border-radius: 6px;
  padding: 1rem 1.5rem;
}

.info-message p {
  margin: 0;
  color: #4a5568;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 2rem 1.5rem;
  }

  .welcome-card h1 {
    font-size: 1.5rem;
  }

  .welcome-message {
    font-size: 1rem;
  }
}
</style>

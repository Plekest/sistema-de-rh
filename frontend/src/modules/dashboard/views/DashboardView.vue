<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AdminHomeView from './AdminHomeView.vue'
import EmployeeHomeView from './EmployeeHomeView.vue'

const authStore = useAuthStore()
</script>

<template>
  <AdminHomeView v-if="authStore.isAdmin || authStore.isManager" />
  <EmployeeHomeView v-else />
</template>

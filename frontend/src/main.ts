import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

/**
 * Inicializa o store de autenticação antes de montar a aplicação
 * Verifica se há token salvo e tenta restaurar a sessão
 */
const authStore = useAuthStore()
authStore.initialize().finally(() => {
  app.mount('#app')
})

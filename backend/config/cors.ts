import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // Permite apenas requisições do frontend em desenvolvimento
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173', // Frontend Vue.js em desenvolvimento
      'http://localhost:3000', // Frontend alternativo
    ]

    // Em desenvolvimento, aceita qualquer origem local
    if (process.env.NODE_ENV === 'development') {
      return allowedOrigins.includes(origin || '') || origin?.startsWith('http://localhost')
    }

    return allowedOrigins.includes(origin || '')
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig

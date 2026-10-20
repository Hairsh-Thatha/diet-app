import 'dotenv/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    // Prefer Nuxt-prefixed deployment variables; keep the existing .env names working locally.
    databaseUrl: process.env.NUXT_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim(),
    aiApiKey: process.env.NUXT_AI_API_KEY?.trim() || process.env.AI_API_KEY?.trim(),
    aiModel: process.env.NUXT_AI_MODEL?.trim() || process.env.AI_MODEL?.trim() || 'gpt-4o-mini',
    public: { appName: 'NutriArc' },
  },
  // Let Nuxt/Vercel choose the correct Nitro deployment preset for the target environment.
  typescript: { strict: true },
})

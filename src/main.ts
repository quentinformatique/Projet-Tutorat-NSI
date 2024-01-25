import { ViteSSG } from 'vite-ssg'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'
import type { UserModule } from './types'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import './styles/layout.css'
import './styles/info.css'
import './styles/planning.css'
import 'uno.css'
import { defineRedirect } from './logic/data/auth/auth-manager'
import generatedRoutes from '~pages'

const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.(ctx))
  },
)

defineRedirect()
export const isLoading = ref(false)
export const toggleLoadingPage = (force?: boolean) => {
  isLoading.value = force === undefined ? !isLoading.value : force
}

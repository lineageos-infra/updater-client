import type { RouteLocationNormalized } from 'vue-router'
import { useUiStore } from '@/stores/ui'

export const beforeTryError =
  (fn: (to: RouteLocationNormalized, from: RouteLocationNormalized) => Promise<void>) =>
  async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    const store = useUiStore()
    try {
      await fn(to, from)
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        store.setError(err.message)
      } else {
        store.setError('An unknown error occurred')
      }
      return { name: 'error' }
    }
  }

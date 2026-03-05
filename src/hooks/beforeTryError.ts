import type { RouteLocationNormalized } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { isAxiosError } from 'axios'

export const beforeTryError =
  (fn: (to: RouteLocationNormalized, from: RouteLocationNormalized) => Promise<void>) =>
  async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    const store = useUiStore()
    try {
      await fn(to, from)
    } catch (err: unknown) {
      console.error(err)
      if (isAxiosError(err)) {
        store.setError(err.response?.data?.error || err.message)
      } else if (err instanceof Error) {
        store.setError(err.message)
      } else {
        store.setError('An unknown error occurred')
      }
      return { name: 'error' }
    }
  }

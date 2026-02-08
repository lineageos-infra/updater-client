import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { isAxiosError } from 'axios'

export const beforeTryError =
  (
    fn: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => Promise<void>
  ) =>
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const store = useUiStore()
    try {
      await fn(to, from, next)
      next()
    } catch (err: unknown) {
      console.error(err)
      if (isAxiosError(err)) {
        store.setError(err.response?.data?.error || err.message)
      } else if (err instanceof Error) {
        store.setError(err.message)
      } else {
        store.setError('An unknown error occurred')
      }
      next({
        name: 'error'
      })
    }
  }

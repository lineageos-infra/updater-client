import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useUiStore } from '@/stores/ui'

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
    } catch (err: any) {
      console.error(err)
      store.setError(err.response?.data?.error || err.message)
      next({
        name: 'error'
      })
    }
  }

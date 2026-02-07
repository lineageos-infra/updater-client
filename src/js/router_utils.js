import { useUiStore } from '@/stores/ui'

export const beforeTryError = (fn) => async (to, from, next) => {
  const store = useUiStore()
  try {
    await fn(to, from, next)
    next()
  } catch (err) {
    console.error(err)
    store.setError(err.response?.data?.error || err.message)
    next({
      name: 'error'
    })
  }
}

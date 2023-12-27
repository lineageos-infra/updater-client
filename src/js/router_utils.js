import store from '../store'

export const beforeTryError = (fn) => async (to, from, next) => {
  try {
    await fn(to, from, next)
    next()
  } catch (err) {
    console.error(err)
    store.commit('setError', err.response?.data?.error || err.message)
    next({
      name: 'error'
    })
  }
}

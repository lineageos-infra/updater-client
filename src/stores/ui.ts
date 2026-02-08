import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({ error: undefined as string | undefined, ongoingRequests: 0 }),
  actions: {
    setError(error: string | undefined) {
      this.error = error
    },
    startRequest() {
      this.ongoingRequests++
    },
    endRequest() {
      this.ongoingRequests = Math.max(0, this.ongoingRequests - 1)
    }
  }
})

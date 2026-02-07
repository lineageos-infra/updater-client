import { defineStore } from 'pinia'

export const useChangeStore = defineStore('change', {
  state: () => ({ page: -1, items: [] }),
  actions: {
    addNextChangesPage(changes) {
      this.items = Array.from(new Set([...this.items, ...changes]))
      this.page++
    }
  }
})

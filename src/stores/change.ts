import { defineStore } from 'pinia'

export type Change = {
  branch: string
  project: string
  repository: string
  subject: string
  submitted: number
  type: string
  updated: number
  url: string
}

export const useChangeStore = defineStore('change', {
  state: () => ({ page: -1, items: [] as Change[] }),
  actions: {
    addNextChangesPage(changes: Change[]) {
      this.items = Array.from(new Set([...this.items, ...changes]))
      this.page++
    }
  }
})

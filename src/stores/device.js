import { defineStore } from 'pinia'

export const useDeviceStore = defineStore('device', {
  state: () => ({ oems: [], devices: {}, builds: {} }),
  actions: {
    setOems(oems) {
      this.oems = oems
    },
    setDevice(payload) {
      this.devices[payload.model] = payload.data
    },
    setDeviceBuilds(payload) {
      this.builds[payload.model] = payload.data
    }
  },
  getters: {
    getDevice: (state) => (model) => {
      return state.devices[model]
    },
    getDeviceBuilds: (state) => (model) => {
      return state.builds[model]
    }
  }
})

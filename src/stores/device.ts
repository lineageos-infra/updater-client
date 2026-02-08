import { defineStore } from 'pinia'

export type OemDevice = {
  model: string
  name: string
  selected?: boolean
  hidden?: boolean
}

export type Oem = {
  devices: OemDevice[]
  name: string
  forceExpanded?: boolean
  hidden?: boolean
}

export type Device = {
  dependencies: string[]
  info_url: string
  model: string
  name: string
  oem: string
  versions: string[]
}

export type BuildFile = {
  filename: string
  filepath: string
  sha1: string
  sha256: string
  size: number
  url: string
  date?: string
  datetime?: number
  type?: string
  os_patch_level?: string
}

export type Build = {
  date: string
  datetime: number
  files: BuildFile[]
  os_patch_level: string
  type: string
  version: string
}

export const useDeviceStore = defineStore('device', {
  state: () => ({
    oems: [] as Oem[],
    devices: {} as Record<string, Device>,
    builds: {} as Record<string, Build[]>
  }),
  actions: {
    setOems(oems: Oem[]) {
      this.oems = oems
    },
    setDevice(payload: { model: string; data: Device }) {
      this.devices[payload.model] = payload.data
    },
    setDeviceBuilds(payload: { model: string; data: Build[] }) {
      this.builds[payload.model] = payload.data
    }
  },
  getters: {
    getDevice: (state) => (model: string) => {
      return state.devices[model]
    },
    getDeviceBuilds: (state) => (model: string) => {
      return state.builds[model]
    }
  }
})

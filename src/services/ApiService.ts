import axios from 'axios'
import { useDeviceStore, type Build, type Device, type Oem } from '../stores/device'
import { useChangeStore, type Change } from '../stores/change'
import { useUiStore } from '../stores/ui'

export type ChangeGroupBuild = {
  filename: string
  datetime: number
  version: string
}

export type ChangeGroup = {
  build: ChangeGroupBuild
  items: Change[]
}

const API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME

export default class ApiService {
  static sortOems(oems: Oem[]) {
    const nameSortFn = (first: { name: string }, second: { name: string }) => {
      return first.name.localeCompare(second.name)
    }

    oems.sort(nameSortFn)

    for (const oem of oems) {
      oem.devices.sort(nameSortFn)
    }
  }

  static async loadOems() {
    const uiStore = useUiStore()
    const deviceStore = useDeviceStore()
    try {
      uiStore.startRequest()
      const response = await axios.get(`${API_HOSTNAME}api/v2/oems`)
      this.sortOems(response.data)
      deviceStore.setOems(response.data)
      uiStore.endRequest()
    } catch (err) {
      uiStore.endRequest()
      throw err
    }
  }

  static async loadDevice(model: string) {
    const uiStore = useUiStore()
    const deviceStore = useDeviceStore()
    try {
      uiStore.startRequest()
      const response = await axios.get(`${API_HOSTNAME}api/v2/devices/${model}`)
      deviceStore.setDevice({
        model,
        data: response.data
      })
      uiStore.endRequest()
    } catch (err) {
      uiStore.endRequest()
      throw err
    }
  }

  static sortDeviceBuilds(builds: Build[], newestFirst = true) {
    const sortFn = newestFirst
      ? (first: Build, second: Build) => second.datetime - first.datetime
      : (first: Build, second: Build) => first.datetime - second.datetime

    builds.sort(sortFn)
  }

  static async loadDeviceBuilds(model: string) {
    const uiStore = useUiStore()
    const deviceStore = useDeviceStore()
    try {
      uiStore.startRequest()
      const response = await axios.get(`${API_HOSTNAME}api/v2/devices/${model}/builds`)

      this.sortDeviceBuilds(response.data)

      deviceStore.setDeviceBuilds({
        model,
        data: response.data
      })
      uiStore.endRequest()
    } catch (err) {
      uiStore.endRequest()
      throw err
    }
  }

  static changeSubmittedCompare(first: Change, second: Change) {
    return second.submitted - first.submitted
  }

  static filterChanges(changes: Change[]) {
    const filteredChanges = []

    for (const change of changes) {
      if (change.subject === 'Automatic translation import') {
        continue
      }

      filteredChanges.push(change)
    }

    return filteredChanges
  }

  static async loadMoreChanges(minPages = -1) {
    const uiStore = useUiStore()
    const changeStore = useChangeStore()
    const page = changeStore.page + 1
    if (minPages !== -1 && page >= minPages) {
      return
    }

    try {
      uiStore.startRequest()
      const response = await axios.get(`${API_HOSTNAME}api/v2/changes`, {
        params: {
          page
        }
      })

      const changes = this.filterChanges(response.data)
      changeStore.addNextChangesPage(changes)
      uiStore.endRequest()
    } catch (err) {
      uiStore.endRequest()
      throw err
    }
  }

  static isChangeForVersions(change: Change, versions: string[]) {
    for (const version of versions) {
      if (change.branch.includes(version)) {
        return true
      }

      if (['20.0', '21.0'].includes(version) && change.branch.includes(version.split('.')[0]!)) {
        return true
      }
    }

    return versions.length === 0
  }

  static isDeviceSpecificChange(change: Change) {
    return change.type === 'device specific'
  }

  static isAndroidRepository(change: Change) {
    return change.repository.startsWith('android_')
  }

  static isChangeForDependencies(change: Change, dependencies: string[]) {
    if (!this.isAndroidRepository(change)) {
      return false
    }

    if (!this.isDeviceSpecificChange(change)) {
      return true
    }

    return dependencies.includes(change.repository)
  }

  static filterDeviceChanges(device: Device, changes: Change[]) {
    const filteredChanges = []

    for (const change of changes) {
      if (!this.isChangeForVersions(change, device.versions)) {
        continue
      }

      if (!this.isChangeForDependencies(change, device.dependencies)) {
        continue
      }

      filteredChanges.push(change)
    }

    return filteredChanges
  }

  static conditionalExtract<T>(items: T[], fn: (item: T) => boolean): T[] {
    const extractedItems: T[] = []

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!
      if (!fn(item)) {
        continue
      }

      extractedItems.push(item)
      items.splice(i, 1)
    }

    return extractedItems
  }

  static conditionalInsertOne<T>(items: T[], newItem: T, compareFn: (a: T, b: T) => number) {
    for (let i = 0; i < items.length; i++) {
      const result = compareFn(newItem, items[i]!)
      if (result <= 0) {
        items.splice(i, 0, newItem)
        return
      }
    }

    items.push(newItem)
  }

  static conditionalInsertMany<T>(items: T[], newItems: T[], compareFn: (a: T, b: T) => number) {
    for (const newChange of newItems) {
      this.conditionalInsertOne(items, newChange, compareFn)
    }
  }

  static extractBumpedChanges(changes: Change[]) {
    return this.conditionalExtract(changes, (change) => {
      return change.updated > change.submitted
    })
  }

  static extractBuildChanges(build: ChangeGroupBuild, changes: Change[]) {
    return this.conditionalExtract(changes, (change) => {
      return change.submitted <= build.datetime && this.isChangeForVersions(change, [build.version])
    })
  }

  static insertChangesIntoGroups(
    changes: Change[],
    changesGroups: ChangeGroup[],
    checkIfHasAny = false
  ) {
    for (const changesGroup of changesGroups) {
      const newChanges = this.extractBuildChanges(changesGroup.build, changes)
      if (checkIfHasAny && changesGroup.items.length === 0) {
        continue
      }

      this.conditionalInsertMany(
        changesGroup.items,
        newChanges,
        this.changeSubmittedCompare.bind(this)
      )
    }
  }

  static createChangesGroups(builds: Build[], versions: string[]): ChangeGroup[] {
    const buildsChanges: ChangeGroup[] = []
    builds = builds.slice()

    this.sortDeviceBuilds(builds, false)

    for (const build of builds) {
      buildsChanges.push({
        build: {
          filename: build.files[0]?.filename ?? '',
          datetime: build.datetime,
          version: build.version
        },
        items: []
      })
    }

    buildsChanges.push({
      build: {
        filename: 'next',
        datetime: Number.MAX_SAFE_INTEGER,
        version: versions.reduce((a, b) => {
          return parseFloat(a) > parseFloat(b) ? a : b
        }, '')
      },
      items: []
    })

    return buildsChanges
  }

  static getDeviceChanges(model: string) {
    const deviceStore = useDeviceStore()
    const changeStore = useChangeStore()
    const device = deviceStore.getDevice(model)
    if (!device) {
      throw new Error('Failed to get device-main data')
    }

    const builds = deviceStore.getDeviceBuilds(model)
    if (!builds) {
      throw new Error('Failed to get device-main builds-tab')
    }

    const changes = this.filterDeviceChanges(device, changeStore.items)
    const bumpedChanges = this.extractBumpedChanges(changes)

    const changesGroups = this.createChangesGroups(builds, device.versions)

    this.insertChangesIntoGroups(changes, changesGroups)
    this.insertChangesIntoGroups(bumpedChanges, changesGroups, true)

    return changesGroups.reverse()
  }
}

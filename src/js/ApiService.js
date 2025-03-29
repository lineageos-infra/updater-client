import store from '../store'
import axios from 'axios'
import { API_HOSTNAME } from './config'

export default class ApiService {
  static sortOems(oems) {
    const nameSortFn = (first, second) => {
      return first.name.localeCompare(second.name)
    }

    oems.sort(nameSortFn)

    for (const oem of oems) {
      oem.devices.sort(nameSortFn)
    }
  }

  static async loadOems() {
    try {
      store.commit('startRequest')
      const response = await axios.get(`${API_HOSTNAME}api/v2/oems`)
      this.sortOems(response.data)
      store.commit('setOems', response.data)
      store.commit('endRequest')
    } catch (err) {
      store.commit('endRequest')
      throw err
    }
  }

  static async loadDevice(model) {
    try {
      store.commit('startRequest')
      const response = await axios.get(`${API_HOSTNAME}api/v2/devices/${model}`)
      store.commit('setDevice', {
        model,
        data: response.data
      })
      store.commit('endRequest')
    } catch (err) {
      store.commit('endRequest')
      throw err
    }
  }

  static sortDeviceBuilds(builds, newestFirst = true) {
    let sortFn
    if (newestFirst) {
      sortFn = (first, second) => second.datetime - first.datetime
    } else {
      sortFn = (first, second) => first.datetime - second.datetime
    }

    builds.sort(sortFn)
  }

  static async loadDeviceBuilds(model) {
    try {
      store.commit('startRequest')
      const response = await axios.get(`${API_HOSTNAME}api/v2/devices/${model}/builds`)

      this.sortDeviceBuilds(response.data)

      store.commit('setDeviceBuilds', {
        model,
        data: response.data
      })
      store.commit('endRequest')
    } catch (err) {
      store.commit('endRequest')
      throw err
    }
  }

  static changeSubmittedCompare(first, second) {
    return second.submitted - first.submitted
  }

  static filterChanges(changes) {
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
    const page = store.getters.changesPage + 1
    if (minPages !== -1 && page >= minPages) {
      return
    }

    try {
      store.commit('startRequest')
      const response = await axios.get(`${API_HOSTNAME}api/v2/changes`, {
        params: {
          page
        }
      })

      const changes = this.filterChanges(response.data)
      store.commit('addNextChangesPage', changes)
      store.commit('endRequest')
    } catch (err) {
      store.commit('endRequest')
      throw err
    }
  }

  static isChangeForVersions(change, versions) {
    for (const version of versions) {
      if (change.branch.includes(version)) {
        return true
      }

      if (['20.0', '21.0'].includes(version) && change.branch.includes(version.split('.')[0])) {
        return true
      }
    }

    return versions.length === 0
  }

  static isDeviceSpecificChange(change) {
    return change.type === 'device specific'
  }

  static isAndroidRepository(change) {
    return change.repository.startsWith('android_')
  }

  static isChangeForDependencies(change, dependencies) {
    if (!this.isAndroidRepository(change)) {
      return false
    }

    if (!this.isDeviceSpecificChange(change)) {
      return true
    }

    return dependencies.includes(change.repository)
  }

  static filterDeviceChanges(device, changes) {
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

  static conditionalExtract(items, fn) {
    const extractedItems = []

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      if (!fn(item)) {
        continue
      }

      extractedItems.push(item)
      items.splice(i, 1)
    }

    return extractedItems
  }

  static conditionalInsertOne(items, newItem, compareFn) {
    for (let i = 0; i < items.length; i++) {
      const result = compareFn(newItem, items[i])
      if (result <= 0) {
        items.splice(i, 0, newItem)
        return
      }
    }

    items.push(newItem)
  }

  static conditionalInsertMany(items, newItems, compareFn) {
    for (const newChange of newItems) {
      this.conditionalInsertOne(items, newChange, compareFn)
    }
  }

  static extractBumpedChanges(changes) {
    return this.conditionalExtract(changes, (change) => {
      return change.updated > change.submitted
    })
  }

  static extractBuildChanges(build, changes) {
    return this.conditionalExtract(changes, (change) => {
      return change.submitted <= build.datetime && this.isChangeForVersions(change, [build.version])
    })
  }

  static insertChangesIntoGroups(changes, changesGroups, checkIfHasAny = false) {
    for (const changesGroup of changesGroups) {
      const newChanges = this.extractBuildChanges(changesGroup.build, changes)
      if (checkIfHasAny && changesGroup.items.length === 0) {
        continue
      }

      this.conditionalInsertMany(changesGroup.items, newChanges, this.changeSubmittedCompare)
    }
  }

  static createChangesGroups(builds, versions) {
    const buildsChanges = []
    builds = builds.slice()

    this.sortDeviceBuilds(builds, false)

    for (const build of builds) {
      buildsChanges.push({
        build: {
          filename: build.files[0].filename,
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

  static getDeviceChanges(model) {
    const device = store.getters.getDevice(model)
    if (!device) {
      throw new Error('Failed to get device-main data')
    }

    const builds = store.getters.getDeviceBuilds(model)
    if (!builds) {
      throw new Error('Failed to get device-main builds-tab')
    }

    const changes = this.filterDeviceChanges(device, store.getters.changes)
    const bumpedChanges = this.extractBumpedChanges(changes)

    const changesGroups = this.createChangesGroups(builds, device.versions)

    this.insertChangesIntoGroups(changes, changesGroups)
    this.insertChangesIntoGroups(bumpedChanges, changesGroups, true)

    return changesGroups.reverse()
  }
}

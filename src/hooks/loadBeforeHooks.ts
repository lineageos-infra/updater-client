import { beforeTryError } from './beforeTryError'
import ApiService from '@/services/ApiService'

export const loadDeviceBeforeHook = beforeTryError((to) => {
  return ApiService.loadDevice(to.params.model as string)
})

export const loadDeviceBuildsBeforeHook = beforeTryError((to) => {
  return ApiService.loadDeviceBuilds(to.params.model as string)
})

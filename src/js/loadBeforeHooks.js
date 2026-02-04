import { beforeTryError } from './router_utils'
import ApiService from './ApiService'

export const loadDeviceBeforeHook = beforeTryError((to) => {
  return ApiService.loadDevice(to.params.model)
})

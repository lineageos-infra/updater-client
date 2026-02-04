<template>
  <div class="device-main flex flex-col">
    <NavBar :tabs="tabs">
      <template v-slot:left>
        <span class="oem">{{ oem }}</span>
        <i class="mdi mdi-chevron-right arrow mx-2 h-6"></i>
        <span class="name">{{ name }}</span>
        <span class="model mx-2 text-base opacity-50">{{ model }}</span>
      </template>
    </NavBar>

    <div class="grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<script>
import NavBar from '../components/navbar/NavBar.vue'
import ApiService from '../js/ApiService'
import { beforeTryError } from '../js/router_utils'

const loadDeviceBeforeHook = beforeTryError((to) => {
  return ApiService.loadDevice(to.params.model)
})

export default {
  name: 'DeviceView',
  components: {
    NavBar
  },
  props: {
    model: String
  },
  data() {
    return {
      info_url: '',
      name: '',
      oem: ''
    }
  },
  beforeRouteEnter: loadDeviceBeforeHook,
  beforeRouteUpdate: loadDeviceBeforeHook,
  watch: {
    model() {
      this.loadDeviceDetails()
    }
  },
  computed: {
    tabs() {
      return [
        {
          to: 'home_index',
          label: 'Home',
          icon: 'mdi mdi-exit-to-app'
        },
        {
          to: {
            name: 'device_builds',
            params: {
              model: this.model
            }
          },
          label: 'Builds'
        },
        {
          to: {
            name: 'device_changes',
            params: {
              model: this.model
            }
          },
          label: 'Changes'
        },
        {
          href: this.info_url,
          label: 'Guides & info',
          icon: 'mdi mdi-open-in-new'
        }
      ]
    }
  },
  mounted() {
    this.loadDeviceDetails()
  },
  methods: {
    loadDeviceDetails() {
      const data = this.$store.getters.getDevice(this.model)
      if (!data) {
        throw new Error('Failed to get device-main data')
      }

      ;['info_url', 'name', 'oem'].forEach((k) => (this[k] = data[k]))
    }
  }
}
</script>

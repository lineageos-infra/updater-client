<template>
  <div class="device-main">
    <NavBar>
      <template v-slot:left>
        <span class="oem">{{ oem }}</span>
        <i class="mdi mdi-chevron-right arrow"></i>
        <span class="name">{{ name }}</span>
        <span class="model">{{ model }}</span>
      </template>
      <template v-slot:tabs>
        <router-link
          class="tab"
          v-bind:to="{
            name: 'home_index'
          }"
        >
          Home
          <i class="mdi mdi-exit-to-app"></i>
        </router-link>
        <router-link
          class="tab"
          v-bind:to="{
            name: 'device_builds',
            params: {
              model
            }
          }"
        >
          Builds
        </router-link>
        <router-link
          class="tab"
          v-bind:to="{
            name: 'device_changes',
            params: {
              model
            }
          }"
        >
          Changes
        </router-link>
        <a class="tab" target="_blank" v-bind:href="info_url">
          Guides &amp; info
          <span class="mdi mdi-open-in-new"></span>
        </a>
      </template>
    </NavBar>

    <div class="content">
      <router-view></router-view>
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

<style scoped>
.device-main {
  display: flex;
  flex-direction: column;
}

.device-main .navbar {
  flex-shrink: 0;
}

.device-main .navbar .arrow,
.device-main .navbar .model {
  margin: 0 8px;
}

.device-main .navbar .arrow {
  height: 24px;
}

.device-main .navbar .model {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.5);
}

#app.dark .device-main .navbar .model {
  color: rgba(255, 255, 255, 0.5);
}

.device-main .content {
  flex-grow: 1;
  overflow: auto;
}
</style>

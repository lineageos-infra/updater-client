<template>
  <div class="device-main flex flex-col">
    <NavBar :tabs="tabs">
      <template v-slot:left>
        <span class="oem">{{ oem }}</span>
        <span class="mdi mdi-chevron-right arrow mx-2 h-6"></span>
        <span class="name">{{ name }}</span>
        <span class="model mx-2 text-base opacity-50">{{ model }}</span>
      </template>
    </NavBar>

    <div class="grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import NavBar from '../components/navbar/NavBar.vue'
import { loadDeviceBeforeHook } from '../js/loadBeforeHooks'
import { computed, watch, ref } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  model: String
})

const store = useStore()

const infoUrl = ref('')
const name = ref('')
const oem = ref('')

function loadDeviceDetails() {
  const data = store.getters.getDevice(props.model)
  if (!data) {
    throw new Error('Failed to get device-main data')
  }
  infoUrl.value = data.info_url
  name.value = data.name
  oem.value = data.oem
}

watch(() => props.model, loadDeviceDetails, { immediate: true })

const tabs = computed(() => [
  {
    to: 'home_index',
    label: 'Home',
    icon: 'mdi mdi-exit-to-app'
  },
  {
    to: {
      name: 'device_builds',
      params: {
        model: props.model
      }
    },
    label: 'Builds'
  },
  {
    to: {
      name: 'device_changes',
      params: {
        model: props.model
      }
    },
    label: 'Changes'
  },
  {
    href: infoUrl,
    label: 'Guides & info',
    icon: 'mdi mdi-open-in-new'
  }
])

defineOptions({
  beforeRouteEnter: loadDeviceBeforeHook,
  beforeRouteUpdate: loadDeviceBeforeHook
})
</script>

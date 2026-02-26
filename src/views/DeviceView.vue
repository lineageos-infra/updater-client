<template>
  <div class="flex flex-col">
    <NavBar :tabs="tabs">
      <template #left>
        <span>{{ oem }}</span>
        <MdiIcon :path="mdiChevronRight" :size="18" class="mx-2 h-full" />
        <span>{{ name }}</span>
        <span class="mx-2 text-base opacity-50">{{ model }}</span>
      </template>
    </NavBar>

    <div class="grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from '../components/navbar/NavBar.vue'
import { loadDeviceBeforeHook } from '@/hooks/loadBeforeHooks'
import { computed, watch, ref } from 'vue'
import { useDeviceStore } from '@/stores/device'
import MdiIcon from '@/components/mdi-icon/MdiIcon.vue'
import { mdiChevronRight, mdiExitToApp, mdiOpenInNew } from '@mdi/js'

const props = defineProps<{
  model: string
}>()

const store = useDeviceStore()

const infoUrl = ref('')
const name = ref('')
const oem = ref('')

function loadDeviceDetails() {
  const data = store.getDevice(props.model)
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
    to: 'home_view',
    label: 'Home',
    icon: mdiExitToApp
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
    href: infoUrl.value,
    label: 'Guides & info',
    icon: mdiOpenInNew
  }
])

defineOptions({
  beforeRouteEnter: loadDeviceBeforeHook,
  beforeRouteUpdate: loadDeviceBeforeHook
})
</script>

<template>
  <div class="flex flex-col overflow-auto">
    <div
      class="focus:border-brand-primary relative flex h-16 w-full shrink-0 border-b border-solid border-black/15 text-sm focus:border-b-2 dark:border-white/15"
    >
      <input
        v-model="filterText"
        class="transition-[border 0.125s ease-out] h-full w-full border-0 bg-transparent p-4 outline-0"
        type="text"
        placeholder="Search..."
      />
      <span
        v-if="filterText"
        class="mdi mdi-close clear absolute top-4 right-4 block h-8 w-8 cursor-pointer text-2xl leading-8 opacity-35"
        @click="clearFilterText"
      ></span>
    </div>
    <div class="h-full grow overflow-auto">
      <DeviceOem v-for="oem in oems" v-bind="oem" :key="oem.name" />
    </div>
  </div>
</template>

<script setup>
import ApiService from '@/services/ApiService'
import DeviceOem from './DeviceOem.vue'
import { ref, computed, onBeforeMount, watch } from 'vue'
import { useDeviceStore } from '@/stores/device'

const props = defineProps({
  activeModel: String
})
const store = useDeviceStore()
const filterText = ref('')
const oems = computed(() => store.oems)

onBeforeMount(async () => {
  try {
    await ApiService.loadOems()
  } catch (err) {
    console.error(err)
  }
})

function clearFilterText() {
  if (filterText.value === '') {
    return false
  }

  filterText.value = ''
  return true
}

function resetFilterDevices() {
  for (const oem of oems.value) {
    oem.forceExpanded = false
    oem.hidden = false
    for (const device of oem.devices) {
      device.hidden = false
      device.selected = false
    }
  }
}

function selectActiveDevice() {
  for (const oem of oems.value) {
    for (const device of oem.devices) {
      if (device.model === props.activeModel) {
        oem.forceExpanded = true
        oem.hidden = false
        device.hidden = false
        device.selected = true
        return
      }
    }
  }
}

function refreshDevices() {
  resetFilterDevices()
  selectActiveDevice()
}

function filterDevices(text) {
  if (!text) {
    refreshDevices()
    return
  }

  resetFilterDevices()

  for (const oem of oems.value) {
    if (oem.name.toLowerCase().includes(text)) {
      oem.forceExpanded = true
      continue
    }

    oem.hidden = true
    for (const device of oem.devices) {
      device.hidden = true

      if (`${oem.name} ${device.name} ${device.model}`.toLowerCase().includes(text)) {
        oem.forceExpanded = true
        oem.hidden = false
        device.hidden = false
      }
    }
  }

  selectActiveDevice()
}

function onFilterChange() {
  filterDevices(filterText.value.toLowerCase())
}

watch(
  () => props.activeModel,
  () => {
    const cleared = clearFilterText()
    if (!cleared) {
      refreshDevices()
    }
  }
)

watch(filterText, () => {
  onFilterChange()
})

watch(oems, () => {
  refreshDevices()
})
</script>

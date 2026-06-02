<template>
  <div class="devices-tab-page flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <DeviceSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '@unhead/vue'
import DeviceSelector from '../device-selector/DeviceSelector.vue'

useSeoMeta({
  title: 'Devices'
})
</script>

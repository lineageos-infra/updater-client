<template>
  <div class="devices-tab-page flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <DeviceSelector />
    </div>
  </div>
</template>

<script setup>
import DeviceSelector from '../device-selector/DeviceSelector.vue'
</script>

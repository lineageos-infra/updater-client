<template>
  <div class="devices-tab-page flex h-full w-full flex-col">
    <div class="h-full w-full grow overflow-auto">
      <DeviceSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeviceSelector from '../device-selector/DeviceSelector.vue'
</script>

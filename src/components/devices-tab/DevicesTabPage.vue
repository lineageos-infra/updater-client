<template>
  <div class="devices-tab-page flex h-full w-full flex-col">
    <div class="h-full w-full flex-grow overflow-y-auto">
      <device-selector class="h-100"></device-selector>
    </div>
  </div>
</template>

<script>
import DeviceSelector from '../device-selector/DeviceSelector.vue'

export default {
  name: 'DevicesTab',
  components: {
    DeviceSelector
  }
}
</script>

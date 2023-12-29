<template>
  <div class="devices-tab-page w-full h-full flex flex-col">
    <div class="flex-grow w-full h-full overflow-auto">
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

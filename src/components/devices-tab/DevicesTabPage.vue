<template>
  <div class="devices-tab-page tab-page">
    <div class="list-container">
      <device-selector class="list"></device-selector>
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

<style scoped>
@import '../../css/tab-page.css';

.devices-tab-page .list {
  height: 100%;
}
</style>

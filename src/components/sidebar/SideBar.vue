<template>
  <div class="sidebar">
    <div class="logo">
      <router-link to="/">
        <img src="../../assets/sidebar-logo.svg" alt="LineageOS Logo" />
      </router-link>
    </div>
    <device-selector v-bind:active-model="activeModel"></device-selector>
  </div>
</template>

<script>
import DeviceSelector from '../device-selector/DeviceSelector.vue'

export default {
  name: 'SideBar',
  components: {
    DeviceSelector
  },
  props: {
    activeModel: String
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;

  position: relative;

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.24);
}

.sidebar .logo {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background: #167c80;

  height: 100px;
}

.sidebar .logo img {
  height: 40px;
}
</style>

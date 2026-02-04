<template>
  <div class="home-main">
    <NavBar>
      <template v-slot:left>
        <span class="text"> All devices </span>
      </template>
      <template v-slot:tabs>
        <router-link
          class="mobile-visible-tab tab"
          :to="{
            name: 'home_devices'
          }"
        >
          Devices
        </router-link>

        <router-link
          class="tab"
          :to="{
            name: 'home_changes'
          }"
        >
          Changes
        </router-link>

        <router-link
          class="tab"
          :to="{
            name: 'home_verify'
          }"
        >
          OTA Verifier
        </router-link>
      </template>
    </NavBar>

    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import NavBar from '../components/navbar/NavBar.vue'

export default {
  name: 'HomeView',
  components: {
    NavBar
  }
}
</script>

<style scoped>
.home-main {
  display: flex;
  flex-direction: column;
}

.home-main .navbar {
  flex-shrink: 0;
}

.home-main .content {
  flex-grow: 1;
  overflow: auto;
}
</style>
